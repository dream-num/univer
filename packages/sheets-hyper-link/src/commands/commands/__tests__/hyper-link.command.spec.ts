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

import type { DocumentDataModel, ICommand, ICustomRange, IDocumentData, IWorkbookData, Workbook } from '@univerjs/core';
import {
    CellValueType,
    createIdentifier,
    CustomRangeType,
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocStateEmitService, RichTextEditingMutation } from '@univerjs/docs';
import { SetRangeValuesMutation, SheetInterceptorService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HyperLinkModel } from '../../../models/hyper-link.model';
import { AddHyperLinkMutation } from '../../mutations/add-hyper-link.mutation';
import { RemoveHyperLinkMutation } from '../../mutations/remove-hyper-link.mutation';
import { UpdateHyperLinkMutation } from '../../mutations/update-hyper-link.mutation';
import { AddHyperLinkCommand, AddRichHyperLinkCommand } from '../add-hyper-link.command';
import { CancelHyperLinkCommand, CancelRichHyperLinkCommand } from '../remove-hyper-link.command';
import { UpdateHyperLinkCommand, UpdateRichHyperLinkCommand } from '../update-hyper-link.command';

const unitId = 'hyper-link-command-workbook';
const subUnitId = 'sheet-1';
const documentId = 'rich-hyper-link-doc';
const IRenderManagerServiceIdentifier = createIdentifier<TestRenderManagerService>('engine-render.render-manager.service');

class TestRenderManagerService {
    getRenderUnitById() {
        return null;
    }
}

function createCellDocument(text: string, rangeId: string, url: string) {
    return {
        id: `${rangeId}-doc`,
        documentStyle: {
            pageSize: { width: 100, height: 40 },
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
        },
        body: {
            dataStream: `${text}\r\n`,
            customRanges: [{
                rangeId,
                rangeType: CustomRangeType.HYPERLINK,
                startIndex: 0,
                endIndex: text.length - 1,
                properties: {
                    url,
                },
            }],
        },
    };
}

function createWorkbookData(): IWorkbookData {
    return {
        id: unitId,
        appVersion: '3.0.0-alpha',
        name: 'hyperlink command workbook',
        locale: LocaleType.EN_US,
        sheetOrder: [subUnitId],
        styles: {},
        sheets: {
            [subUnitId]: {
                id: subUnitId,
                name: 'Sheet 1',
                cellData: {
                    1: {
                        1: {
                            p: createCellDocument('Old', 'cancel-link', 'https://old.invalid'),
                            t: CellValueType.STRING,
                        },
                    },
                    2: {
                        2: {
                            p: createCellDocument('Before', 'update-link', 'https://before.invalid'),
                            t: CellValueType.STRING,
                        },
                    },
                },
            },
        },
    };
}

