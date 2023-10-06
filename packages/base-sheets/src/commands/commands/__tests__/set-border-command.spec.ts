import {
    BorderStyleTypes,
    BorderType,
    IBorderData,
    ICommandService,
    ICurrentUniverService,
    IRange,
    RANGE_TYPE,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import { SetBorderStylesMutation } from '../../mutations/set-border-styles.mutation';
import { AddWorksheetMergeAllCommand, AddWorksheetMergeCommand } from '../add-worksheet-merge.command';
import { RemoveWorksheetMergeCommand } from '../remove-worksheet-merge.command';
import {
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

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetBorderColorCommand);
        commandService.registerCommand(SetBorderStyleCommand);
        commandService.registerCommand(SetBorderCommand);
        commandService.registerCommand(SetBorderPositionCommand);
        commandService.registerCommand(AddWorksheetMergeCommand);
        commandService.registerCommand(AddWorksheetMergeAllCommand);
        commandService.registerCommand(RemoveWorksheetMergeCommand);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(SetBorderStylesMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('set border style', () => {
        describe('correct situations', () => {
            it('will set border style when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 5, endRow: 5, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getBorder({ startRow, startColumn }: IRange): IBorderData | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')

                        .getSheetBySheetId('sheet1')
                        ?.getRange(startRow, startColumn)
                        .getBorder();
                }

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
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 })?.b).toBeUndefined();

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
                expect(getBorder({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 })?.b).toBeUndefined();

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
