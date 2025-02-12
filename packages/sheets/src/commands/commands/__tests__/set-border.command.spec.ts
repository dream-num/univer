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

import type { IBorderData, Injector, IRange, Univer } from '@univerjs/core';
import { BorderStyleTypes, BorderType, ICommandService, IUniverInstanceService, RANGE_TYPE } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { AddWorksheetMergeAllCommand, AddWorksheetMergeCommand } from '../add-worksheet-merge.command';
import { RemoveWorksheetMergeCommand } from '../remove-worksheet-merge.command';
import {
    SetBorderBasicCommand,
    SetBorderColorCommand,
    SetBorderCommand,
    SetBorderPositionCommand,
    SetBorderStyleCommand,
} from '../set-border-command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test style commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let getBorder: ({ startRow, startColumn }: IRange) => IBorderData | undefined;
    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;
        getBorder = ({ startRow, startColumn }: IRange): IBorderData | undefined => {
            return get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn)
                .getBorder();
        };

        commandService = get(ICommandService);
        [
            SetBorderBasicCommand,
            SetBorderColorCommand,
            SetBorderStyleCommand,
            SetBorderCommand,
            SetBorderPositionCommand,
            AddWorksheetMergeCommand,
            AddWorksheetMergeAllCommand,
            RemoveWorksheetMergeCommand,
            AddWorksheetMergeMutation,
            RemoveWorksheetMergeMutation,
            SetRangeValuesMutation,
        ].forEach((c) => commandService.registerCommand(c));
    });

    afterEach(() => univer.dispose());

    describe('set border style', () => {
        describe('correct situations', () => {
            it('will set border style when there is a selected range', async () => {
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 5, endRow: 5, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                expect(
                    await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.TOP })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderColorCommand.id, { value: '#abcdef' })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderStyleCommand.id, { value: BorderStyleTypes.DOTTED })
                ).toBeTruthy();
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 })?.t).toStrictEqual({
                    s: BorderStyleTypes.DOTTED,
                    cl: { rgb: '#abcdef' },
                });

                expect(
                    await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.LEFT })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderColorCommand.id, { value: '#123456' })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderStyleCommand.id, { value: BorderStyleTypes.DASHED })
                ).toBeTruthy();
                expect(getBorder({ startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 })?.l).toStrictEqual({
                    s: BorderStyleTypes.DASHED,
                    cl: { rgb: '#123456' },
                });

                expect(
                    await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.BOTTOM })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderColorCommand.id, { value: '#654321' })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderStyleCommand.id, { value: BorderStyleTypes.DASH_DOT })
                ).toBeTruthy();
                expect(getBorder({ startRow: 5, endRow: 5, startColumn: 0, endColumn: 0 })?.b).toStrictEqual({
                    s: BorderStyleTypes.DASH_DOT,
                    cl: { rgb: '#654321' },
                });

                expect(
                    await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.RIGHT })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderColorCommand.id, { value: '#666666' })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderStyleCommand.id, { value: BorderStyleTypes.DOUBLE })
                ).toBeTruthy();
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 5, endColumn: 5 })?.r).toStrictEqual({
                    s: BorderStyleTypes.DOUBLE,
                    cl: { rgb: '#666666' },
                });

                expect(
                    await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.VERTICAL })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderColorCommand.id, { value: '#777777' })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderStyleCommand.id, { value: BorderStyleTypes.HAIR })
                ).toBeTruthy();
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 })?.r).toStrictEqual({
                    s: BorderStyleTypes.HAIR,
                    cl: { rgb: '#777777' },
                });

                expect(
                    await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.HORIZONTAL })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderColorCommand.id, { value: '#111111' })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderStyleCommand.id, { value: BorderStyleTypes.MEDIUM })
                ).toBeTruthy();
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 })?.b).toStrictEqual({
                    s: BorderStyleTypes.MEDIUM,
                    cl: { rgb: '#111111' },
                });

                expect(
                    await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.NONE })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderColorCommand.id, { value: '#111111' })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderStyleCommand.id, { value: BorderStyleTypes.MEDIUM })
                ).toBeTruthy();
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 })?.b).toBeNull();

                expect(
                    await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.OUTSIDE })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderColorCommand.id, { value: '#333333' })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderStyleCommand.id, {
                        value: BorderStyleTypes.MEDIUM_DASHED,
                    })
                ).toBeTruthy();
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 })?.l).toStrictEqual({
                    s: BorderStyleTypes.MEDIUM_DASHED,
                    cl: { rgb: '#333333' },
                });

                expect(
                    await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.INSIDE })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderColorCommand.id, { value: '#888888' })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderStyleCommand.id, {
                        value: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
                    })
                ).toBeTruthy();
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 })?.b).toStrictEqual({
                    s: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
                    cl: { rgb: '#888888' },
                });

                expect(
                    await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.NONE })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderColorCommand.id, { value: '#888888' })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderStyleCommand.id, {
                        value: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
                    })
                ).toBeTruthy();
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 })?.b).toBeNull();

                expect(
                    await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.ALL })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderColorCommand.id, { value: '#aaaaaa' })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderStyleCommand.id, {
                        value: BorderStyleTypes.SLANT_DASH_DOT,
                    })
                ).toBeTruthy();
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 })?.b).toStrictEqual({
                    s: BorderStyleTypes.SLANT_DASH_DOT,
                    cl: { rgb: '#aaaaaa' },
                });

                expect(await commandService.executeCommand(AddWorksheetMergeAllCommand.id)).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.ALL })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderColorCommand.id, { value: '#aaaaaa' })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderStyleCommand.id, {
                        value: BorderStyleTypes.SLANT_DASH_DOT,
                    })
                ).toBeTruthy();
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 })?.b).toStrictEqual({
                    s: BorderStyleTypes.SLANT_DASH_DOT,
                    cl: { rgb: '#aaaaaa' },
                });

                expect(
                    await commandService.executeCommand(SetBorderBasicCommand.id, {
                        value: {
                            type: BorderType.TOP,
                            color: '#123456',
                            style: BorderStyleTypes.DASHED,
                        },
                    })
                ).toBeTruthy();
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 })?.t).toStrictEqual({
                    s: BorderStyleTypes.DASHED,
                    cl: { rgb: '#123456' },
                });
            });

            it('set border for range has merged and unmerged cells', async () => {
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 5, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                expect(await commandService.executeCommand(AddWorksheetMergeAllCommand.id)).toBeTruthy();
                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                expect(
                    await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.ALL })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderColorCommand.id, { value: '#aaaaaa' })
                ).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderStyleCommand.id, {
                        value: BorderStyleTypes.SLANT_DASH_DOT,
                    })
                ).toBeTruthy();

                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 5, endColumn: 5 })?.r).toStrictEqual({
                    s: BorderStyleTypes.SLANT_DASH_DOT,
                    cl: { rgb: '#aaaaaa' },
                });

                selectionManager.clear();
                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);
                await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.NONE });
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 5, endColumn: 5 })?.r).toBeNull();

                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);
                // executeCommand('sheet.command.set-border-position', { value: 'inside' })
                await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.INSIDE });
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 5, endColumn: 5 })?.r).toBeFalsy();
                expect(getBorder({ startRow: 1, endRow: 1, startColumn: 5, endColumn: 5 })?.r).toBeFalsy();
                expect(getBorder({ startRow: 1, endRow: 1, startColumn: 5, endColumn: 5 })?.b).not.toBeNull();
                expect(getBorder({ startRow: 1, endRow: 1, startColumn: 5, endColumn: 5 })?.t).not.toBeNull();
                expect(getBorder({ startRow: 1, endRow: 1, startColumn: 5, endColumn: 5 })?.l).not.toBeNull();
            });

            it('set border and clear border in adjacent cells', async () => {
                // merge B1:B3, and set BorderType.ALL
                // then set BorderType.NONE for A2
                // The left border of B1 B3 should be kept, only left border of B2 should be none;
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.setSelections([
                    {
                        range: { startRow: 0, startColumn: 1, endRow: 2, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);
                expect(await commandService.executeCommand(AddWorksheetMergeAllCommand.id)).toBeTruthy();
                expect(
                    await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.ALL })
                ).toBeTruthy();
                selectionManager.setSelections([
                    {
                        range: { startRow: 1, startColumn: 0, endRow: 1, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);
                expect(
                    await commandService.executeCommand(SetBorderPositionCommand.id, { value: BorderType.NONE })
                ).toBeTruthy();
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 })?.l).toStrictEqual({
                    s: BorderStyleTypes.THIN,
                    cl: { rgb: '#000000' },
                });
                expect(getBorder({ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 })?.l).toBeFalsy();
                expect(getBorder({ startRow: 2, endRow: 2, startColumn: 1, endColumn: 1 })?.l).toStrictEqual({
                    s: BorderStyleTypes.THIN,
                    cl: { rgb: '#000000' },
                });
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(SetBorderPositionCommand.id, {
                    value: BorderType.TOP,
                });
                expect(result).toBeFalsy();
            });
        });
    });
});
