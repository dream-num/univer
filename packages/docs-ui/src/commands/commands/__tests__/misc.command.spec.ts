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
    DashStyleType,
    DataStreamTreeTokenType,
    DeleteDirection,
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
    ObjectRelativeFromV,
    PAGE_SIZE,
    PageOrientType,
    PaperType,
    PositionedObjectLayoutType,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import {
    CreateHeaderFooterCommand,
    DeleteTextCommand,
    DocContentInsertService,
    DocSelectionManagerService,
    DocSkeletonManagerService,
    HeaderFooterType,
    RichTextEditingMutation,
    SetTextSelectionsOperation,
    UpdateTextCommand,
} from '@univerjs/docs';
import { DocumentEditArea, GlyphType, IRenderManagerService } from '@univerjs/engine-render';
import { ISidebarService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocParagraphSettingController } from '../../../controllers/doc-paragraph-setting.controller';
import { DocAutoFormatService } from '../../../services/doc-auto-format.service';
import { DocIMEInputManagerService } from '../../../services/doc-ime-input-manager.service';
import { DocSelectionRenderService } from '../../../services/selection/doc-selection-render.service';
import { COMPONENT_DOC_HEADER_FOOTER_PANEL } from '../../../views/header-footer/panel/component-name';
import { PAGE_SETTING_COMPONENT_ID } from '../../../views/PageSettings';
import { COMPONENT_DOC_CREATE_TABLE_CONFIRM } from '../../../views/table/create/component-name';
import { DocCreateTableOperation } from '../../operations/doc-create-table.operation';
import { MoveCursorOperation, MoveSelectionOperation } from '../../operations/doc-cursor.operation';
import { SidebarDocHeaderFooterPanelOperation } from '../../operations/doc-header-footer-panel.operation';
import { DocParagraphSettingPanelOperation } from '../../operations/doc-paragraph-setting-panel.operation';
import { DocOpenPageSettingCommand } from '../../operations/open-page-setting.operation';
import { SetDocZoomRatioOperation } from '../../operations/set-doc-zoom-ratio.operation';
import { AfterSpaceCommand, EnterCommand, TabCommand } from '../auto-format.command';
import { BreakLineCommand } from '../break-line.command';
import { CutContentCommand } from '../clipboard.inner.command';
import {
    DeleteCurrentParagraphCommand,
    DeleteCustomBlockCommand,
    DeleteLeftCommand,
    DeleteRightCommand,
    getCursorWhenDelete,
    MergeTwoParagraphCommand,
    RemoveHorizontalLineCommand,
} from '../doc-delete.command';
import { CloseHeaderFooterCommand, CoreHeaderFooterCommand, OpenHeaderFooterPanelCommand } from '../doc-header-footer.command';
import { HorizontalLineCommand, InsertHorizontalLineBellowCommand } from '../doc-horizontal-line.command';
import { DocPageSetupCommand } from '../doc-page-setup.command';
import { DocParagraphSettingCommand } from '../doc-paragraph-setting.command';
import { DocSelectAllCommand } from '../doc-select-all.command';
import { IMEInputCommand } from '../ime-input.command';
import { InsertCustomRangeCommand } from '../insert-custom-range.command';
import {
    AlignCenterCommand,
    AlignJustifyCommand,
    AlignLeftCommand,
    AlignOperationCommand,
    AlignRightCommand,
} from '../paragraph-align.command';
import { ReplaceSelectionCommand } from '../replace-content.command';
import { SetDocZoomRatioCommand } from '../set-doc-zoom-ratio.command';
import { SwitchDocModeCommand } from '../switch-doc-mode.command';
import { CreateDocTableCommand } from '../table/doc-table-create.command';
import { DocTableInsertRowCommand } from '../table/doc-table-insert.command';
import { DocTableTabCommand } from '../table/doc-table-tab.command';
import { genEmptyTable, genTableSource } from '../table/table';
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
                sectionId: 'section_fixture_base',
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

function createColumnGroupDoc(): IDocumentData {
    const T = DataStreamTreeTokenType;
    const dataStream = `P${T.PARAGRAPH}${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}B${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_START}C${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}Z${T.PARAGRAPH}${T.SECTION_BREAK}`;
    const doc = createBaseDoc(dataStream);

    return {
        ...doc,
        body: {
            ...doc.body!,
            columnGroups: [{ columnGroupId: 'cg-1', startIndex: 2, endIndex: 13 }],
            paragraphs: [1, 5, 7, 11, 15].map((startIndex, index) => ({
                paragraphId: `column-paragraph-${index}`,
                startIndex,
            })),
            sectionBreaks: [{ sectionId: 'column-section', startIndex: 16 }],
        },
    };
}

function useLinearSkeleton(dataStream: string) {
    return {
        findNodeByCharIndex(index: number) {
            const content = dataStream[index];
            if (content == null) {
                return null;
            }

            return {
                content,
                count: 1,
                streamType: content,
            };
        },
    };
}

function createDrawingModeDoc(): IDocumentData {
    const doc = createBaseDoc('A\b\r\n');
    return {
        ...doc,
        body: {
            ...doc.body!,
            customBlocks: [{
                blockId: 'drawing-1',
                startIndex: 1,
                blockType: 'normal',
            }],
        },
        documentStyle: {
            ...doc.documentStyle!,
            documentFlavor: DocumentFlavor.TRADITIONAL,
        },
        drawings: {
            'drawing-1': {
                drawingId: 'drawing-1',
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: {
                    positionV: {
                        relativeFrom: ObjectRelativeFromV.LINE,
                        posOffset: 30,
                    },
                },
            },
        },
        drawingsOrder: ['drawing-1'],
    } as unknown as IDocumentData;
}

