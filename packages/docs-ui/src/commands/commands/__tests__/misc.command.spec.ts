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

import type { DocumentDataModel, ICommand, IDisposable, IDocumentData, Injector, Univer } from '@univerjs/core';
import type { IConfirmPartMethodOptions, ISidebarMethodOptions } from '@univerjs/ui';
import type { IAutoFormat } from '../../../services/doc-auto-format.service';
import {
    awaitTime,
    BooleanNumber,
    CommandType,
    CustomRangeType,
    Direction,
    Disposable,
    DocumentFlavor,
    HorizontalAlign,
    ICommandService,
    IConfirmService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    NamedStyleType,
    PAGE_SIZE,
    PageOrientType,
    PaperType,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ISidebarService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { HeaderFooterType } from '../../../controllers/doc-header-footer.controller';
import { DocParagraphSettingController } from '../../../controllers/doc-paragraph-setting.controller';
import { DocAutoFormatService } from '../../../services/doc-auto-format.service';
import { DocSelectionRenderService } from '../../../services/selection/doc-selection-render.service';
import { COMPONENT_DOC_HEADER_FOOTER_PANEL } from '../../../views/header-footer/panel/component-name';
import { PAGE_SETTING_COMPONENT_ID } from '../../../views/PageSettings';
import { MoveCursorOperation, MoveSelectionOperation } from '../../operations/doc-cursor.operation';
import { SidebarDocHeaderFooterPanelOperation } from '../../operations/doc-header-footer-panel.operation';
import { DocParagraphSettingPanelOperation } from '../../operations/doc-paragraph-setting-panel.operation';
import { DocOpenPageSettingCommand } from '../../operations/open-page-setting.operation';
import { SetDocZoomRatioOperation } from '../../operations/set-doc-zoom-ratio.operation';
import { AfterSpaceCommand, EnterCommand, TabCommand } from '../auto-format.command';
import { BreakLineCommand } from '../break-line.command';
import { CoreHeaderFooterCommand, OpenHeaderFooterPanelCommand } from '../doc-header-footer.command';
import { HorizontalLineCommand, InsertHorizontalLineBellowCommand } from '../doc-horizontal-line.command';
import { DocPageSetupCommand } from '../doc-page-setup.command';
import { DocParagraphSettingCommand } from '../doc-paragraph-setting.command';
import { DocSelectAllCommand } from '../doc-select-all.command';
import { InsertCustomRangeCommand } from '../insert-custom-range.command';
import { AlignCenterCommand, AlignJustifyCommand, AlignOperationCommand } from '../paragraph-align.command';
import { ReplaceSelectionCommand } from '../replace-content.command';
import { SetDocZoomRatioCommand } from '../set-doc-zoom-ratio.command';
import { SwitchDocModeCommand } from '../switch-doc-mode.command';
import { genEmptyTable } from '../table/table';
import { createCommandTestBed } from './create-command-test-bed';

class TestSidebarService extends Disposable implements ISidebarService {
    readonly sidebarOptions$ = new Subject<ISidebarMethodOptions>();
    readonly scrollEvent$ = new Subject<Event>();
    private _options: ISidebarMethodOptions = {};
    private _container?: HTMLElement;
    private _width?: number;

    get visible(): boolean {
        return this._options.visible ?? false;
    }

    get options(): ISidebarMethodOptions {
        return this._options;
    }

    get width(): number | undefined {
        return this._width;
    }

    open(params: ISidebarMethodOptions): IDisposable {
        this._options = { ...params, visible: true };
        this.sidebarOptions$.next(this._options);
        return toDisposable(() => this.close());
    }

    close(): void {
        this._options = { ...this._options, visible: false };
        this.sidebarOptions$.next(this._options);
        this._options.onClose?.();
    }

    getContainer(): HTMLElement | undefined {
        return this._container;
    }

    setContainer(element?: HTMLElement): void {
        this._container = element;
    }

    setWidth(value: number): void {
        this._width = value;
    }

    override dispose(): void {
        super.dispose();
        this.sidebarOptions$.complete();
        this.scrollEvent$.complete();
    }
}

class TestConfirmService extends Disposable implements IConfirmService<IConfirmPartMethodOptions> {
    readonly confirmOptions$ = new Subject<IConfirmPartMethodOptions[]>();
    readonly closedIds: string[] = [];
    private _options: IConfirmPartMethodOptions[] = [];

    get options(): IConfirmPartMethodOptions[] {
        return this._options;
    }

    get lastOption(): IConfirmPartMethodOptions | undefined {
        return this._options.at(-1);
    }

    open(params: IConfirmPartMethodOptions): IDisposable {
        this._options = [...this._options.filter((option) => option.id !== params.id), { ...params, visible: true }];
        this.confirmOptions$.next(this._options);
        return toDisposable(() => {
            this._options = this._options.filter((option) => option.id !== params.id);
            this.confirmOptions$.next(this._options);
        });
    }

    confirm(params: IConfirmPartMethodOptions): Promise<boolean> {
        this.open(params);
        return Promise.resolve(true);
    }

    close(id: string): void {
        this.closedIds.push(id);
        this._options = this._options.map((option) => option.id === id ? { ...option, visible: false } : option);
        this.confirmOptions$.next(this._options);
    }

    override dispose(): void {
        super.dispose();
        this.confirmOptions$.complete();
    }
}

function createBaseDoc(dataStream = 'Hello world\r\n'): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream,
            textRuns: [{
                st: 0,
                ed: dataStream.length - 2,
                ts: {},
            }],
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_22', startIndex: dataStream.length - 2 }],
            sectionBreaks: [{
                startIndex: dataStream.length - 1,
            }],
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
}

