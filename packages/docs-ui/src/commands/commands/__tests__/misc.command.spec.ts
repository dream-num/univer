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

import type { DocumentDataModel, ICommand, IDocumentData, Injector, Univer } from '@univerjs/core';
import type { IAutoFormat } from '../../../services/doc-auto-format.service';
import {
    CommandType,
    CustomRangeType,
    HorizontalAlign,
    ICommandService,
    IUniverInstanceService,
    NamedStyleType,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { afterEach, describe, expect, it } from 'vitest';
import { DocAutoFormatService } from '../../../services/doc-auto-format.service';
import { SetDocZoomRatioOperation } from '../../operations/set-doc-zoom-ratio.operation';
import { AfterSpaceCommand, EnterCommand, TabCommand } from '../auto-format.command';
import { BreakLineCommand } from '../break-line.command';
import { HorizontalLineCommand, InsertHorizontalLineBellowCommand } from '../doc-horizontal-line.command';
import { DocParagraphSettingCommand } from '../doc-paragraph-setting.command';
import { DocSelectAllCommand } from '../doc-select-all.command';
import { InsertCustomRangeCommand } from '../insert-custom-range.command';
import { AlignCenterCommand, AlignJustifyCommand, AlignOperationCommand } from '../paragraph-align.command';
import { ReplaceSelectionCommand } from '../replace-content.command';
import { SetDocZoomRatioCommand } from '../set-doc-zoom-ratio.command';
import { genEmptyTable } from '../table/table';
import { createCommandTestBed } from './create-command-test-bed';

function waitNextTick() {
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
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
            paragraphs: [{
                startIndex: dataStream.length - 2,
            }],
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
            paragraphs: [{
                startIndex: 5,
                paragraphStyle: {
                    namedStyleType: NamedStyleType.HEADING_1,
                    headingId: 'heading-1',
                },
            }, {
                startIndex: 10,
            }],
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
                {
                    startIndex: dataStream.length - 2,
                },
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

        await waitNextTick();

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

        await waitNextTick();

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
        await waitNextTick();

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

    it('selects text and table ranges when tables are present', async () => {
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
        await waitNextTick();

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
                expect.objectContaining({
                    startOffset: 5,
                    endOffset: 19,
                    rangeType: 'RECT',
                }),
                expect.objectContaining({
                    startOffset: 24,
                    endOffset: 26,
                    rangeType: 'TEXT',
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

        await waitNextTick();
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

        await waitNextTick();
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
        await waitNextTick();

        expect(getBody()?.paragraphs?.[0].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.CENTER);
        expect(getBody()?.paragraphs?.[1].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.CENTER);

        await commandService.executeCommand(AlignCenterCommand.id);
        await waitNextTick();

        expect(getBody()?.paragraphs?.[0].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.UNSPECIFIED);
        expect(getBody()?.paragraphs?.[1].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.UNSPECIFIED);

        await commandService.executeCommand(AlignJustifyCommand.id);
        await waitNextTick();

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