function createInlineDrawingDoc(): IDocumentData {
    const doc = createBaseDoc('A\bB\r\n');
    return {
        ...doc,
        body: {
            ...doc.body!,
            customBlocks: [{
                blockId: 'drawing-1',
                startIndex: 1,
                blockType: 'normal',
            }],
        },
        drawings: {
            'drawing-1': {
                drawingId: 'drawing-1',
                layoutType: PositionedObjectLayoutType.INLINE,
                docTransform: {
                    positionV: {
                        relativeFrom: ObjectRelativeFromV.PARAGRAPH,
                        posOffset: 0,
                    },
                },
            },
        },
        drawingsOrder: ['drawing-1'],
    } as unknown as IDocumentData;
}

function createCenteredEmptyParagraphDoc(): IDocumentData {
    const doc = createBaseDoc('\r\n');
    return {
        ...doc,
        body: {
            ...doc.body!,
            paragraphs: [{
                paragraphId: 'para_center_empty',
                startIndex: 0,
                paragraphStyle: {
                    horizontalAlign: HorizontalAlign.CENTER,
                },
            }],
        },
    };
}

function createHeaderFooterDoc(): IDocumentData {
    const doc = createBaseDoc();
    return {
        ...doc,
        documentStyle: {
            ...doc.documentStyle!,
            documentFlavor: DocumentFlavor.TRADITIONAL,
        },
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
                sectionId: 'section_fixture_multi',
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

function createListParagraphDoc(): IDocumentData {
    const doc = createMultiParagraphDoc();
    return {
        ...doc,
        body: {
            ...doc.body!,
            paragraphs: [
                doc.body!.paragraphs![0],
                {
                    ...doc.body!.paragraphs![1],
                    bullet: {
                        listId: 'list-1',
                        listType: 'BULLET_LIST',
                        nestingLevel: 0,
                    },
                    paragraphStyle: {
                        hanging: { v: 18 },
                    },
                },
            ],
        },
    };
}

function createHorizontalLineDoc(): IDocumentData {
    const doc = createMultiParagraphDoc();
    const body = doc.body!;
    return {
        ...doc,
        body: {
            ...body,
            paragraphs: body.paragraphs?.map((paragraph, index) => index === 0
                ? {
                    ...paragraph,
                    paragraphStyle: {
                        ...paragraph.paragraphStyle,
                        borderBottom: {
                            padding: 5,
                            color: { rgb: '#CDD0D8' },
                            width: 1,
                            dashStyle: DashStyleType.SOLID,
                        },
                    },
                }
                : paragraph),
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
                    sectionId: 'section_fixture_223',
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

function createTableCommandDoc(rowCount = 2, colCount = 2): IDocumentData {
    const table = genEmptyTable(rowCount, colCount);
    const tableSource = genTableSource(rowCount, colCount, 360);
    const suffix = 'Tail\r\n';
    const dataStream = `${table.dataStream}${suffix}`;

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
                ...table.paragraphs,
                { paragraphId: 'para_docs_ui_fixture_29', startIndex: dataStream.length - 2 },
            ],
            sectionBreaks: [
                ...table.sectionBreaks,
                {
                    sectionId: 'section_fixture_224',
                    startIndex: dataStream.length - 1,
                },
            ],
            tables: [{
                startIndex: 0,
                endIndex: table.dataStream.length,
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
        tableSource: {
            'table-1': {
                ...tableSource,
                tableId: 'table-1',
            },
        },
    };
}

function createPageFillTableCommandDoc(): IDocumentData {
    const doc = createTableCommandDoc();
    return {
        ...doc,
        documentStyle: {
            ...doc.documentStyle,
            pageSize: {
                width: 540,
                height: 840.51,
            },
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
                    sectionId: 'section_fixture_225',
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

function collectTokenRanges(dataStream: string, startToken: string, endToken: string) {
    const ranges: Array<{ startIndex: number; endIndex: number }> = [];

    for (let i = 0; i < dataStream.length; i++) {
        if (dataStream[i] !== startToken) {
            continue;
        }

        const endIndex = dataStream.indexOf(endToken, i);
        ranges.push({ startIndex: i, endIndex });
        i = endIndex;
    }

    return ranges;
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

    function useViewModelSkeleton() {
        const skeletonManager = get(DocSkeletonManagerService);
        const viewModel = skeletonManager.getViewModel();
        const mutableSkeletonManager = skeletonManager as unknown as {
            getSkeleton: () => {
                getViewModel: () => typeof viewModel;
            };
        };
        mutableSkeletonManager.getSkeleton = () => ({
            getViewModel: () => viewModel,
        });
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

    it('expands select-all from paragraph to column, column group, and document', async () => {
        ({ univer, get } = createCommandTestBed(createColumnGroupDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DocSelectAllCommand);
        commandService.registerCommand({
            id: SetTextSelectionsOperation.id,
            type: CommandType.OPERATION,
            handler: () => true,
        });
        setCollapsedSelection(4);

        const selectionManager = get(DocSelectionManagerService);
        const refreshEvents: Array<{ docRanges: Array<{ startOffset?: number; endOffset?: number }> }> = [];
        const subscription = selectionManager.refreshSelection$.subscribe((event) => event && refreshEvents.push(event));
        const selectNextScope = async (expected: Array<{ startOffset: number; endOffset: number }>) => {
            await commandService.executeCommand(DocSelectAllCommand.id);
            expect(refreshEvents.at(-1)?.docRanges.map(({ startOffset, endOffset }) => ({ startOffset, endOffset }))).toEqual(expected);
            selectionManager.__replaceTextRangesWithNoRefresh({
                isEditing: false,
                rectRanges: [],
                segmentId: '',
                segmentPage: -1,
                style: null as never,
                textRanges: expected.map((range, index) => ({
                    ...range,
                    collapsed: false,
                    endOffset: range.endOffset - 1,
                    isActive: index === 0,
                    segmentId: '',
                    style: null as never,
                })),
            }, {
                subUnitId: 'test-doc',
                unitId: 'test-doc',
            });
        };

        await selectNextScope([{ startOffset: 4, endOffset: 5 }]);
        await selectNextScope([
            { startOffset: 4, endOffset: 5 },
            { startOffset: 6, endOffset: 7 },
        ]);
        await selectNextScope([
            { startOffset: 4, endOffset: 5 },
            { startOffset: 6, endOffset: 7 },
            { startOffset: 10, endOffset: 11 },
        ]);
        await selectNextScope([
            { startOffset: 0, endOffset: 1 },
            { startOffset: 4, endOffset: 5 },
            { startOffset: 6, endOffset: 7 },
            { startOffset: 10, endOffset: 11 },
            { startOffset: 14, endOffset: 15 },
        ]);

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

    it('uses gap insertion mode for a paragraph-menu horizontal line', () => {
        const syncExecuteCommand = vi.fn(() => true);
        const accessor = {
            get: (token: unknown) => {
                if (token === ICommandService) return { syncExecuteCommand };
                if (token === IUniverInstanceService) return { getCurrentUnitOfType: () => ({ getUnitId: () => 'test-doc' }) };
                if (token === DocContentInsertService) return { consumeInsertRange: () => ({ unitId: 'test-doc', startOffset: 7, endOffset: 7 }) };
                throw new Error('unexpected dependency');
            },
        };

        expect(InsertHorizontalLineBellowCommand.handler(accessor as never)).toBe(true);
        expect(syncExecuteCommand).toHaveBeenCalledWith(HorizontalLineCommand.id, {
            insertionMode: 'insert-gap',
            insertRange: { startOffset: 7, endOffset: 7 },
        });
    });

    it('removes a horizontal line from the paragraph before the cursor', async () => {
        ({ univer, get } = createCommandTestBed(createHorizontalLineDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(RemoveHorizontalLineCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(6);

        expect(await commandService.executeCommand(RemoveHorizontalLineCommand.id)).toBe(true);
        await awaitTime(0);

        expect(getBody()?.paragraphs?.[0].paragraphStyle?.borderBottom).toBeUndefined();
    });

    it('merges adjacent paragraphs through the delete merge command', async () => {
        ({ univer, get } = createCommandTestBed(createMultiParagraphDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(MergeTwoParagraphCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(6);

        expect(await commandService.executeCommand(MergeTwoParagraphCommand.id, {
            direction: DeleteDirection.LEFT,
            range: {
                startOffset: 6,
                endOffset: 6,
                collapsed: true,
                segmentId: '',
                style: null,
            },
        })).toBe(true);
        await awaitTime(0);

        expect(getBody()?.dataStream).toBe('TitleBody\r\n');
        expect(getBody()?.paragraphs).toHaveLength(1);
    });

    it('deletes the current paragraph through rich text editing', async () => {
        ({ univer, get } = createCommandTestBed(createMultiParagraphDoc()));
        commandService = get(ICommandService);
        expect(DeleteCurrentParagraphCommand).toMatchObject({
            multi: true,
            name: DeleteCurrentParagraphCommand.id,
        });
        commandService.registerMultipleCommand(DeleteCurrentParagraphCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(2);

        expect(await commandService.executeCommand(DeleteCurrentParagraphCommand.id)).toBe(true);
        await awaitTime(0);

        expect(getBody()?.dataStream).toBe('Body\r\n');
        expect(getBody()?.paragraphs?.[0].startIndex).toBe(4);
    });

    it('removes the character before the cursor when Backspace is pressed inside text', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc('ABC\r\n')));
        commandService = get(ICommandService);
        commandService.registerCommand(DeleteLeftCommand);
        commandService.registerCommand(DeleteTextCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(2);

        const skeletonManager = get(DocSkeletonManagerService) as unknown as { getSkeleton: () => unknown };
        skeletonManager.getSkeleton = () => useLinearSkeleton('ABC\r\n');

        expect(await commandService.executeCommand(DeleteLeftCommand.id)).toBe(true);
        await awaitTime(0);

        expect(getBody()?.dataStream).toBe('AC\r\n');
    });

    it('resets a centered empty paragraph before deleting surrounding content', async () => {
        ({ univer, get } = createCommandTestBed(createCenteredEmptyParagraphDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DeleteLeftCommand);
        commandService.registerCommand(UpdateTextCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(0);

        const skeletonManager = get(DocSkeletonManagerService) as unknown as { getSkeleton: () => unknown };
        skeletonManager.getSkeleton = () => useLinearSkeleton('\r\n');

        expect(await commandService.executeCommand(DeleteLeftCommand.id)).toBe(true);
        await awaitTime(0);

        expect(getBody()?.paragraphs?.[0].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.LEFT);
    });

    it('removes a horizontal line when Backspace is pressed after the decorated paragraph break', async () => {
        ({ univer, get } = createCommandTestBed(createHorizontalLineDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DeleteLeftCommand);
        commandService.registerCommand(RemoveHorizontalLineCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(6);

        const skeletonManager = get(DocSkeletonManagerService) as unknown as { getSkeleton: () => unknown };
        skeletonManager.getSkeleton = () => useLinearSkeleton('Title\rBody\r\n');

        expect(await commandService.executeCommand(DeleteLeftCommand.id)).toBe(true);
        await awaitTime(0);

        expect(getBody()?.paragraphs?.[0].paragraphStyle?.borderBottom).toBeUndefined();
    });

    it('turns a list paragraph into an indented paragraph when Backspace is pressed at its first glyph', async () => {
        ({ univer, get } = createCommandTestBed(createListParagraphDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DeleteLeftCommand);
        commandService.registerCommand(UpdateTextCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(6);

        const skeletonManager = get(DocSkeletonManagerService) as unknown as { getSkeleton: () => unknown };
        skeletonManager.getSkeleton = () => {
            const listGlyph = { glyphType: GlyphType.LIST };
            const textGlyph = { content: 'B', count: 1, streamType: 'B' };
            const divide = {
                glyphGroup: [listGlyph, textGlyph],
                parent: undefined as unknown,
            };
            const line = {
                divides: [divide],
                paragraphIndex: 10,
            };
            divide.parent = line;
            (textGlyph as { parent?: unknown }).parent = divide;

            return {
                findNodeByCharIndex(index: number) {
                    if (index === 6) {
                        return textGlyph;
                    }

                    return useLinearSkeleton('Title\rBody\r\n').findNodeByCharIndex(index);
                },
            };
        };

        expect(await commandService.executeCommand(DeleteLeftCommand.id)).toBe(true);
        await awaitTime(0);

        const paragraphStyle = getBody()?.paragraphs?.[1].paragraphStyle;
        expect(paragraphStyle?.hanging).toBeUndefined();
        expect(paragraphStyle?.indentStart).toEqual({ v: 18 });
    });

    it('removes the character after the cursor when Delete is pressed inside text', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc('ABC\r\n')));
        commandService = get(ICommandService);
        commandService.registerCommand(DeleteRightCommand);
        commandService.registerCommand(DeleteTextCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(1);

        const skeletonManager = get(DocSkeletonManagerService) as unknown as { getSkeleton: () => unknown };
        skeletonManager.getSkeleton = () => useLinearSkeleton('ABC\r\n');

        expect(await commandService.executeCommand(DeleteRightCommand.id)).toBe(true);
        await awaitTime(0);

        expect(getBody()?.dataStream).toBe('AC\r\n');
    });

    it('merges with the next paragraph when Delete is pressed on a paragraph break', async () => {
        ({ univer, get } = createCommandTestBed(createMultiParagraphDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DeleteRightCommand);
        commandService.registerCommand(MergeTwoParagraphCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(5);

        const skeletonManager = get(DocSkeletonManagerService) as unknown as { getSkeleton: () => unknown };
        skeletonManager.getSkeleton = () => useLinearSkeleton('Title\rBody\r\n');

        expect(await commandService.executeCommand(DeleteRightCommand.id)).toBe(true);
        await awaitTime(0);

        expect(getBody()?.dataStream).toBe('TitleBody\r\n');
        expect(getBody()?.paragraphs).toHaveLength(1);
    });

    it('cuts the selected content when Delete is pressed on a non-collapsed text range', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc('ABCD\r\n')));
        commandService = get(ICommandService);
        commandService.registerCommand(DeleteRightCommand);
        commandService.registerCommand(CutContentCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(1, 3);

        const skeletonManager = get(DocSkeletonManagerService) as unknown as { getSkeleton: () => unknown };
        skeletonManager.getSkeleton = () => useLinearSkeleton('ABCD\r\n');

        expect(await commandService.executeCommand(DeleteRightCommand.id)).toBe(true);
        await awaitTime(0);

        expect(getBody()?.dataStream).toBe('AD\r\n');
    });

    it('cuts the selected content when Backspace is pressed on a non-collapsed text range', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc('ABCD\r\n')));
        commandService = get(ICommandService);
        commandService.registerCommand(DeleteLeftCommand);
        commandService.registerCommand(CutContentCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(1, 3);

        const skeletonManager = get(DocSkeletonManagerService) as unknown as { getSkeleton: () => unknown };
        skeletonManager.getSkeleton = () => useLinearSkeleton('ABCD\r\n');

        expect(await commandService.executeCommand(DeleteLeftCommand.id)).toBe(true);
        await awaitTime(0);

        expect(getBody()?.dataStream).toBe('AD\r\n');
    });

    it('removes an inline drawing when Backspace is pressed after its object marker', async () => {
        ({ univer, get } = createCommandTestBed(createInlineDrawingDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DeleteLeftCommand);
        commandService.registerCommand(DeleteCustomBlockCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(2);

        const skeletonManager = get(DocSkeletonManagerService) as unknown as { getSkeleton: () => unknown };
        skeletonManager.getSkeleton = () => ({
            findNodeByCharIndex(index: number) {
                const content = 'A\bB\r\n'[index];
                if (content == null) {
                    return null;
                }

                return {
                    content,
                    count: 1,
                    streamType: content,
                    drawingId: content === '\b' ? 'drawing-1' : undefined,
                };
            },
        });

        expect(await commandService.executeCommand(DeleteLeftCommand.id)).toBe(true);
        await awaitTime(0);

        expect(getBody()?.dataStream).toBe('AB\r\n');
        expect(getDoc()?.getSnapshot().drawings?.['drawing-1']).toBeUndefined();
    });

    it('removes an inline drawing when Delete is pressed before its object marker', async () => {
        ({ univer, get } = createCommandTestBed(createInlineDrawingDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DeleteRightCommand);
        commandService.registerCommand(DeleteCustomBlockCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(1);

        const skeletonManager = get(DocSkeletonManagerService) as unknown as { getSkeleton: () => unknown };
        skeletonManager.getSkeleton = () => ({
            findNodeByCharIndex(index: number) {
                const content = 'A\bB\r\n'[index];
                if (content == null) {
                    return null;
                }

                return {
                    content,
                    count: 1,
                    streamType: content,
                    drawingId: content === '\b' ? 'drawing-1' : undefined,
                };
            },
        });

        expect(await commandService.executeCommand(DeleteRightCommand.id)).toBe(true);
        await awaitTime(0);

        expect(getBody()?.dataStream).toBe('AB\r\n');
        expect(getDoc()?.getSnapshot().drawings?.['drawing-1']).toBeUndefined();
    });

    it('removes an inline drawing block and its drawing record from the document', async () => {
        ({ univer, get } = createCommandTestBed(createInlineDrawingDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DeleteCustomBlockCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(2);

        expect(await commandService.executeCommand(DeleteCustomBlockCommand.id, {
            unitId: 'test-doc',
            drawingId: 'drawing-1',
            direction: DeleteDirection.LEFT,
            range: {
                startOffset: 2,
                endOffset: 2,
                collapsed: true,
                segmentId: '',
            },
        })).toBe(true);
        await awaitTime(0);

        expect(getBody()?.dataStream).toBe('AB\r\n');
        expect(getDoc()?.getSnapshot().drawings?.['drawing-1']).toBeUndefined();
        expect(getDoc()?.getSnapshot().drawingsOrder).toEqual([]);
    });

    it('keeps the cursor near the deleted table area when table selections are cut', () => {
        expect(getCursorWhenDelete(null, [{
            startOffset: 20,
            endOffset: 30,
            collapsed: false,
            startRow: 0,
            startColumn: 0,
            endRow: 2,
            endColumn: 2,
            tableId: 'table-1',
            spanEntireRow: false,
            spanEntireColumn: false,
            spanEntireTable: true,
        }])).toBe(17);

        expect(getCursorWhenDelete([{ startOffset: 30, endOffset: 34, collapsed: false }], [{
            startOffset: 20,
            endOffset: 26,
            collapsed: false,
            startRow: 1,
            startColumn: 0,
            endRow: 1,
            endColumn: 2,
            tableId: 'table-1',
            spanEntireRow: true,
            spanEntireColumn: false,
            spanEntireTable: false,
        }])).toBe(14);
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

    it('aligns selected paragraphs through left and right wrappers', async () => {
        ({ univer, get } = createCommandTestBed(createMultiParagraphDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(AlignOperationCommand);
        commandService.registerCommand(AlignLeftCommand);
        commandService.registerCommand(AlignRightCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(0, 10);

        await commandService.executeCommand(AlignRightCommand.id);
        await awaitTime(0);

        expect(getBody()?.paragraphs?.[0].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.RIGHT);
        expect(getBody()?.paragraphs?.[1].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.RIGHT);

        await commandService.executeCommand(AlignLeftCommand.id);
        await awaitTime(0);

        expect(getBody()?.paragraphs?.[0].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.LEFT);
        expect(getBody()?.paragraphs?.[1].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.LEFT);
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

    it('inserts page setup values when the document has no explicit page style', async () => {
        const doc = createBaseDoc();
        doc.documentStyle = {};
        ({ univer, get } = createCommandTestBed(doc));
        commandService = get(ICommandService);
        commandService.registerCommand(DocPageSetupCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        expect(await commandService.executeCommand(DocPageSetupCommand.id, {
            documentFlavor: DocumentFlavor.MODERN,
            pageSize: PAGE_SIZE[PaperType.A4],
            pageOrient: PageOrientType.PORTRAIT,
            marginTop: 12,
            marginBottom: 18,
            marginLeft: 24,
            marginRight: 30,
        })).toBe(true);
        await awaitTime(0);

        expect(getDoc()?.getDocumentStyle()).toEqual(expect.objectContaining({
            documentFlavor: DocumentFlavor.MODERN,
            pageSize: PAGE_SIZE[PaperType.A4],
            pageOrient: PageOrientType.PORTRAIT,
            marginTop: 12,
            marginBottom: 18,
            marginLeft: 24,
            marginRight: 30,
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

    it('closes page settings without applying document setup', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc(), [
            [IConfirmService, { useClass: TestConfirmService }],
        ]));
        loadTestLocale();
        commandService = get(ICommandService);
        commandService.registerCommand(DocOpenPageSettingCommand);

        expect(await commandService.executeCommand(DocOpenPageSettingCommand.id)).toBe(true);
        const confirmService = get(IConfirmService) as TestConfirmService;
        confirmService.lastOption?.onClose?.();

        expect(confirmService.options).toEqual([]);
        expect(getDoc()?.getDocumentStyle().pageSize).toEqual({
            width: 594.3,
            height: 840.51,
        });
    });

    it('creates header and footer records while updating header footer margins', async () => {
        ({ univer, get } = createCommandTestBed(createHeaderFooterDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(CoreHeaderFooterCommand);
        commandService.registerCommand(CreateHeaderFooterCommand);
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

    it('creates footer pairs when a footer segment is requested', async () => {
        ({ univer, get } = createCommandTestBed(createHeaderFooterDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(CoreHeaderFooterCommand);
        commandService.registerCommand(CreateHeaderFooterCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        expect(await commandService.executeCommand(CoreHeaderFooterCommand.id, {
            unitId: 'test-doc',
            segmentId: 'footer-segment-1',
            createType: HeaderFooterType.DEFAULT_FOOTER,
        })).toBe(true);
        await awaitTime(0);

        const snapshot = getDoc()?.getSnapshot();
        expect(snapshot?.documentStyle.defaultFooterId).toBe('footer-segment-1');
        expect(snapshot?.documentStyle.defaultHeaderId).toEqual(expect.any(String));
        expect(snapshot?.footers?.['footer-segment-1'].body?.dataStream).toBe('\r\n');
    });

    it('creates even page footer records when header footer options require them', async () => {
        ({ univer, get } = createCommandTestBed(createHeaderFooterDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(CoreHeaderFooterCommand);
        commandService.registerCommand(CreateHeaderFooterCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        expect(await commandService.executeCommand(CoreHeaderFooterCommand.id, {
            unitId: 'test-doc',
            segmentId: 'even-footer-segment-1',
            headerFooterProps: {
                evenAndOddHeaders: BooleanNumber.TRUE,
            },
        })).toBe(true);
        await awaitTime(0);

        const snapshot = getDoc()?.getSnapshot();
        expect(snapshot?.documentStyle.evenPageFooterId).toBe('even-footer-segment-1');
        expect(snapshot?.documentStyle.evenPageHeaderId).toEqual(expect.any(String));
        expect(snapshot?.footers?.['even-footer-segment-1'].body?.dataStream).toBe('\r\n');
    });

    it('replaces existing first-page header and footer links when the section header is recreated', async () => {
        const doc = createHeaderFooterDoc();
        doc.documentStyle = {
            ...doc.documentStyle!,
            firstPageHeaderId: 'old-first-header',
            firstPageFooterId: 'old-first-footer',
        };
        doc.headers = {
            'old-first-header': {
                headerId: 'old-first-header',
                body: { dataStream: '\r\n' },
            },
        };
        doc.footers = {
            'old-first-footer': {
                footerId: 'old-first-footer',
                body: { dataStream: '\r\n' },
            },
        };
        ({ univer, get } = createCommandTestBed(doc));
        commandService = get(ICommandService);
        commandService.registerCommand(CoreHeaderFooterCommand);
        commandService.registerCommand(CreateHeaderFooterCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        expect(await commandService.executeCommand(CoreHeaderFooterCommand.id, {
            unitId: 'test-doc',
            segmentId: 'new-first-header',
            createType: HeaderFooterType.FIRST_PAGE_HEADER,
        })).toBe(true);
        await awaitTime(0);

        const snapshot = getDoc()?.getSnapshot();
        expect(snapshot?.documentStyle.firstPageHeaderId).toBe('new-first-header');
        expect(snapshot?.documentStyle.firstPageFooterId).not.toBe('old-first-footer');
        expect(snapshot?.headers?.['new-first-header'].body?.textRuns?.[0].ts?.fs).toBe(9);
    });

    it('does not create header footer history when submitted settings match the document', async () => {
        const doc = createHeaderFooterDoc();
        doc.documentStyle = {
            ...doc.documentStyle!,
            marginHeader: 30,
        };
        ({ univer, get } = createCommandTestBed(doc));
        commandService = get(ICommandService);
        commandService.registerCommand(CoreHeaderFooterCommand);
        commandService.registerCommand(CreateHeaderFooterCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        expect(await commandService.executeCommand(CoreHeaderFooterCommand.id, {
            unitId: 'test-doc',
            headerFooterProps: {
                marginHeader: 30,
            },
        })).toBe(false);
    });

    it('closes header footer editing and restores a body cursor', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc(), [
            [ISidebarService, { useClass: TestSidebarService }],
        ]));
        commandService = get(ICommandService);
        commandService.registerCommand(CloseHeaderFooterCommand);
        commandService.registerCommand(SidebarDocHeaderFooterPanelOperation);
        const sidebarService = get(ISidebarService) as TestSidebarService;
        sidebarService.open({ visible: true });

        const render = get(IRenderManagerService).getRenderById('test-doc')!;
        let clearedSelectedObjects = false;
        let markedDirty = false;
        const mutableRender = render as unknown as {
            scene: { getTransformerByCreate?: () => { clearSelectedObjects: () => void } };
            mainComponent: unknown;
            with: (dependency: unknown) => unknown;
        };
        mutableRender.scene.getTransformerByCreate = () => ({
            clearSelectedObjects: () => {
                clearedSelectedObjects = true;
            },
        });
        mutableRender.mainComponent = {
            makeDirty: (dirty: boolean) => {
                markedDirty = dirty;
            },
        };

        const skeletonManager = get(DocSkeletonManagerService) as unknown as {
            getSkeleton: () => unknown;
            getViewModel: () => { getEditArea: () => DocumentEditArea; setEditArea: (area: DocumentEditArea) => void };
        };
        let recalculated = false;
        skeletonManager.getSkeleton = () => ({
            calculate: () => {
                recalculated = true;
            },
        });
        skeletonManager.getViewModel().setEditArea(DocumentEditArea.HEADER);

        let segment = 'header-1';
        let segmentPage = 2;
        const selectionRenderService = {
            setSegment: (nextSegment: string) => {
                segment = nextSegment;
            },
            getSegment: () => segment,
            setSegmentPage: (nextSegmentPage: number) => {
                segmentPage = nextSegmentPage;
            },
            getSegmentPage: () => segmentPage,
        };
        const originalWith = mutableRender.with.bind(mutableRender);
        mutableRender.with = (dependency: unknown) => {
            if (dependency === DocSkeletonManagerService) {
                return skeletonManager;
            }
            if (dependency === DocSelectionRenderService) {
                return selectionRenderService;
            }
            return originalWith(dependency);
        };
        const selectionManager = get(DocSelectionManagerService);
        let latestSelectionRefresh: unknown;
        const subscription = selectionManager.refreshSelection$.subscribe((refresh) => {
            latestSelectionRefresh = refresh;
        });

        expect(await commandService.executeCommand(CloseHeaderFooterCommand.id, { unitId: 'test-doc' })).toBe(true);
        await awaitTime(0);

        expect(clearedSelectedObjects).toBe(true);
        expect(recalculated).toBe(true);
        expect(markedDirty).toBe(true);
        expect(selectionRenderService.getSegment()).toBe('');
        expect(selectionRenderService.getSegmentPage()).toBe(-1);
        expect(skeletonManager.getViewModel().getEditArea()).toBe(DocumentEditArea.BODY);
        expect(latestSelectionRefresh).toEqual(expect.objectContaining({
            docRanges: [expect.objectContaining({ startOffset: 0, endOffset: 0 })],
        }));
        expect(sidebarService.visible).toBe(false);
        subscription.unsubscribe();
    });

    it('closes header footer editing from the current document for shortcuts', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc(), [
            [ISidebarService, { useClass: TestSidebarService }],
        ]));
        commandService = get(ICommandService);
        commandService.registerCommand(CloseHeaderFooterCommand);
        commandService.registerCommand(SidebarDocHeaderFooterPanelOperation);

        const render = get(IRenderManagerService).getRenderById('test-doc')!;
        const mutableRender = render as unknown as {
            scene: { getTransformerByCreate?: () => { clearSelectedObjects: () => void } };
            mainComponent: unknown;
            with: (dependency: unknown) => unknown;
        };
        mutableRender.scene.getTransformerByCreate = () => ({
            clearSelectedObjects: () => undefined,
        });
        mutableRender.mainComponent = {
            makeDirty: () => undefined,
        };

        const skeletonManager = get(DocSkeletonManagerService) as unknown as {
            getSkeleton: () => unknown;
            getViewModel: () => { getEditArea: () => DocumentEditArea; setEditArea: (area: DocumentEditArea) => void };
        };
        skeletonManager.getSkeleton = () => ({
            calculate: () => undefined,
        });
        skeletonManager.getViewModel().setEditArea(DocumentEditArea.FOOTER);

        const originalWith = mutableRender.with.bind(mutableRender);
        mutableRender.with = (dependency: unknown) => {
            if (dependency === DocSkeletonManagerService) {
                return skeletonManager;
            }
            if (dependency === DocSelectionRenderService) {
                return {
                    setSegment: () => undefined,
                    setSegmentPage: () => undefined,
                };
            }
            return originalWith(dependency);
        };

        expect(await commandService.executeCommand(CloseHeaderFooterCommand.id)).toBe(true);
        expect(skeletonManager.getViewModel().getEditArea()).toBe(DocumentEditArea.BODY);
    });

    it('does not close header footer editing while already editing the body', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(CloseHeaderFooterCommand);

        const skeletonManager = get(DocSkeletonManagerService) as unknown as {
            getViewModel: () => { getEditArea: () => DocumentEditArea };
        };

        expect(skeletonManager.getViewModel().getEditArea()).toBe(DocumentEditArea.BODY);
        expect(await commandService.executeCommand(CloseHeaderFooterCommand.id)).toBe(false);
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

    it('converts body drawings to paragraph-relative vertical positions when switching from traditional mode', async () => {
        ({ univer, get } = createCommandTestBed(createDrawingModeDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(SwitchDocModeCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        setCollapsedSelection(1);

        const render = get(IRenderManagerService).getRenderById('test-doc')!;
        const skeletonManager = get(DocSkeletonManagerService) as unknown as { getSkeleton: () => unknown };
        const line = {
            top: 10,
            paragraphIndex: 0,
            parent: undefined as unknown,
        };
        const column = {
            lines: [{
                paragraphIndex: 0,
                paragraphStart: true,
                top: 2,
            }],
            parent: {
                parent: {
                    marginTop: 50,
                },
            },
        };
        line.parent = column;
        skeletonManager.getSkeleton = () => ({
            findNodeByCharIndex: () => ({
                parent: {
                    parent: line,
                },
            }),
        });
        const selectionRenderService = {
            getSegment: () => '',
            getSegmentPage: () => -1,
        };
        const mutableRender = render as unknown as { with: (dependency: unknown) => unknown };
        const originalWith = mutableRender.with.bind(mutableRender);
        mutableRender.with = (dependency: unknown) => {
            if (dependency === DocSkeletonManagerService) {
                return skeletonManager;
            }
            if (dependency === DocSelectionRenderService) {
                return selectionRenderService;
            }
            return originalWith(dependency);
        };

        expect(await commandService.executeCommand(SwitchDocModeCommand.id)).toBe(true);
        await awaitTime(0);

        const drawingPosition = getDoc()?.getSnapshot().drawings?.['drawing-1'].docTransform.positionV;
        expect(getDoc()?.getDocumentStyle().documentFlavor).toBe(DocumentFlavor.MODERN);
        expect(drawingPosition).toEqual(expect.objectContaining({
            relativeFrom: ObjectRelativeFromV.PARAGRAPH,
            posOffset: 38,
        }));
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

    it('inserts IME composition text at the cached active range', async () => {
        const doc = createBaseDoc('AB\r\n');
        doc.body!.customDecorations = [{
            startIndex: 0,
            endIndex: 1,
            id: 'mention-1',
            type: CustomRangeType.MENTION,
            properties: {},
        }] as never;
        ({ univer, get } = createCommandTestBed(doc));
        commandService = get(ICommandService);
        commandService.registerCommand(IMEInputCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const imeInputManagerService = get(DocIMEInputManagerService);
        imeInputManagerService.setActiveRange({
            startOffset: 1,
            endOffset: 1,
            collapsed: true,
            segmentId: '',
        });

        expect(await commandService.executeCommand(IMEInputCommand.id, {
            unitId: 'test-doc',
            newText: '你',
            oldTextLen: 0,
            isCompositionStart: false,
            isCompositionEnd: true,
        })).toBe(true);
        await awaitTime(0);

        expect(getBody()?.dataStream).toBe('A你B\r\n');
        expect(getBody()?.customDecorations?.[0]).toEqual(expect.objectContaining({
            startIndex: 0,
            endIndex: 2,
        }));
        const cache = imeInputManagerService.getUndoRedoMutationParamsCache();
        expect(cache.undoCache).toHaveLength(1);
        expect(cache.redoCache[0].isCompositionEnd).toBe(true);
    });

    it('replaces selected text when IME composition starts with a non-collapsed range', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc('Hello\r\n')));
        commandService = get(ICommandService);
        commandService.registerCommand(IMEInputCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        get(DocIMEInputManagerService).setActiveRange({
            startOffset: 1,
            endOffset: 4,
            collapsed: false,
            segmentId: '',
        });

        expect(await commandService.executeCommand(IMEInputCommand.id, {
            unitId: 'test-doc',
            newText: '你',
            oldTextLen: 0,
            isCompositionStart: true,
            isCompositionEnd: false,
        })).toBe(true);
        await awaitTime(0);

        expect(getBody()?.dataStream).toBe('H你o\r\n');
        expect(get(DocIMEInputManagerService).getUndoRedoMutationParamsCache().redoCache[0].noHistory).toBe(true);
    });

    it('opens the create-table confirm flow and forwards the confirmed size to the table command', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc(), [
            [IConfirmService, { useClass: TestConfirmService }],
        ]));
        loadTestLocale();
        commandService = get(ICommandService);
        const createdTables: Array<{ rowCount: number; colCount: number }> = [];
        commandService.registerCommand(DocCreateTableOperation);
        commandService.registerCommand({
            id: CreateDocTableCommand.id,
            type: CommandType.COMMAND,
            handler: (_accessor, params: { rowCount: number; colCount: number }) => {
                createdTables.push(params);
                return true;
            },
        });

        const result = await commandService.executeCommand(DocCreateTableOperation.id);
        const confirmService = get(IConfirmService) as TestConfirmService;
        const children = confirmService.lastOption?.children as {
            label: {
                name: string;
                props: {
                    handleRowColChange: (rowCount: number, colCount: number) => void;
                    tableCreateParams: { rowCount: number; colCount: number };
                };
            };
        };

        expect(result).toBe(true);
        expect(confirmService.lastOption).toEqual(expect.objectContaining({
            id: 'doc.component.create-table-confirm',
            width: 'auto',
        }));
        expect(children.label.name).toBe(COMPONENT_DOC_CREATE_TABLE_CONFIRM);
        expect(children.label.props.tableCreateParams).toEqual({
            rowCount: 3,
            colCount: 5,
        });

        children.label.props.handleRowColChange(4, 2);
        expect(children.label.props.tableCreateParams).toEqual({
            rowCount: 4,
            colCount: 2,
        });

        confirmService.lastOption?.onConfirm?.({});
        await awaitTime(0);

        expect(createdTables).toEqual([{
            rowCount: 4,
            colCount: 2,
        }]);
        expect(confirmService.closedIds).toContain('doc.component.create-table-confirm');
    });

    it('closes the create-table confirm flow without creating a table', async () => {
        ({ univer, get } = createCommandTestBed(createBaseDoc(), [
            [IConfirmService, { useClass: TestConfirmService }],
        ]));
        loadTestLocale();
        commandService = get(ICommandService);
        const createdTables: Array<{ rowCount: number; colCount: number }> = [];
        commandService.registerCommand(DocCreateTableOperation);
        commandService.registerCommand({
            id: CreateDocTableCommand.id,
            type: CommandType.COMMAND,
            handler: (_accessor, params: { rowCount: number; colCount: number }) => {
                createdTables.push(params);
                return true;
            },
        });

        expect(await commandService.executeCommand(DocCreateTableOperation.id)).toBe(true);
        const confirmService = get(IConfirmService) as TestConfirmService;
        confirmService.lastOption?.onClose?.();

        expect(createdTables).toEqual([]);
        expect(confirmService.closedIds).toContain('doc.component.create-table-confirm');
    });

    it('moves table tab selection to the next cell', async () => {
        ({ univer, get } = createCommandTestBed(createTableCommandDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DocTableTabCommand);
        useViewModelSkeleton();

        const cellRanges = collectTokenRanges(
            getBody()?.dataStream ?? '',
            DataStreamTreeTokenType.TABLE_CELL_START,
            DataStreamTreeTokenType.TABLE_CELL_END
        );
        setCollapsedSelection(cellRanges[0].startIndex + 1);
        const selectionManager = get(DocSelectionManagerService);
        const refreshEvents: Array<unknown> = [];
        const subscription = selectionManager.refreshSelection$.subscribe((event) => {
            if (event) {
                refreshEvents.push(event);
            }
        });

        expect(await commandService.executeCommand(DocTableTabCommand.id, { shift: false })).toBe(true);

        expect(refreshEvents.at(-1)).toEqual(expect.objectContaining({
            docRanges: [expect.objectContaining({
                startOffset: cellRanges[1].startIndex + 1,
                endOffset: cellRanges[1].endIndex - 2,
            })],
        }));

        subscription.unsubscribe();
    });

    it('moves table tab selection to the previous cell when shift is held', async () => {
        ({ univer, get } = createCommandTestBed(createTableCommandDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DocTableTabCommand);
        useViewModelSkeleton();

        const cellRanges = collectTokenRanges(
            getBody()?.dataStream ?? '',
            DataStreamTreeTokenType.TABLE_CELL_START,
            DataStreamTreeTokenType.TABLE_CELL_END
        );
        setCollapsedSelection(cellRanges[2].startIndex + 1);
        const selectionManager = get(DocSelectionManagerService);
        const refreshEvents: Array<unknown> = [];
        const subscription = selectionManager.refreshSelection$.subscribe((event) => {
            if (event) {
                refreshEvents.push(event);
            }
        });

        expect(await commandService.executeCommand(DocTableTabCommand.id, { shift: true })).toBe(true);

        expect(refreshEvents.at(-1)).toEqual(expect.objectContaining({
            docRanges: [expect.objectContaining({
                startOffset: cellRanges[1].startIndex + 1,
                endOffset: cellRanges[1].endIndex - 2,
            })],
        }));

        subscription.unsubscribe();
    });

    it('inserts a row when tab is pressed in the last table cell', async () => {
        ({ univer, get } = createCommandTestBed(createTableCommandDoc()));
        commandService = get(ICommandService);
        commandService.registerCommand(DocTableTabCommand);
        commandService.registerCommand(DocTableInsertRowCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        useViewModelSkeleton();

        const cellRanges = collectTokenRanges(
            getBody()?.dataStream ?? '',
            DataStreamTreeTokenType.TABLE_CELL_START,
            DataStreamTreeTokenType.TABLE_CELL_END
        );
        setCollapsedSelection(cellRanges[3].startIndex + 1);

        expect(await commandService.executeCommand(DocTableTabCommand.id, { shift: false })).toBe(true);
        await awaitTime(0);

        expect(getDoc()?.getSnapshot().tableSource?.['table-1'].tableRows).toHaveLength(3);
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