function createDocData(): IDocumentData {
    return {
        id: documentId,
        body: {
            dataStream: 'Existing\r\n',
            customRanges: [{
                rangeId: 'rich-existing',
                rangeType: CustomRangeType.HYPERLINK,
                startIndex: 0,
                endIndex: 7,
                properties: {
                    url: 'https://before.invalid',
                },
            }],
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

function findHyperLinkRange(workbook: Workbook, row: number, column: number, rangeId: string): ICustomRange | undefined {
    const ranges = workbook.getSheetBySheetId(subUnitId)?.getCellRaw(row, column)?.p?.body?.customRanges ?? [];
    for (const range of ranges) {
        if (range.rangeId === rangeId) {
            return range;
        }
    }

    return undefined;
}

describe('sheet hyperlink commands', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let workbook: Workbook;
    let doc: DocumentDataModel;
    let hyperLinkModel: HyperLinkModel;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([SheetInterceptorService]);
        injector.add([HyperLinkModel]);
        injector.add([DocSelectionManagerService]);
        injector.add([DocStateEmitService]);
        injector.add([IRenderManagerServiceIdentifier, { useClass: TestRenderManagerService }]);

        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
        doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createDocData());
        injector.get(IUniverInstanceService).focusUnit(unitId);

        commandService = injector.get(ICommandService);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(AddHyperLinkMutation);
        commandService.registerCommand(UpdateHyperLinkMutation);
        commandService.registerCommand(RemoveHyperLinkMutation);
        commandService.registerCommand(AddHyperLinkCommand);
        commandService.registerCommand(UpdateHyperLinkCommand);
        commandService.registerCommand(CancelHyperLinkCommand);
        commandService.registerCommand(AddRichHyperLinkCommand);
        commandService.registerCommand(UpdateRichHyperLinkCommand);
        commandService.registerCommand(CancelRichHyperLinkCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        hyperLinkModel = injector.get(HyperLinkModel);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('adds a hyperlink display value to the selected sheet cell', async () => {
        const result = await commandService.executeCommand(AddHyperLinkCommand.id, {
            unitId,
            subUnitId,
            link: {
                id: 'added-link',
                row: 0,
                column: 0,
                payload: 'https://added.invalid',
                display: 'Added',
            },
        });

        const cell = workbook.getSheetBySheetId(subUnitId)?.getCellRaw(0, 0);
        const range = findHyperLinkRange(workbook, 0, 0, 'added-link');

        expect(result).toBe(true);
        expect(cell?.p?.body?.dataStream).toBe('Added\r\n');
        expect(range).toMatchObject({
            rangeType: CustomRangeType.HYPERLINK,
            startIndex: 0,
            endIndex: 4,
            properties: {
                url: 'https://added.invalid',
            },
        });
    });

    it('replaces the previous hyperlink model when adding a new link to the same cell', async () => {
        hyperLinkModel.addHyperLink(unitId, subUnitId, {
            id: 'cancel-link',
            row: 1,
            column: 1,
            payload: 'https://old.invalid',
            display: 'Old',
        });

        const result = await commandService.executeCommand(AddHyperLinkCommand.id, {
            unitId,
            subUnitId,
            link: {
                id: 'replacement-link',
                row: 1,
                column: 1,
                payload: 'https://replacement.invalid',
                display: 'Replacement',
            },
        });

        const cell = workbook.getSheetBySheetId(subUnitId)?.getCellRaw(1, 1);
        const range = findHyperLinkRange(workbook, 1, 1, 'replacement-link');

        expect(result).toBe(true);
        expect(cell?.p?.body?.dataStream).toBe('Replacement\r\n');
        expect(range).toMatchObject({
            rangeType: CustomRangeType.HYPERLINK,
            startIndex: 0,
            endIndex: 10,
            properties: {
                url: 'https://replacement.invalid',
            },
        });
        expect(hyperLinkModel.getHyperLink(unitId, subUnitId, 'cancel-link')).toBeUndefined();
    });

    it('removes a hyperlink from the cell document and hyperlink model', async () => {
        hyperLinkModel.addHyperLink(unitId, subUnitId, {
            id: 'cancel-link',
            row: 1,
            column: 1,
            payload: 'https://old.invalid',
            display: 'Old',
        });

        const result = await commandService.executeCommand(CancelHyperLinkCommand.id, {
            unitId,
            subUnitId,
            id: 'cancel-link',
            row: 1,
            column: 1,
        });

        expect(result).toBe(true);
        expect(findHyperLinkRange(workbook, 1, 1, 'cancel-link')).toBeUndefined();
        expect(hyperLinkModel.getHyperLink(unitId, subUnitId, 'cancel-link')).toBeUndefined();
    });

    it('updates a hyperlink label and target in the cell document', async () => {
        hyperLinkModel.addHyperLink(unitId, subUnitId, {
            id: 'update-link',
            row: 2,
            column: 2,
            payload: 'https://before.invalid',
            display: 'Before',
        });

        const result = await commandService.executeCommand(UpdateHyperLinkCommand.id, {
            unitId,
            subUnitId,
            id: 'update-link',
            row: 2,
            column: 2,
            payload: {
                payload: 'https://after.invalid',
                display: 'After',
            },
        });

        const cell = workbook.getSheetBySheetId(subUnitId)?.getCellRaw(2, 2);
        const updatedRange = cell?.p?.body?.customRanges?.[0];

        expect(result).toBe(true);
        expect(cell?.p?.body?.dataStream).toBe('After\r\n');
        expect(updatedRange).toMatchObject({
            rangeType: CustomRangeType.HYPERLINK,
            startIndex: 0,
            endIndex: 4,
            properties: {
                url: 'https://after.invalid',
            },
        });
        expect(hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, 2, 2)).toBeUndefined();
    });

    it('adds a rich hyperlink to the selected document text', async () => {
        const selectionManager = univer.__getInjector().get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: documentId,
            subUnitId: documentId,
        });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 8,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        const result = await commandService.executeCommand(AddRichHyperLinkCommand.id, {
            documentId,
            link: {
                id: 'ignored-source-id',
                row: 0,
                column: 0,
                payload: 'https://rich-added.invalid',
            },
        });

        let addedRange;
        for (const range of doc.getBody()?.customRanges ?? []) {
            if (range.properties?.url === 'https://rich-added.invalid') {
                addedRange = range;
                break;
            }
        }

        expect(result).toBeTruthy();
        expect(addedRange).toMatchObject({
            rangeType: CustomRangeType.HYPERLINK,
            startIndex: 0,
            endIndex: 7,
            properties: {
                url: 'https://rich-added.invalid',
            },
        });
    });

    it('updates a rich hyperlink label and URL in the document body', async () => {
        const result = await commandService.executeCommand(UpdateRichHyperLinkCommand.id, {
            documentId,
            id: 'rich-existing',
            payload: {
                payload: 'https://rich-after.invalid',
                display: 'Updated',
            },
        });

        const range = doc.getBody()?.customRanges?.[0];

        expect(result).toBeTruthy();
        expect(doc.getBody()?.dataStream).toBe('Updated\r\n');
        expect(range).toMatchObject({
            rangeType: CustomRangeType.HYPERLINK,
            startIndex: 0,
            endIndex: 6,
            properties: {
                url: 'https://rich-after.invalid',
            },
        });
    });

    it('removes a rich hyperlink from the document body', async () => {
        const result = await commandService.executeCommand(CancelRichHyperLinkCommand.id, {
            documentId,
            unitId,
            subUnitId,
            id: 'rich-existing',
            row: 0,
            column: 0,
        });

        let existingRange;
        for (const range of doc.getBody()?.customRanges ?? []) {
            if (range.rangeId === 'rich-existing') {
                existingRange = range;
                break;
            }
        }

        expect(result).toBeTruthy();
        expect(existingRange).toBeUndefined();
    });
});
