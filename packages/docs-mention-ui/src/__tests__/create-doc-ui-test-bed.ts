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

import type { Dependency, DocumentDataModel, IDocumentData, Nullable } from '@univerjs/core';
import type { DocumentSkeleton, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import {
    BooleanNumber,
    DisposableCollection,
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
import {
    DocSelectionManagerService,
    DocSkeletonManagerService,
    DocStateChangeManagerService,
    DocStateEmitService,
} from '@univerjs/docs';
import { DocIMEInputManagerService, DocSelectionRenderService } from '@univerjs/docs-ui';
import { DocumentViewModel, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { BehaviorSubject, takeUntil } from 'rxjs';

const DEFAULT_DOC_DATA: IDocumentData = {
    id: 'test-doc',
    body: {
        dataStream: 'Hello world\r\n',
        textRuns: [{
            st: 0,
            ed: 11,
            ts: {
                bl: BooleanNumber.FALSE,
            },
        }],
        paragraphs: [{ startIndex: 11, paragraphId: 'para_mention_test' }],
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

export function createDocUiTestBed(docData?: IDocumentData, dependencies?: Dependency[]) {
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
            this._injector.get(IUndoRedoService);
            if (!dependencies?.some((dependency) => Array.isArray(dependency) && dependency[0] === IRenderManagerService)) {
                this._injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            }
            this._injector.add([DocSelectionManagerService]);
            this._injector.add([DocStateEmitService]);
            this._injector.add([DocStateChangeManagerService]);
            this._injector.add([DocIMEInputManagerService]);
            this._injector.add([DocSelectionRenderService]);
            dependencies?.forEach((dependency) => this._injector.add(dependency));
        }

        override onReady(): void {
            this._injector.get(DocStateChangeManagerService);
        }
    }

    univer.registerPlugin(TestPlugin);

    const doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, docData || DEFAULT_DOC_DATA);
    const univerInstanceService = get(IUniverInstanceService);
    const fakeDocSkeletonManager = new MockDocSkeletonManagerService({
        unit: doc,
        unitId: doc.getUnitId(),
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
    const renderManagerService = get(IRenderManagerService);
    if (renderManagerService.getRenderUnitById(doc.getUnitId()) == null) {
        renderManagerService.addRender(doc.getUnitId(), {
            unitId: doc.getUnitId(),
            type: UniverInstanceType.UNIVER_DOC,
            engine: new DisposableCollection() as any,
            scene: new DisposableCollection() as any,
            mainComponent: null as any,
            components: new Map(),
            isMainScene: true,
            activated$: new BehaviorSubject(true),
            with: injector.get.bind(injector),
            activate: () => {},
            deactivate: () => {},
            isDisposed: () => false,
        });
    }
    univerInstanceService.focusUnit(doc.getUnitId());
    get(ILogService).setLogLevel(LogLevel.SILENT);

    return {
        univer,
        injector,
        get,
        doc,
    };
}

class MockDocSkeletonManagerService extends RxDisposable implements IRenderModule {
    private _docViewModel!: DocumentViewModel;
    private readonly _currentSkeleton$ = new BehaviorSubject<Nullable<DocumentSkeleton>>(null);
    readonly currentSkeleton$ = this._currentSkeleton$.asObservable();
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

    private _update() {
        const documentDataModel = this._context.unit;
        const unitId = this._context.unitId;

        if (documentDataModel.getBody() == null) {
            return;
        }

        if (this._docViewModel && unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
            this._docViewModel.reset(documentDataModel);
        } else if (!this._docViewModel) {
            this._docViewModel = new DocumentViewModel(documentDataModel);
        }
    }

    getSkeleton(): DocumentSkeleton {
        throw new Error('[MockDocSkeletonManagerService]: cannot access to doc skeleton in unit tests!');
    }

    getViewModel(): DocumentViewModel {
        return this._docViewModel;
    }
}