function createHeaderFooterDoc(): IDocumentData {
    return {
        ...createBaseDoc(),
        headers: {},
        footers: {},
    };
}

function createMultiParagraphDoc(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'Title\rBody\r\n',
            textRuns: [{
                st: 0,
                ed: 10,
                ts: {},
            }],
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_23', startIndex: 5, paragraphStyle: {
                namedStyleType: NamedStyleType.HEADING_1,
                headingId: 'heading-1',
            } }, { paragraphId: 'para_docs_ui_fixture_24', startIndex: 10 }],
            sectionBreaks: [{
                startIndex: 11,
            }],
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
}

function createTableDoc(): IDocumentData {
    const table = genEmptyTable(2, 2);
    const prefix = 'AB';
    const suffix = 'CD\r\n';
    const dataStream = `${prefix}${table.dataStream}${suffix}`;

    return {
        id: 'test-doc',
        body: {
            dataStream,
            textRuns: [{
                st: 0,
                ed: dataStream.length - 2,
                ts: {},
            }],
            paragraphs: [
                ...table.paragraphs.map((paragraph) => ({
                    ...paragraph,
                    startIndex: paragraph.startIndex + prefix.length,
                })),
                { paragraphId: 'para_docs_ui_fixture_25', startIndex: dataStream.length - 2 },
            ],
            sectionBreaks: [
                ...table.sectionBreaks.map((sectionBreak) => ({
                    ...sectionBreak,
                    startIndex: sectionBreak.startIndex + prefix.length,
                })),
                {
                    startIndex: dataStream.length - 1,
                },
            ],
            tables: [{
                startIndex: prefix.length,
                endIndex: prefix.length + table.dataStream.length,
                tableId: 'table-1',
            }],
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
}

function createTableDocWithParagraphsBeforeTable(): IDocumentData {
    const table = genEmptyTable(2, 2);
    const prefix = 'Title\rBody\r';
    const suffix = 'Tail\r\n';
    const dataStream = `${prefix}${table.dataStream}${suffix}`;

    return {
        id: 'test-doc',
        body: {
            dataStream,
            textRuns: [{
                st: 0,
                ed: dataStream.length - 2,
                ts: {},
            }],
            paragraphs: [
                { paragraphId: 'para_docs_ui_fixture_26', startIndex: 5 },
                { paragraphId: 'para_docs_ui_fixture_27', startIndex: 10 },
                ...table.paragraphs.map((paragraph) => ({
                    ...paragraph,
                    startIndex: paragraph.startIndex + prefix.length,
                })),
                { paragraphId: 'para_docs_ui_fixture_28', startIndex: dataStream.length - 2 },
            ],
            sectionBreaks: [
                ...table.sectionBreaks.map((sectionBreak) => ({
                    ...sectionBreak,
                    startIndex: sectionBreak.startIndex + prefix.length,
                })),
                {
                    startIndex: dataStream.length - 1,
                },
            ],
            tables: [{
                startIndex: prefix.length,
                endIndex: prefix.length + table.dataStream.length,
                tableId: 'table-1',
            }],
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
}

describe('misc document commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getDoc() {
        return get(IUniverInstanceService).getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC);
    }

    function getBody() {
        return getDoc()?.getBody();
    }

    function setCollapsedSelection(startOffset: number, endOffset = startOffset) {
        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
        });
        selectionManager.__TEST_ONLY_add([{
            startOffset,
            endOffset,
            collapsed: startOffset === endOffset,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);
    }

    function loadTestLocale() {
        get(LocaleService).load({ [LocaleType.ZH_CN]: {} });
    }

    afterEach(() => {
        univer.dispose();
    });

    it('inserts a custom range through the real replace-selection mutation flow', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc('Hello\r\n')));
        commandService = get(ICommandService);
        commandService.registerCommand(InsertCustomRangeCommand);
        commandService.registerCommand(ReplaceSelectionCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(5);

        await commandService.executeCommand(InsertCustomRangeCommand.id, {
            unitId: 'test-doc',
            rangeId: 'custom-range-1',
            text: '@OpenAI',
            properties: {
                source: 'test',
            },
            wholeEntity: true,
        });

        await awaitTime(0);

        expect(getBody()?.dataStream).toBe('Hello@OpenAI\r\n');
        expect(getBody()?.customRanges).toEqual([expect.objectContaining({
            startIndex: 5,
            endIndex: 11,
            rangeId: 'custom-range-1',
            rangeType: CustomRangeType.CUSTOM,
            wholeEntity: true,
            properties: {
                source: 'test',
            },
        })]);
    });

    it('updates paragraph styles across selected paragraphs', async () => {
        ({ univer, get } = createCommandTestBed(createMultiParagraphDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DocParagraphSettingCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(0, 10);

        await commandService.executeCommand(DocParagraphSettingCommand.id, {
            paragraph: {
                spaceAbove: { v: 24 },
                indentFirstLine: { v: 12 },
            },
        });

        await awaitTime(0);

        expect(getBody()?.paragraphs?.[0].paragraphStyle).toEqual(expect.objectContaining({
            namedStyleType: NamedStyleType.HEADING_1,
            headingId: 'heading-1',
            spaceAbove: { v: 24 },
            indentFirstLine: { v: 12 },
        }));
        expect(getBody()?.paragraphs?.[1].paragraphStyle).toEqual(expect.objectContaining({
            spaceAbove: { v: 24 },
            indentFirstLine: { v: 12 },
        }));
    });

    it('selects the whole body when no tables are present', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DocSelectAllCommand);
        setCollapsedSelection(1);

        const selectionManager = get(DocSelectionManagerService);
        const refreshEvents: Array<unknown> = [];
        const subscription = selectionManager.refreshSelection$.subscribe((event) => {
            if (event) {
                refreshEvents.push(event);
            }
        });

        const result = await commandService.executeCommand(DocSelectAllCommand.id);
        await awaitTime(0);

        expect(result).toBe(true);
        expect(refreshEvents.at(-1)).toEqual(expect.objectContaining({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            isEditing: false,
            docRanges: [expect.objectContaining({
                startOffset: 0,
                endOffset: 11,
            })],
        }));

        subscription.unsubscribe();
    });

    it('selects the current paragraph first when tables are present', async () => {
        ({ univer, get } = createCommandTestBed(createTableDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DocSelectAllCommand);
        setCollapsedSelection(1);

        const selectionManager = get(DocSelectionManagerService);
        const refreshEvents: Array<unknown> = [];
        const subscription = selectionManager.refreshSelection$.subscribe((event) => {
            if (event) {
                refreshEvents.push(event);
            }
        });

        const result = await commandService.executeCommand(DocSelectAllCommand.id);
        await awaitTime(0);

        expect(result).toBe(true);
        expect(refreshEvents.at(-1)).toEqual(expect.objectContaining({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            isEditing: false,
            docRanges: [
                expect.objectContaining({
                    startOffset: 0,
                    endOffset: 1,
                }),
            ],
        }));

        subscription.unsubscribe();
    });

    it('expands to the whole body when the current paragraph selection is split into visual ranges', async () => {
        ({ univer, get } = createCommandTestBed(createTableDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DocSelectAllCommand);

        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
        });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 0,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null as never,
        }, {
            startOffset: 1,
            endOffset: 1,
            collapsed: false,
            isActive: false,
            segmentId: '',
            style: null as never,
        }], false);

        const refreshEvents: Array<unknown> = [];
        const subscription = selectionManager.refreshSelection$.subscribe((event) => {
            if (event) {
                refreshEvents.push(event);
            }
        });

        const result = await commandService.executeCommand(DocSelectAllCommand.id);
        await awaitTime(0);

        expect(result).toBe(true);
        expect(refreshEvents.at(-1)).toEqual(expect.objectContaining({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            isEditing: false,
            docRanges: [
                expect.objectContaining({ startOffset: 0, endOffset: 1 }),
                expect.objectContaining({ startOffset: 5, endOffset: 19, rangeType: 'RECT' }),
                expect.objectContaining({ startOffset: 24, endOffset: 26 }),
            ],
        }));

        subscription.unsubscribe();
    });

    it('expands to the whole body by keeping text before tables selectable across paragraphs', async () => {
        ({ univer, get } = createCommandTestBed(createTableDocWithParagraphsBeforeTable()));
        commandService = get(ICommandService);
        commandService.registerCommand(DocSelectAllCommand);

        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
        });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 5,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null as never,
        }], false);

        const refreshEvents: Array<unknown> = [];
        const subscription = selectionManager.refreshSelection$.subscribe((event) => {
            if (event) {
                refreshEvents.push(event);
            }
        });

        const result = await commandService.executeCommand(DocSelectAllCommand.id);
        await awaitTime(0);

        expect(result).toBe(true);
        expect(refreshEvents.at(-1)).toEqual(expect.objectContaining({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            isEditing: false,
            docRanges: [
                expect.objectContaining({ startOffset: 0, endOffset: 5 }),
                expect.objectContaining({ startOffset: 6, endOffset: 10 }),
                expect.objectContaining({ rangeType: 'RECT' }),
                expect.objectContaining({ startOffset: expect.any(Number), endOffset: expect.any(Number), rangeType: 'TEXT' }),
            ],
        }));

        subscription.unsubscribe();
    });

    it('selects the current table first when the cursor is inside a table', async () => {
        ({ univer, get } = createCommandTestBed(createTableDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DocSelectAllCommand);
        setCollapsedSelection(6);

        const selectionManager = get(DocSelectionManagerService);
        const refreshEvents: Array<unknown> = [];
        const subscription = selectionManager.refreshSelection$.subscribe((event) => {
            if (event) {
                refreshEvents.push(event);
            }
        });

        const result = await commandService.executeCommand(DocSelectAllCommand.id);
        await awaitTime(0);

        expect(result).toBe(true);
        expect(refreshEvents.at(-1)).toEqual(expect.objectContaining({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            isEditing: false,
            docRanges: [
                expect.objectContaining({
                    startOffset: 5,
                    endOffset: 19,
                    rangeType: 'RECT',
                }),
            ],
        }));

        subscription.unsubscribe();
    });

    it('inserts a horizontal line by reusing the break-line command chain', async () => {
        ({ univer, get } = createCommandTestBed(createMultiParagraphDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(HorizontalLineCommand);
        commandService.registerCommand(BreakLineCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(5);

        await commandService.executeCommand(HorizontalLineCommand.id, {
            insertRange: {
                startOffset: 5,
                endOffset: 5,
            },
        });

        await awaitTime(0);
        expect(getBody()?.paragraphs).toHaveLength(3);
        expect(getBody()?.paragraphs?.[0].paragraphStyle?.borderBottom).toEqual(expect.objectContaining({
            width: 1,
        }));
    });

    it('inserts a horizontal line below the current paragraph', async () => {
        ({ univer, get } = createCommandTestBed(createMultiParagraphDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(InsertHorizontalLineBellowCommand);
        commandService.registerCommand(HorizontalLineCommand);
        commandService.registerCommand(BreakLineCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(2);

        await commandService.executeCommand(InsertHorizontalLineBellowCommand.id);

        await awaitTime(0);
        expect(getBody()?.paragraphs).toHaveLength(3);
        expect(getBody()?.paragraphs?.[1].paragraphStyle?.borderBottom).toEqual(expect.objectContaining({
            width: 1,
        }));
    });

    it('aligns selected paragraphs through the wrapper and toggles an existing alignment', async () => {
        ({ univer, get } = createCommandTestBed(createMultiParagraphDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(AlignOperationCommand);
        commandService.registerCommand(AlignCenterCommand);
        commandService.registerCommand(AlignJustifyCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(0, 10);

        await commandService.executeCommand(AlignCenterCommand.id);
        await awaitTime(0);

        expect(getBody()?.paragraphs?.[0].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.CENTER);
        expect(getBody()?.paragraphs?.[1].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.CENTER);

        await commandService.executeCommand(AlignCenterCommand.id);
        await awaitTime(0);

        expect(getBody()?.paragraphs?.[0].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.UNSPECIFIED);
        expect(getBody()?.paragraphs?.[1].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.UNSPECIFIED);

        await commandService.executeCommand(AlignJustifyCommand.id);
        await awaitTime(0);

        expect(getBody()?.paragraphs?.[0].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.JUSTIFIED);
        expect(getBody()?.paragraphs?.[1].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.JUSTIFIED);
    });

    it('updates the current document zoom ratio through the command and operation chain', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(SetDocZoomRatioCommand);
        commandService.registerCommand(SetDocZoomRatioOperation);

        expect((getDoc()?.getSnapshot().settings?.zoomRatio) ?? 1).toBe(1);

        await commandService.executeCommand(SetDocZoomRatioCommand.id, {
            zoomRatio: 1.5,
        });

        expect(getDoc()?.getSnapshot().settings?.zoomRatio).toBe(1.5);
        expect(await commandService.executeCommand(SetDocZoomRatioCommand.id, {
            documentId: 'missing-doc',
            zoomRatio: 0.8,
        })).toBe(false);
    });

    it('updates document page setup through the real rich text mutation flow', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DocPageSetupCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const result = await commandService.executeCommand(DocPageSetupCommand.id, {
            documentFlavor: DocumentFlavor.TRADITIONAL,
            pageSize: PAGE_SIZE[PaperType.A3],
            pageOrient: PageOrientType.LANDSCAPE,
            marginTop: 36,
            marginBottom: 42,
            marginLeft: 48,
            marginRight: 54,
        });
        await awaitTime(0);

        expect(result).toBe(true);
        expect(getDoc()?.getDocumentStyle()).toEqual(expect.objectContaining({
            documentFlavor: DocumentFlavor.TRADITIONAL,
            pageSize: PAGE_SIZE[PaperType.A3],
            pageOrient: PageOrientType.LANDSCAPE,
            marginTop: 36,
            marginBottom: 42,
            marginLeft: 48,
            marginRight: 54,
        }));
    });

    it('opens page settings and applies confirmed document setup', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc(), [
            [IConfirmService, { useClass: TestConfirmService }],
        ]));
        loadTestLocale();
        commandService = get(ICommandService);
        commandService.registerCommand(DocOpenPageSettingCommand);
        commandService.registerCommand(DocPageSetupCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const result = await commandService.executeCommand(DocOpenPageSettingCommand.id);
        const confirmService = get(IConfirmService) as TestConfirmService;

        expect(result).toBe(true);
        expect(confirmService.lastOption).toEqual(expect.objectContaining({
            id: PAGE_SETTING_COMPONENT_ID,
            width: 528,
            confirmText: expect.any(String),
            cancelText: expect.any(String),
        }));
        expect(confirmService.lastOption?.children).toEqual({
            label: PAGE_SETTING_COMPONENT_ID,
        });

        confirmService.lastOption?.onConfirm?.({
            mode: DocumentFlavor.TRADITIONAL,
            paperSize: PaperType.A5,
            orientation: PageOrientType.PORTRAIT,
            margins: {
                top: 18,
                bottom: 24,
                left: 30,
                right: 36,
            },
        });
        await awaitTime(0);

        expect(confirmService.options).toEqual([]);
        expect(getDoc()?.getDocumentStyle()).toEqual(expect.objectContaining({
            documentFlavor: DocumentFlavor.TRADITIONAL,
            pageSize: PAGE_SIZE[PaperType.A5],
            pageOrient: PageOrientType.PORTRAIT,
            marginTop: 18,
            marginBottom: 24,
            marginLeft: 30,
            marginRight: 36,
        }));
    });

    it('creates header and footer records while updating header footer margins', async () => {
        ({ univer, get } = createCommandTestBed(createHeaderFooterDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(CoreHeaderFooterCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const result = await commandService.executeCommand(CoreHeaderFooterCommand.id, {
            unitId: 'test-doc',
            segmentId: 'header-segment-1',
            createType: HeaderFooterType.DEFAULT_HEADER,
            headerFooterProps: {
                marginHeader: 30,
                marginFooter: 40,
                useFirstPageHeaderFooter: BooleanNumber.TRUE,
            },
        });
        await awaitTime(0);

        const snapshot = getDoc()?.getSnapshot();
        expect(result).toBe(true);
        expect(snapshot?.documentStyle).toEqual(expect.objectContaining({
            defaultHeaderId: 'header-segment-1',
            marginHeader: 30,
            marginFooter: 40,
            useFirstPageHeaderFooter: BooleanNumber.TRUE,
        }));
        expect(snapshot?.headers?.['header-segment-1'].body?.dataStream).toBe('\r\n');
        expect(snapshot?.documentStyle.defaultFooterId).toEqual(expect.any(String));
    });

    it('opens and closes the header footer sidebar panel through commands and operations', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc(), [
            [ISidebarService, { useClass: TestSidebarService }],
        ]));
        loadTestLocale();
        commandService = get(ICommandService);
        commandService.registerCommand(OpenHeaderFooterPanelCommand);
        commandService.registerCommand(SidebarDocHeaderFooterPanelOperation);

        const sidebarService = get(ISidebarService) as TestSidebarService;

        expect(await commandService.executeCommand(OpenHeaderFooterPanelCommand.id)).toBe(true);
        expect(sidebarService.visible).toBe(true);
        expect(sidebarService.options).toEqual(expect.objectContaining({
            width: 400,
            children: { label: COMPONENT_DOC_HEADER_FOOTER_PANEL },
        }));

        expect(await commandService.executeCommand(SidebarDocHeaderFooterPanelOperation.id, { value: 'close' })).toBe(true);
        expect(sidebarService.visible).toBe(false);
    });

    it('opens the paragraph setting panel through its controller-backed operation', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc(), [
            [ISidebarService, { useClass: TestSidebarService }],
            [DocParagraphSettingController],
        ]));
        commandService = get(ICommandService);
        commandService.registerCommand(DocParagraphSettingPanelOperation);

        const result = await commandService.executeCommand(DocParagraphSettingPanelOperation.id);
        const sidebarService = get(ISidebarService) as TestSidebarService;

        expect(result).toBe(true);
        expect(sidebarService.visible).toBe(true);
        expect(sidebarService.options).toEqual(expect.objectContaining({
            id: undefined,
            width: 300,
            children: { label: 'doc_ui_paragraph-setting-panel' },
        }));
    });

    it('switches document mode by executing the command against the current document', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(SwitchDocModeCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(1);

        const render = get(IRenderManagerService).getRenderById('test-doc')!;
        const skeletonManager = get(DocSkeletonManagerService) as unknown as { getSkeleton: () => unknown };
        const selectionRenderService = {
            getSegment: () => '',
            getSegmentPage: () => -1,
        };
        const mutableRender = render as unknown as { with: (dependency: unknown) => unknown };
        const originalWith = mutableRender.with.bind(mutableRender);
        mutableRender.with = (dependency: unknown) => {
            if (dependency === DocSkeletonManagerService) {
                skeletonManager.getSkeleton = () => ({}) as never;
                return skeletonManager;
            }
            if (dependency === DocSelectionRenderService) {
                return selectionRenderService;
            }
            return originalWith(dependency);
        };

        expect(await commandService.executeCommand(SwitchDocModeCommand.id)).toBe(true);
        await awaitTime(0);
        expect(getDoc()?.getDocumentStyle().documentFlavor).toBe(DocumentFlavor.MODERN);

        expect(await commandService.executeCommand(SwitchDocModeCommand.id)).toBe(true);
        await awaitTime(0);
        expect(getDoc()?.getDocumentStyle().documentFlavor).toBe(DocumentFlavor.TRADITIONAL);
    });

    it('reports cursor operations only when movement params are provided', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(MoveCursorOperation);
        commandService.registerCommand(MoveSelectionOperation);

        expect(await commandService.executeCommand(MoveCursorOperation.id, {
            direction: Direction.RIGHT,
            granularity: 'word',
        })).toBe(true);
        expect(await commandService.executeCommand(MoveSelectionOperation.id, {
            direction: Direction.LEFT,
            granularity: 'line',
        })).toBe(true);
        expect(await commandService.executeCommand(MoveCursorOperation.id)).toBe(false);
        expect(await commandService.executeCommand(MoveSelectionOperation.id)).toBe(false);
    });

    it('runs registered auto-format mutations for tab, after-space, and enter commands', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc()));
        univer.__getInjector().add([DocAutoFormatService]);
        commandService = get(ICommandService);
        commandService.registerCommand(TabCommand);
        commandService.registerCommand(AfterSpaceCommand);
        commandService.registerCommand(EnterCommand);

        const executed: string[] = [];
        const autoFormatService = get(DocAutoFormatService);
        const recordOperation: ICommand<{ kind: string }> = {
            id: 'test.command.auto-format-record',
            type: CommandType.OPERATION,
            handler: (_accessor, params) => {
                executed.push(params?.kind ?? 'unknown');
                return true;
            },
        };

        commandService.registerCommand(recordOperation);
        setCollapsedSelection(2);

        const register = (id: string, kind: string, match?: IAutoFormat['match']) => autoFormatService.registerAutoFormat({
            id,
            priority: 1,
            match: match ?? (() => true),
            getMutations: () => [{
                id: recordOperation.id,
                params: { kind },
            }],
        });

        const disposables = [
            register(TabCommand.id, 'tab', (context) => context.commandParams === null || (context.commandParams as { shift?: boolean }).shift !== true),
            register(AfterSpaceCommand.id, 'space'),
            register(EnterCommand.id, 'enter'),
        ];

        await commandService.executeCommand(TabCommand.id, { shift: false });
        await commandService.executeCommand(AfterSpaceCommand.id);
        await commandService.executeCommand(EnterCommand.id);

        expect(executed).toEqual(['tab', 'space', 'enter']);

        disposables.forEach((disposable) => disposable.dispose());
    });
});
