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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { ISheetHyperLink } from '../../../types/interfaces/i-hyper-link';
import { CustomRangeType, ICommandService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HyperLinkModel } from '../../../models/hyper-link.model';
import { AddHyperLinkMutation } from '../add-hyper-link.mutation';
import { RemoveHyperLinkMutation } from '../remove-hyper-link.mutation';
import { UpdateHyperLinkMutation, UpdateHyperLinkRefMutation, UpdateRichHyperLinkMutation } from '../update-hyper-link.mutation';

const unitId = 'hyper-link-workbook';
const subUnitId = 'sheet-1';

const workbookData: IWorkbookData = {
    id: unitId,
    appVersion: '3.0.0-alpha',
    name: 'hyperlink workbook',
    locale: LocaleType.EN_US,
    sheetOrder: [subUnitId],
    styles: {},
    sheets: {
        [subUnitId]: {
            id: subUnitId,
            name: 'Sheet 1',
            cellData: {
                4: {
                    3: {
                        p: {
                            id: 'cell-doc',
                            documentStyle: {
                                pageSize: {
                                    width: 100,
                                    height: 40,
                                },
                                marginTop: 0,
                                marginBottom: 0,
                                marginLeft: 0,
                                marginRight: 0,
                            },
                            body: {
                                dataStream: 'Docs\r\n',
                                customRanges: [{
                                    rangeId: 'rich-link',
                                    rangeType: CustomRangeType.HYPERLINK,
                                    startIndex: 0,
                                    endIndex: 3,
                                    properties: {
                                        url: 'https://old.invalid',
                                    },
                                }],
                            },
                        },
                    },
                },
            },
        },
    },
};

function createLink(overrides: Partial<ISheetHyperLink> = {}): ISheetHyperLink {
    return {
        id: 'link-1',
        row: 0,
        column: 0,
        payload: 'https://univer.ai',
        display: 'Univer',
        ...overrides,
    };
}

describe('sheet hyperlink mutations', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let hyperLinkModel: HyperLinkModel;
    let workbook: Workbook;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([HyperLinkModel]);

        commandService = injector.get(ICommandService);
        commandService.registerCommand(AddHyperLinkMutation);
        commandService.registerCommand(UpdateHyperLinkMutation);
        commandService.registerCommand(UpdateHyperLinkRefMutation);
        commandService.registerCommand(UpdateRichHyperLinkMutation);
        commandService.registerCommand(RemoveHyperLinkMutation);
        hyperLinkModel = injector.get(HyperLinkModel);
        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('adds and updates the hyperlink attached to a cell', async () => {
        const addResult = await commandService.executeCommand(AddHyperLinkMutation.id, {
            unitId,
            subUnitId,
            link: createLink(),
        });
        const updateResult = await commandService.executeCommand(UpdateHyperLinkMutation.id, {
            unitId,
            subUnitId,
            id: 'link-1',
            payload: {
                payload: 'https://docs.univer.ai',
                display: 'Docs',
            },
        });

        expect(addResult).toBe(true);
        expect(updateResult).toBe(true);
        expect(hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, 0, 0)).toMatchObject({
            id: 'link-1',
            payload: 'https://docs.univer.ai',
            display: 'Docs',
        });
    });

    it('moves a hyperlink to a new cell and clears its original location', async () => {
        await commandService.executeCommand(AddHyperLinkMutation.id, {
            unitId,
            subUnitId,
            link: createLink(),
        });

        const moveResult = await commandService.executeCommand(UpdateHyperLinkRefMutation.id, {
            unitId,
            subUnitId,
            id: 'link-1',
            row: 3,
            column: 2,
        });

        expect(moveResult).toBe(true);
        expect(hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, 0, 0)).toBeUndefined();
        expect(hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, 3, 2)).toMatchObject({
            id: 'link-1',
            row: 3,
            column: 2,
        });
    });

    it('removes a hyperlink from both id and cell lookup', async () => {
        await commandService.executeCommand(AddHyperLinkMutation.id, {
            unitId,
            subUnitId,
            link: createLink(),
        });

        const removeResult = await commandService.executeCommand(RemoveHyperLinkMutation.id, {
            unitId,
            subUnitId,
            id: 'link-1',
        });

        expect(removeResult).toBe(true);
        expect(hyperLinkModel.getHyperLink(unitId, subUnitId, 'link-1')).toBeUndefined();
        expect(hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, 0, 0)).toBeUndefined();
    });

    it('updates the URL stored in a rich hyperlink cell range', async () => {
        const result = await commandService.executeCommand(UpdateRichHyperLinkMutation.id, {
            unitId,
            subUnitId,
            row: 4,
            col: 3,
            id: 'rich-link',
            url: 'https://new.invalid',
        });

        let updatedUrl = '';
        const ranges = workbook.getSheetBySheetId(subUnitId)?.getCellRaw(4, 3)?.p?.body?.customRanges ?? [];
        for (const range of ranges) {
            if (range.rangeId === 'rich-link') {
                updatedUrl = range.properties?.url ?? '';
                break;
            }
        }

        expect(result).toBe(true);
        expect(updatedUrl).toBe('https://new.invalid');
    });
});
