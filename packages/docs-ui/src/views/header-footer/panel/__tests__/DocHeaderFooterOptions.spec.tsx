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

/**
 * @vitest-environment jsdom
 */

import type { ICommand, IDisposable } from '@univerjs/core';
import type { Root } from 'react-dom/client';
import type { ICoreHeaderFooterParams } from '../../../../commands/commands/doc-header-footer.command';
import {
    BooleanNumber,
    CommandService,
    CommandType,
    ConfigService,
    ContextService,
    DocumentDataModel,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    toDisposable,
    UniverInstanceService,
} from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { ILayoutService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { CloseHeaderFooterCommand, CoreHeaderFooterCommandId } from '../../../../commands/commands/doc-header-footer.command';
import { DocSelectionRenderService } from '../../../../services/selection/doc-selection-render.service';
import { DocHeaderFooterOptions } from '../DocHeaderFooterOptions';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'header-footer-options-doc';

interface IRecordedCommand {
    id: string;
    params: unknown;
}

class TestLogService {
    debug(): void {}
    warn(): void {}
}

class TestLocaleService {
    t(key: string): string {
        return key;
    }
}

class TestLayoutService {
    private _focusCount = 0;

    get focusCount() {
        return this._focusCount;
    }

    focus(): void {
        this._focusCount += 1;
    }

    registerFocusHandler(): IDisposable {
        return toDisposable(() => undefined);
    }

    registerRootContainerElement(): IDisposable {
        return toDisposable(() => undefined);
    }

    registerContentElement(): IDisposable {
        return toDisposable(() => undefined);
    }

    registerContainerElement(): IDisposable {
        return toDisposable(() => undefined);
    }

    getContentElement(): HTMLElement {
        return document.body;
    }

    checkElementInCurrentContainers(): boolean {
        return true;
    }

    checkContentIsFocused(): boolean {
        return this._focusCount > 0;
    }
}

class TestSelectionRenderService {
    readonly segmentContext$ = new BehaviorSubject({ segmentId: 'default-header', segmentPage: 3 });
    private _segment = 'default-header';
    private _segmentPage = 3;
    private _removeRangeCount = 0;
    private _blurCount = 0;

    get segment() {
        return this._segment;
    }

    get removeRangeCount() {
        return this._removeRangeCount;
    }

    get blurCount() {
        return this._blurCount;
    }

    getSegment(): string {
        return this._segment;
    }

    setSegment(segmentId: string): void {
        this._segment = segmentId;
        this.segmentContext$.next({ segmentId, segmentPage: this._segmentPage });
    }

    getSegmentPage(): number {
        return this._segmentPage;
    }

    setSegmentPage(page: number): void {
        this._segmentPage = page;
        this.segmentContext$.next({ segmentId: this._segment, segmentPage: page });
    }

    removeAllRanges(): void {
        this._removeRangeCount += 1;
    }

    blur(): void {
        this._blurCount += 1;
    }
}

class TestDocumentViewModel {
    readonly editAreaChange$ = new Subject<DocumentEditArea | null>();
    private _editArea = DocumentEditArea.HEADER;

    getEditArea(): DocumentEditArea {
        return this._editArea;
    }

    setEditArea(editArea: DocumentEditArea): void {
        this._editArea = editArea;
        this.editAreaChange$.next(editArea);
    }
}

class TestDocSkeletonManagerService {
    constructor(private readonly _viewModel: TestDocumentViewModel) {}

    getViewModel(): TestDocumentViewModel {
        return this._viewModel;
    }

    getSkeleton() {
        return {
            getSkeletonData: () => ({
                pages: [undefined, undefined, undefined, { sectionId: 'section_options', pageNumber: 1, pageNumberStart: 1 }],
            }),
        };
    }
}

class TestRenderUnit {
    constructor(
        private readonly _selectionRenderService: TestSelectionRenderService,
        private readonly _docSkeletonManagerService: TestDocSkeletonManagerService
    ) {}

    with(token: unknown) {
        if (token === DocSelectionRenderService) {
            return this._selectionRenderService;
        }
        if (token === DocSkeletonManagerService) {
            return this._docSkeletonManagerService;
        }
        return null;
    }
}

class TestRenderManagerService {
    static renderUnit: TestRenderUnit;

    getRenderById(): TestRenderUnit {
        return TestRenderManagerService.renderUnit;
    }
}

function createHeaderFooterOptionsTestBed() {
    const injector = new Injector();
    const records: IRecordedCommand[] = [];
    const selectionRenderService = new TestSelectionRenderService();
    const viewModel = new TestDocumentViewModel();

    TestRenderManagerService.renderUnit = new TestRenderUnit(
        selectionRenderService,
        new TestDocSkeletonManagerService(viewModel)
    );

    injector.add([ILogService, { useClass: TestLogService as never }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([ILayoutService, { useClass: TestLayoutService as never }]);

    const doc = new DocumentDataModel({
        id: UNIT_ID,
        documentStyle: {
            defaultHeaderId: 'default-header',
            defaultFooterId: 'default-footer',
            marginHeader: 12,
            marginFooter: 18,
            useFirstPageHeaderFooter: BooleanNumber.FALSE,
            evenAndOddHeaders: BooleanNumber.FALSE,
        },
        body: {
            dataStream: '\r\n',
            paragraphs: [],
            sectionBreaks: [{ sectionId: 'section_options', startIndex: 1 }],
            customRanges: [],
            tables: [],
            textRuns: [],
        },
    });
    (injector.get(IUniverInstanceService) as UniverInstanceService).__addUnit(doc);

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(createRecordingCommand(CoreHeaderFooterCommandId, records));
    commandService.registerCommand(createRecordingCommand(CloseHeaderFooterCommand.id, records));

    return {
        injector,
        records,
        selectionRenderService,
        viewModel,
        layoutService: injector.get(ILayoutService) as unknown as TestLayoutService,
    };
}

function createRecordingCommand(id: string, records: IRecordedCommand[]): ICommand {
    return {
        id,
        type: CommandType.COMMAND,
        handler: (_accessor, params) => {
            records.push({ id, params });
            return true;
        },
    };
}

function renderHeaderFooterOptions() {
    const testBed = createHeaderFooterOptionsTestBed();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <DocHeaderFooterOptions unitId={UNIT_ID} />
            </RediContext.Provider>
        );
    });

    return { ...testBed, container, root };
}

