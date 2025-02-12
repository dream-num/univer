/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable ts/no-explicit-any */

import type { Ctor, Dependency, DependencyIdentifier, DocumentDataModel, IDocumentData, Nullable } from '@univerjs/core';
import type { DocumentSkeleton, IRender, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import {
    BooleanNumber,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ILogService,
    Inject,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    LogLevel,
    Plugin,
    RxDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService, DocStateEmitService } from '@univerjs/docs';

import { DocumentViewModel, IRenderManagerService } from '@univerjs/engine-render';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { DocIMEInputManagerService } from '../../../services/doc-ime-input-manager.service';
import { DocMenuStyleService } from '../../../services/doc-menu-style.service';
import { DocStateChangeManagerService } from '../../../services/doc-state-change-manager.service';
import { DocSelectionRenderService } from '../../../services/selection/doc-selection-render.service';

const TEST_DOCUMENT_DATA_EN: IDocumentData = {
    id: 'test-doc',
    body: {
        dataStream: 'What’s New in the 2022\r Gartner Hype Cycle for Emerging Technologies\r\n',
        textRuns: [
            {
                st: 0,
                ed: 22,
                ts: {
                    bl: BooleanNumber.FALSE,
                    fs: 24,
                    cl: {
                        rgb: 'rgb(0, 40, 86)',
                    },
                },
            },
            {
                st: 23,
                ed: 68,
                ts: {
                    bl: BooleanNumber.TRUE,
                    fs: 24,
                    cl: {
                        rgb: 'rgb(0, 40, 86)',
                    },
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 22,
            },
            {
                startIndex: 68,
                paragraphStyle: {
                    spaceAbove: { v: 20 },
                    indentFirstLine: { v: 20 },
                },
            },
        ],
        sectionBreaks: [],
        customBlocks: [],
    },
    documentStyle: {
        pageSize: {
            width: 594.3,
            height: 840.51,
        },
        marginTop: 72,
        marginBottom: 72,
        marginRight: 90,
        marginLeft: 90,
    },
};

export function createCommandTestBed(docData?: IDocumentData, dependencies?: Dependency[]) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            const injector = this._injector;
            injector.get(IUndoRedoService);

            injector.add([IRenderManagerService, { useClass: MockRenderManagerService as unknown as Ctor<IRenderManagerService> }]);

            injector.add([DocSelectionManagerService]);
            injector.add([DocMenuStyleService]);
            injector.add([DocStateEmitService]);
            injector.add([DocStateChangeManagerService]);
            injector.add([DocIMEInputManagerService]);
            injector.add([DocSelectionRenderService]);

            dependencies?.forEach((d) => injector.add(d));
        }

        override onReady(): void {
            this._injector.get(DocStateChangeManagerService);
        }
    }

    univer.registerPlugin(TestPlugin);

    const doc = univer.createUniverDoc(docData || TEST_DOCUMENT_DATA_EN);

    const univerInstanceService = get(IUniverInstanceService);

    // NOTE: This is pretty hack for the test. But with these hacks we can avoid to create
    // real canvas-environment in univerjs/docs. If some we have to do that, this hack could be removed.
    // Refer to packages/sheets-ui/src/services/clipboard/__tests__/clipboard-test-bed.ts
    const fakeDocSkeletonManager = new MockDocSkeletonManagerService({
        unit: doc,
        unitId: 'test-doc',
        type: UniverInstanceType.UNIVER_DOC,
        engine: null as any,
        scene: null as any,
        mainComponent: null as any,
        components: null as any,
        isMainScene: true,
        activated$: new BehaviorSubject(true),
        activate: () => {},
        deactivate: () => {},
    }, univerInstanceService);

    injector.add([DocSkeletonManagerService, { useValue: fakeDocSkeletonManager as unknown as DocSkeletonManagerService }]);

    univerInstanceService.focusUnit('test-doc');

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT);

    return {
        univer,
        get,
        doc,
    };
}

// These services are for document build and manage doc skeletons.

export class MockRenderManagerService implements Pick<IRenderManagerService, 'getRenderById'> {
    constructor(
        @Inject(Injector) private readonly _injector: Injector
    ) { }

    getRenderById(_unitId: string): Nullable<IRender> {
        return {
            with: <T>(identifier: DependencyIdentifier<T>) => this._injector.get(identifier),
        } as unknown as IRender;
    }
}

export class MockDocSkeletonManagerService extends RxDisposable implements IRenderModule {
    private _docViewModel: DocumentViewModel;

    private readonly _currentSkeleton$ = new BehaviorSubject<Nullable<DocumentSkeleton>>(null);
    readonly currentSkeleton$ = this._currentSkeleton$.asObservable();

    // CurrentSkeletonBefore for pre-triggered logic during registration
    private readonly _currentSkeletonBefore$ = new BehaviorSubject<Nullable<DocumentSkeleton>>(null);
    readonly currentSkeletonBefore$ = this._currentSkeletonBefore$.asObservable();

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._update();

        this._univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            .pipe(takeUntil(this.dispose$))
            .subscribe((documentModel) => {
                if (documentModel?.getUnitId() === this._context.unitId) {
                    this._update();
                }
            });
    }

    override dispose(): void {
        super.dispose();

        this._currentSkeletonBefore$.complete();
        this._currentSkeleton$.complete();
    }

    private _update() {
        const documentDataModel = this._context.unit;
        const unitId = this._context.unitId;

        // No need to build view model, if data model has no body.
        if (documentDataModel.getBody() == null) {
            return;
        }

        // Always need to reset document data model, because cell editor change doc instance every time.
        if (this._docViewModel && unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
            this._docViewModel.reset(documentDataModel);
        } else if (!this._docViewModel) {
            this._docViewModel = this._buildDocViewModel(documentDataModel);
        }
    }

    getSkeleton(): DocumentSkeleton {
        throw new Error('[MockDocSkeletonManagerService]: cannot access to doc skeleton in unit tests!');
    }

    getViewModel(): DocumentViewModel {
        return this._docViewModel;
    }

    private _buildDocViewModel(documentDataModel: DocumentDataModel) {
        return new DocumentViewModel(documentDataModel);
    }
}