function clickCheckbox(input: HTMLInputElement) {
    input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function changeInput(input: HTMLInputElement, value: string) {
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(input),
        'value'
    )?.set;

    prototypeValueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('DocHeaderFooterOptions', () => {
    let root: Root | undefined;
    let container: HTMLElement | undefined;

    afterEach(() => {
        if (root) {
            act(() => root!.unmount());
        }
        container?.remove();
        root = undefined;
        container = undefined;
    });

    it('turns on first-page header/footer and focuses the newly created current-page segment', () => {
        const rendered = renderHeaderFooterOptions();
        root = rendered.root;
        container = rendered.container;

        const [firstPageCheckbox] = Array.from(container.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];

        act(() => clickCheckbox(firstPageCheckbox));

        const [record] = rendered.records;
        const params = record.params as ICoreHeaderFooterParams;

        expect(record.id).toBe(CoreHeaderFooterCommandId);
        expect(params.unitId).toBe(UNIT_ID);
        expect(params.headerFooterProps).toEqual({
            useFirstPageHeaderFooter: BooleanNumber.TRUE,
        });
        expect(params.sectionId).toBe('section_options');
        expect(params.segmentId).toHaveLength(6);
        expect(rendered.selectionRenderService.segment).toBe(params.segmentId);
        expect(rendered.layoutService.focusCount).toBe(1);
    });

    it('sends margin edits and close actions through header/footer commands', async () => {
        const rendered = renderHeaderFooterOptions();
        root = rendered.root;
        container = rendered.container;

        const [headerMarginInput] = Array.from(container.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
        const closeButton = Array.from(container.querySelectorAll('button')).find((button) => (
            button.textContent?.includes('docs-ui.headerFooter.closeHeaderFooter')
        ));

        if (!closeButton) {
            throw new Error('Missing close header footer button');
        }

        await act(async () => {
            changeInput(headerMarginInput, '25.5');
        });
        act(() => {
            closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(rendered.records.map((record) => record.id)).toEqual([
            CoreHeaderFooterCommandId,
            CloseHeaderFooterCommand.id,
        ]);
        expect((rendered.records[0].params as ICoreHeaderFooterParams).headerFooterProps).toEqual({
            marginHeader: 25.5,
        });
        expect((rendered.records[0].params as ICoreHeaderFooterParams).sectionId).toBe('section_options');
        expect((rendered.records[1].params as { unitId: string })).toEqual({
            unitId: UNIT_ID,
        });
        expect(rendered.selectionRenderService.removeRangeCount).toBe(1);
        expect(rendered.selectionRenderService.blurCount).toBe(1);
    });
});
