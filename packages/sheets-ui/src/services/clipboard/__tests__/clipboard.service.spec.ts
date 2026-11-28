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

import type { ICellData, IRange, IStyleData, Nullable, Univer } from '@univerjs/core';
import {
    BooleanNumber,
    CellValueType,
    CommandService,
    CommandType,
    ConfigService,
    ContextService,
    CustomCommandExecutionError,
    DesktopLogService,
    ErrorService,
    extractPureTextFromCell,
    FormulaType,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IPermissionService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LocalUndoRedoService,
    ObjectMatrix,
    RANGE_TYPE,
    Rectangle,
    RedoCommand,
    RegionService,

    SheetTypes,
    ThemeService,
    Tools,
    UndoCommand,
    UniverInstanceService,
    UniverInstanceType,
    Workbook,
    WrapStrategy,
} from '@univerjs/core';
import { CanvasColorService, FontCache, ICanvasColorService, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import {
    AddWorksheetMergeMutation,
    discreteRangeToRange,
    MergeCellController,
    MoveRangeCommand,
    MoveRangeMutation,
    RefRangeService,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetNameMutation,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowHeightMutation,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
    WorkbookCopyPermission,
    WorkbookEditablePermission,
    WorksheetCopyPermission,
    WorksheetEditPermission,
} from '@univerjs/sheets';
import {
    IClipboardInterfaceService,
    INotificationService,
    IPlatformService,
    PLAIN_TEXT_CLIPBOARD_MIME_TYPE,
    PlatformService,
} from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import type { IClipboardItem } from './mock-clipboard';
import { SheetCopyCommand, SheetCutCommand } from '../../../commands/commands/clipboard.command';
import {
    SheetPermissionInterceptorClipboardController,
} from '../../../controllers/permission/sheet-permission-interceptor-clipboard.controller';
import enUS from '../../../locale/en-US';
import { IMarkSelectionService, MarkSelectionService } from '../../mark-selection/mark-selection.service';
import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME_COPY, PREDEFINED_HOOK_NAME_PASTE, SheetClipboardService } from '../clipboard.service';
import { COPY_TYPE } from '../type';
import { clipboardTestBed } from './clipboard-test-bed';
import { excelSample2, excelSample3 } from './constant';
import { MockClipboard, MockClipboardItem } from './mock-clipboard';

const EXPECTED_EXTERNAL_PASTE_STYLE = {
    bg: {
        rgb: 'rgb(255,0,0)',
    },
    ff: 'Arial',
    fs: 10,
    ht: 2,
    vt: 2,
};

describe('Test clipboard', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetClipboardService: ISheetClipboardService;
    let clipboardItem: IClipboardItem;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number,
        subUnitId?: string
    ) => Array<Array<Nullable<ICellData>>> | undefined;
    let getMergedCells: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number,
        subUnitId?: string
    ) => IRange[] | undefined;

    let getStyles: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<IStyleData>>> | undefined;

    beforeEach(async () => {
        const testBed = clipboardTestBed(undefined, [
            [SheetPermissionInterceptorClipboardController],
            [MergeCellController],
            [RefRangeService],
        ]);
        univer = testBed.univer;
        get = testBed.get;
        testBed.sheet.addWorksheet('sheet2', 1, {
            id: 'sheet2',
            name: 'sheet2',
            cellData: {},
            mergeData: [],
        });
        get(MergeCellController);

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetWorksheetRowHeightMutation);
        commandService.registerCommand(SetWorksheetColWidthMutation);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(MoveRangeMutation);
        commandService.registerCommand(SetWorksheetRowAutoHeightMutation);
        commandService.registerCommand(SetWorksheetActiveOperation);

        sheetClipboardService = get(ISheetClipboardService);

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number,
            subUnitId = 'sheet1'
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
                ?.getSheetBySheetId(subUnitId)
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();

        getMergedCells = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number,
            subUnitId = 'sheet1'
        ): IRange[] | undefined => {
            return get(IUniverInstanceService)
                .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
                ?.getSheetBySheetId(subUnitId)
                ?.getMergeData()
                .filter((rect) => Rectangle.intersects({ startRow, startColumn, endRow, endColumn }, rect));
        };

        getStyles = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<IStyleData>>> | undefined => {
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = get(IUniverInstanceService).getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)?.getStyles();
            if (values && styles) {
                return values.map((row) => row.map((cell) => styles.getStyleByCell(cell)));
            }
        };
        // read use mock
        const clipboardData = {
            'text/html': '<google-sheets-html-origin><table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" border="1" style="table-layout:fixed;font-size:10pt;font-family:Arial;width:0px;border-collapse:collapse;border:none"><colgroup><col width="73"><col width="73"></colgroup><tbody><tr style="height: 81px;"><td rowspan="1" colspan="2" style="background: rgb(255,0,0); text-align: center; vertical-align: middle; text-decoration:none;">row1col2</td></tr></tbody></table></google-sheets-html-origin>',
        };
        const mockClipboard = new MockClipboard(clipboardData);
        const clipboardItems = await mockClipboard.read();

        if (clipboardItems.length !== 0) {
            clipboardItem = clipboardItems[0];
        }
    });

    afterEach(() => {
        univer?.dispose();
    });

    it('clears formula metadata on plain-text paste and restores it on undo', async () => {
        const previous = { f: '=A1', ft: FormulaType.ARRAY, fd: BooleanNumber.FALSE };
        commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: { 0: { 0: previous } },
        });
        get(SheetsSelectionsService).setSelections('test', 'sheet1', [{
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            primary: null,
            style: null,
        }]);
        expect(await sheetClipboardService.paste({
            presentationStyle: 'unspecified',
            types: ['text/plain'],
            getType: async () => new Blob(['=SUM(B1:B2)'], { type: 'text/plain' }),
        })).toBe(true);
        const assertReplaced = () => {
            const cell = getValues(0, 0, 0, 0)?.[0][0];
            expect(cell?.f).toBe('=SUM(B1:B2)');
            expect(cell?.ft).toBeUndefined();
            expect(cell?.fd).toBeUndefined();
        };
        assertReplaced();
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getValues(0, 0, 0, 0)?.[0][0]).toMatchObject(previous);
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        assertReplaced();
    });

    it('preserves text and cell styling when Excel HTML repeats a text-formatted cell across a range', async () => {
        const clipboard = get(ISheetClipboardService);
        const target = { unitId: 'test', subUnitId: 'sheet1', range: { startRow: 30, endRow: 30, startColumn: 0, endColumn: 1 } };
        await commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: { 30: { 0: { v: 1, s: { bl: 1 } }, 1: { v: 'text', s: { n: { pattern: '@' } } } } },
        });
        expect(await clipboard.legacyPaste(excelSample2, undefined, undefined, undefined, target)).toBe(true);
        const text = { v: '000123456', t: CellValueType.STRING };
        expect(getValues(30, 0, 30, 1)?.[0]).toMatchObject([text, text]);
        const style = { ff: '等线', fs: 11, it: 0, bl: 0, cl: { rgb: 'rgb(0,0,0)' }, vt: 2, tb: 1, n: { pattern: '@' } };
        expect(getStyles(30, 0, 30, 1)?.[0]).toMatchObject([style, style]);
    });

    it('distinguishes 18-digit text in an Excel number format from General when importing HTML', async () => {
        const clipboard = get(ISheetClipboardService);
        const target = { unitId: 'test', subUnitId: 'sheet1', range: { startRow: 30, endRow: 30, startColumn: 0, endColumn: 0 } };
        expect(await clipboard.legacyPaste(excelSample3, undefined, undefined, undefined, target)).toBe(true);
        expect(getValues(30, 0, 30, 0)?.[0]?.[0]).toMatchObject({ v: '123456789123456789', t: CellValueType.STRING });
        const general = '<table><tr><td style="mso-number-format:General">123456789123456789</td></tr></table>';
        target.range.startRow = target.range.endRow = 31;
        expect(await clipboard.legacyPaste(general, undefined, undefined, undefined, target)).toBe(true);
        expect(getValues(31, 0, 31, 0)?.[0]?.[0]).toMatchObject({ v: 123456789123456000, t: CellValueType.NUMBER });
    });

    it.each(['text/plain', 'text/html'])('interprets regional numbers and localized literals pasted as %s', async (mime) => {
        const clipboard = get(ISheetClipboardService);
        const locales = get(LocaleService);
        locales.load({ [LocaleType.DE_DE]: { 'engine-formula': { functionAliases: { TRUE: 'WAHR', FALSE: 'FALSCH' }, errorAliases: { '#VALUE!': '#WERT!' } } } });
        locales.setLocale(LocaleType.DE_DE);
        get(RegionService).setRegion('en-IN');
        const target = { unitId: 'test', subUnitId: 'sheet1', range: { startRow: 30, endRow: 30, startColumn: 0, endColumn: 0 } };
        const inputs = ['12,34,567.89', '12345678901234567', 'wahr', '#WERT!', 'TRUE', '#VALUE!'];
        const body = mime === 'text/html' ? `<table><tr>${inputs.map((v) => `<td>${v}</td>`).join('')}</tr></table>` : inputs.join('\t');
        expect(await clipboard.legacyPaste(mime === 'text/html' ? body : undefined, mime === 'text/plain' ? body : undefined, undefined, undefined, target)).toBe(true);
        const cells = getValues(30, 0, 30, 5)?.[0];
        expect(cells?.map((cell) => cell?.v)).toEqual([mime === 'text/html' ? inputs[0] : 1234567.89, 12345678901234500, 1, '#VALUE!', 'TRUE', '#VALUE!']);
        expect(cells?.map((cell) => cell?.t)).toEqual([mime === 'text/html' ? CellValueType.STRING : CellValueType.NUMBER, CellValueType.NUMBER, CellValueType.BOOLEAN, CellValueType.STRING, CellValueType.STRING, CellValueType.FORCE_STRING]);
    });

    it.each(['text/plain', 'text/html'])('keeps nonbreaking spaces in literals pasted as %s and uses the active UI for full-width digits', async (mime) => {
        const clipboard = get(ISheetClipboardService);
        const locales = get(LocaleService);
        locales.load({ [LocaleType.FR_FR]: { 'engine-formula': { functionAliases: { TRUE: 'VRAI' }, errorAliases: { '#VALUE!': '#VALEUR!' } } } });
        locales.setLocale(LocaleType.FR_FR);
        get(RegionService).setRegion('en-US');
        const target = { unitId: 'test', subUnitId: 'sheet1', range: { startRow: 30, endRow: 30, startColumn: 0, endColumn: 0 } };
        const texts = [' VRAI ', ' #VALEUR! ', '\u00A0VRAI\u00A0', '１２．５'];
        const html = mime === 'text/html' ? `<table><tr>${texts.map((v) => `<td>${v}</td>`).join('')}</tr></table>` : undefined;
        expect(await clipboard.legacyPaste(html, html ? undefined : texts.join('\t'), undefined, undefined, target)).toBe(true);
        const cells = getValues(30, 0, 30, 3)?.[0];
        expect(cells?.map((cell) => cell?.v)).toEqual(html ? [1, '#VALUE!', texts[2], texts[3]] : texts);
        expect(cells?.map((cell) => cell?.t)).toEqual([
            html ? CellValueType.BOOLEAN : CellValueType.STRING,
            CellValueType.STRING,
            CellValueType.STRING,
            CellValueType.STRING,
        ]);
    });

    it('preserves literal external table text when the formula clipboard plugin is absent', async () => {
        const clipboard = get(ISheetClipboardService);
        get(RegionService).setRegion('es-ES');
        const target = { unitId: 'test', subUnitId: 'sheet1', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } };
        expect(await clipboard.legacyPaste(undefined, '=SUM(1,5)\t=SUM(1.5,2.5)', undefined, undefined, target)).toBe(true);
        const cells = getValues(0, 0, 0, 1)?.[0];
        expect(cells?.map((cell) => cell?.v)).toEqual(['=SUM(1,5)', '=SUM(1.5,2.5)']);
        expect(cells?.some((cell) => cell?.f)).toBe(false);
    });

    it('keeps the original selection while clipboard data is read asynchronously', async () => {
        const clipboardService = get(ISheetClipboardService);
        const selections = get(SheetsSelectionsService);
        const selectColumn = (column: number) => selections.setSelections('test', 'sheet1', [{
            range: { startRow: 0, endRow: 0, startColumn: column, endColumn: column },
            primary: null,
            style: null,
        }]);
        selectColumn(0);
        const originalSource = getValues(0, 0, 0, 0);
        const originalPeer = getValues(0, 1, 0, 1);
        let releaseRead = () => {};
        const readGate = new Promise<void>((resolve) => {
            releaseRead = resolve;
        });
        const item: IClipboardItem = {
            presentationStyle: 'unspecified',
            types: ['text/plain'],
            getType: async () => {
                await readGate;
                return new Blob(['DEFERRED_PASTE'], { type: 'text/plain' });
            },
        };
        const pendingPaste = clipboardService.paste(item);
        selectColumn(1);
        releaseRead();
        expect(await pendingPaste).toBe(true);
        expect(getValues(0, 0, 0, 0)?.[0][0]?.v).toBe('DEFERRED_PASTE');
        expect(getValues(0, 1, 0, 1)).toEqual(originalPeer);
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getValues(0, 0, 0, 0)).toEqual(originalSource);
        expect(getValues(0, 1, 0, 1)).toEqual(originalPeer);
    });

    it.each(['focus switch', 'unit switch', 'pending projection', 'changed projection', 'disposed pane', 'optional pending', 'optional changed', 'optional disposed', 'optional focus', 'optional recalc'] as const)(
        'keeps a delayed paste bound to its initiating pane after a %s',
        async (change) => {
            // jsdom has no canvas backend. Both renderers and their skeleton managers are real.
            const canvasContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
                return {
                    canvas: this,
                    setTransform: vi.fn(),
                    clearRect: vi.fn(),
                    measureText: () => ({
                        width: 10,
                        fontBoundingBoxAscent: 10,
                        fontBoundingBoxDescent: 2,
                        actualBoundingBoxAscent: 10,
                        actualBoundingBoxDescent: 2,
                    }),
                } as unknown as CanvasRenderingContext2D;
            });
            try {
                univer.__getInjector().add([ICanvasColorService, { useClass: CanvasColorService }]);
                const renders = get(IRenderManagerService);
                renders.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSkeletonManagerService]);
                const primary = renders.createRender('test');
                const companion = renders.createRender('test', undefined, 'paste-companion');
                primary.with(SheetSkeletonManagerService).setCurrent({ sheetId: 'sheet1' });
                const initiatingView = companion.with(SheetSkeletonManagerService);
                initiatingView.setCurrent({ sheetId: 'sheet1' });
                initiatingView.setProjection('sheet1', {
                    viewId: 'paste-view',
                    isRowFiltered: (row) => row === 30 || row === 32,
                    getCell: () => undefined,
                });
                const mutationListener = commandService.onCommandExecuted((command) => {
                    if (change === 'optional recalc' && command.id === SetRangeValuesMutation.id) {
                        initiatingView.setProjectionPending('sheet1', true);
                    }
                });
                onTestFinished(() => mutationListener.dispose());
                renders.focusRender?.('paste-companion');
                get(SheetsSelectionsService).setSelections('test', 'sheet1', [{
                    range: { startRow: 30, endRow: 31, startColumn: 0, endColumn: 0 },
                    primary: null,
                    style: null,
                }]);

                let releaseRead = () => {};
                const readGate = new Promise<void>((resolve) => {
                    releaseRead = resolve;
                });
                const pending = sheetClipboardService.paste({
                    presentationStyle: 'unspecified',
                    types: ['text/html'],
                    getType: async () => {
                        await readGate;
                        return new Blob(['<table><tr><td>A</td></tr><tr><td>B</td></tr></table>'], { type: 'text/html' });
                    },
                });
                sheetClipboardService.setShowMenu(true);
                if (change === 'unit switch') {
                    const instances = get(IUniverInstanceService);
                    const snapshot = Tools.deepClone(instances.getUnit<Workbook>('test')!.getSnapshot());
                    instances.createUnit(UniverInstanceType.UNIVER_SHEET, { ...snapshot, id: 'paste-peer' });
                    instances.focusUnit('paste-peer');
                } else {
                    renders.focusRender?.('test');
                }
                expect(sheetClipboardService.getPasteMenuVisible()).toBe(false);
                if (change === 'pending projection') {
                    initiatingView.setProjectionPending('sheet1', true);
                } else if (change === 'changed projection') {
                    initiatingView.setProjection('sheet1', { isRowFiltered: () => false, getCell: () => undefined });
                } else if (change === 'disposed pane') {
                    renders.removeRender('paste-companion');
                }
                releaseRead();

                const succeeds = change === 'focus switch' || change === 'unit switch' || change.startsWith('optional');
                expect(await pending).toBe(succeeds);
                expect(sheetClipboardService.getPasteMenuVisible()).toBe(false);
                expect(getValues(30, 0, 33, 0)?.map(([cell]) => cell?.v)).toEqual(
                    succeeds ? [undefined, 'A', undefined, 'B'] : [undefined, undefined, undefined, undefined]
                );
                if (change.startsWith('optional')) {
                    if (change !== 'optional focus' && change !== 'optional disposed') {
                        renders.focusRender?.('paste-companion');
                    }
                    if (change === 'optional recalc') {
                        initiatingView.setProjection('sheet1', {
                            viewId: 'paste-view',
                            isRowFiltered: (row) => row === 30 || row === 32,
                            getCell: () => undefined,
                        });
                        initiatingView.setProjectionPending('sheet1', false);
                    } else if (change === 'optional pending') {
                        initiatingView.setProjectionPending('sheet1', true);
                    } else if (change === 'optional changed') {
                        initiatingView.setProjection('sheet1', { isRowFiltered: () => false, getCell: () => undefined });
                    } else if (change === 'optional disposed') {
                        renders.removeRender('paste-companion');
                    }
                    expect(sheetClipboardService.rePasteWithPasteType('SPECIAL_PASTE_VALUE')).toBe(change === 'optional recalc');
                    expect(getValues(30, 0, 33, 0)?.map(([cell]) => cell?.v)).toEqual([undefined, 'A', undefined, 'B']);
                    expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
                    expect(getValues(30, 0, 33, 0)?.map(([cell]) => cell?.v)).toEqual([undefined, undefined, undefined, undefined]);
                }
            } finally {
                canvasContext.mockRestore();
            }
        }
    );

    it('rejects optional paste after the current workbook changes without consuming its history', async () => {
        const location = { unitId: 'test', subUnitId: 'sheet1', range: { startRow: 30, endRow: 30, startColumn: 0, endColumn: 0 } };
        expect(await sheetClipboardService.legacyPaste('<table><tr><td>A</td></tr></table>', undefined, undefined, undefined, location)).toBe(true);
        const instances = get(IUniverInstanceService);
        const snapshot = Tools.deepClone(instances.getUnit<Workbook>('test')!.getSnapshot());
        instances.createUnit(UniverInstanceType.UNIVER_SHEET, { ...snapshot, id: 'optional-peer' });
        const peer = instances.getUnit<Workbook>('optional-peer')!;
        const peerTarget = { unitId: 'optional-peer', subUnitId: 'sheet1' };
        commandService.syncExecuteCommand(SetRangeValuesMutation.id, { ...peerTarget, cellValue: { 31: { 0: { v: 'PEER' } } } });
        get(IUndoRedoService).pushUndoRedo({
            unitID: 'optional-peer',
            undoMutations: [{ id: SetRangeValuesMutation.id, params: { ...peerTarget, cellValue: { 31: { 0: null } } } }],
            redoMutations: [{ id: SetRangeValuesMutation.id, params: { ...peerTarget, cellValue: { 31: { 0: { v: 'PEER' } } } } }],
        });
        const history = get(IUndoRedoService).getUndoRedoStatus('optional-peer');
        expect(sheetClipboardService.rePasteWithPasteType('SPECIAL_PASTE_VALUE')).toBe(false);
        expect(get(IUndoRedoService).getUndoRedoStatus('optional-peer')).toEqual(history);
        expect(peer.getActiveSheet()!.getCellRaw(31, 0)?.v).toBe('PEER');
        expect(getValues(30, 0, 30, 0)?.[0][0]?.v).toBe('A');
    });

    it.each(['separate', 'grouped'] as const)('rejects optional paste after another edit adds %s history in the same workbook', async (mode) => {
        const target = { unitId: 'test', subUnitId: 'sheet1' };
        const group = mode === 'grouped' ? get(IUndoRedoService).beginUndoRedoGroup('test', 'paste-history', 'append') : undefined;
        onTestFinished(() => group?.dispose());
        expect(await sheetClipboardService.legacyPaste('<table><tr><td>A</td></tr></table>', undefined, undefined, undefined, {
            ...target,
            range: { startRow: 30, endRow: 30, startColumn: 0, endColumn: 0 },
        })).toBe(true);
        commandService.syncExecuteCommand(SetRangeValuesMutation.id, { ...target, cellValue: { 31: { 0: { v: 'LATER' } } } });
        get(IUndoRedoService).pushUndoRedo({
            unitID: 'test',
            undoMutations: [{ id: SetRangeValuesMutation.id, params: { ...target, cellValue: { 31: { 0: null } } } }],
            redoMutations: [{ id: SetRangeValuesMutation.id, params: { ...target, cellValue: { 31: { 0: { v: 'LATER' } } } } }],
        });
        group?.dispose();
        expect(sheetClipboardService.rePasteWithPasteType('SPECIAL_PASTE_VALUE')).toBe(false);
        expect(getValues(30, 0, 31, 0)?.map(([cell]) => cell?.v)).toEqual(['A', 'LATER']);
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getValues(30, 0, 31, 0)?.map(([cell]) => cell?.v)).toEqual([mode === 'grouped' ? undefined : 'A', undefined]);
    });

    it('changes paste type while the original paste is the current history entry', async () => {
        expect(await sheetClipboardService.legacyPaste('<table><tr><td>A</td></tr></table>', undefined, undefined, undefined, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 30, endRow: 30, startColumn: 0, endColumn: 0 },
        })).toBe(true);
        expect(sheetClipboardService.rePasteWithPasteType('SPECIAL_PASTE_VALUE')).toBe(true);
        expect(getValues(30, 0, 30, 0)?.[0][0]?.v).toBe('A');
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getValues(30, 0, 30, 0)?.[0][0]?.v).toBeUndefined();
    });

    it.each(['rejected', 'throwing', 'after paste'] as const)('restores the original paste when changing paste type is %s', async (failure) => {
        expect(await sheetClipboardService.legacyPaste('<table><tr><td>A</td></tr></table>', undefined, undefined, undefined, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 30, endRow: 30, startColumn: 0, endColumn: 0 },
        })).toBe(true);
        const hook = sheetClipboardService.addClipboardHook({
            id: 'reject-replacement',
            onBeforePaste: () => {
                if (failure === 'throwing') throw new Error('replacement rejected');
                return failure !== 'rejected';
            },
            onAfterPaste: (success) => {
                if (failure === 'after paste' && success) throw new Error('replacement rejected');
            },
        });
        onTestFinished(() => hook.dispose());
        if (failure !== 'rejected') {
            expect(() => sheetClipboardService.rePasteWithPasteType('SPECIAL_PASTE_VALUE')).toThrow('replacement rejected');
        } else {
            expect(sheetClipboardService.rePasteWithPasteType('SPECIAL_PASTE_VALUE')).toBe(false);
        }
        expect(getValues(30, 0, 30, 0)?.[0][0]?.v).toBe('A');
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getValues(30, 0, 30, 0)?.[0][0]?.v).toBeUndefined();
    });

    it('preserves a later undone edit for redo when changing paste type is rejected', async () => {
        const target = { unitId: 'test', subUnitId: 'sheet1' };
        expect(await sheetClipboardService.legacyPaste('<table><tr><td>A</td></tr></table>', undefined, undefined, undefined, {
            ...target,
            range: { startRow: 30, endRow: 30, startColumn: 0, endColumn: 0 },
        })).toBe(true);
        commandService.syncExecuteCommand(SetRangeValuesMutation.id, { ...target, cellValue: { 31: { 0: { v: 'LATER' } } } });
        get(IUndoRedoService).pushUndoRedo({
            unitID: 'test',
            undoMutations: [{ id: SetRangeValuesMutation.id, params: { ...target, cellValue: { 31: { 0: null } } } }],
            redoMutations: [{ id: SetRangeValuesMutation.id, params: { ...target, cellValue: { 31: { 0: { v: 'LATER' } } } } }],
        });
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        const hook = sheetClipboardService.addClipboardHook({ id: 'reject-replacement', onBeforePaste: () => false });
        onTestFinished(() => hook.dispose());
        expect(sheetClipboardService.rePasteWithPasteType('SPECIAL_PASTE_VALUE')).toBe(false);
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getValues(30, 0, 31, 0)?.map(([cell]) => cell?.v)).toEqual(['A', 'LATER']);
    });

    it.each(['public', 'pending', 'private value'] as const)('persists public auto height after a paste in a %s display', async (display) => {
        const row = 30;
        const locale = get(LocaleService);
        locale.load({ [LocaleType.EN_US]: enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const worksheet = get(IUniverInstanceService).getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!.getSheetBySheetId('sheet1')!;
        worksheet.getRowManager().getRowOrCreate(row).ah = 24;
        const canvas = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
            setTransform: () => {},
            clearRect: () => {},
        } as unknown as CanvasRenderingContext2D);
        onTestFinished(() => canvas.mockRestore());
        const metrics = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 16,
            fontBoundingBoxDescent: 4,
            actualBoundingBoxAscent: 16,
            actualBoundingBoxDescent: 4,
        }));
        onTestFinished(() => metrics.mockRestore());
        univer.__getInjector().add([ICanvasColorService, { useClass: CanvasColorService }]);
        const renders = get(IRenderManagerService);
        renders.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSkeletonManagerService]);
        const primary = renders.createRender('test');
        const companion = renders.createRender('test', undefined, 'autoheight-companion');
        primary.with(SheetSkeletonManagerService).setCurrent({ sheetId: 'sheet1' });
        const manager = companion.with(SheetSkeletonManagerService);
        manager.setCurrent({ sheetId: 'sheet1' });
        if (display !== 'public') {
            manager.setProjection('sheet1', {
                isRowFiltered: () => false,
                getCell: () => display === 'private value' ? { v: 'short', t: CellValueType.STRING } : undefined,
            });
        }
        const listener = commandService.onCommandExecuted((command) => {
            if (display === 'pending' && command.id === SetRangeValuesMutation.id) {
                manager.setProjectionPending('sheet1', true);
                manager.setProjection('sheet1', { placeholder: true, isRowFiltered: () => true, getCell: () => null });
            }
        });
        onTestFinished(() => listener.dispose());
        renders.focusRender?.('autoheight-companion');
        const copyId = 'public-auto-height';
        const value = 'wrapped text '.repeat(25);
        sheetClipboardService.copyContentCache().set(copyId, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { rows: [0], cols: [0] },
            matrix: new ObjectMatrix({ 0: { 0: { v: value, s: { fs: 12, tb: WrapStrategy.WRAP } } } }),
            copyType: COPY_TYPE.COPY,
        });
        expect(await sheetClipboardService.pasteByCopyId(copyId, PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: row, endRow: row, startColumn: 0, endColumn: 0 },
        })).toBe(true);
        const publicSkeleton = get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
        const expected = publicSkeleton.calculateAutoHeightInRange([{ startRow: row, endRow: row, startColumn: 0, endColumn: 0 }])[0].autoHeight;
        expect(expected).toBeGreaterThan(24);
        expect(worksheet.getRowManager().getRow(row)?.ah).toBe(expected);
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(worksheet.getRowManager().getRow(row)?.ah).toBe(24);
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(worksheet.getRowManager().getRow(row)?.ah).toBe(expected);
    });

    it.each([
        { name: 'explicit', row: 31, isLegacy: false },
        { name: 'legacy', row: 32, isLegacy: true },
    ])('preserves a $name manually sized row when pasting', async ({ row, isLegacy }) => {
        const worksheet = get(IUniverInstanceService)
            .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!
            .getSheetBySheetId('sheet1')!;
        const rowData = worksheet.getRowManager().getRowOrCreate(row);
        rowData.h = 40;
        if (!isLegacy) {
            rowData.ia = BooleanNumber.FALSE;
        }
        const skeleton = get(SheetSkeletonManagerService).ensureSkeleton('sheet1')!;
        const calculateAutoHeight = vi.spyOn(skeleton, 'calculateAutoHeightInRange');
        const copyId = 'manual-row-height';
        sheetClipboardService.copyContentCache().set(copyId, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { rows: [0], cols: [0] },
            matrix: new ObjectMatrix({ 0: { 0: { v: 'line 1\nline 2' } } }),
            copyType: COPY_TYPE.COPY,
        });

        expect(await sheetClipboardService.pasteByCopyId(copyId, PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: row, endRow: row, startColumn: 0, endColumn: 0 },
        })).toBe(true);
        expect(calculateAutoHeight).not.toHaveBeenCalled();
        expect(worksheet.getRowHeight(row)).toBe(40);
    });

    it.each(['disposed', 'read-only'] as const)('does not redirect a delayed paste when its source becomes %s', async (state) => {
        const clipboardService = get(ISheetClipboardService);
        get(SheetPermissionInterceptorClipboardController);
        const instances = get(IUniverInstanceService);
        const source = instances.getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!;
        const snapshot = Tools.deepClone(source.getSnapshot());
        const peer = instances.createUnit(UniverInstanceType.UNIVER_SHEET, { ...snapshot, id: 'paste-peer' }, { makeCurrent: false });
        const peerBefore = Tools.deepClone(peer.getSnapshot());
        const selections = get(SheetsSelectionsService);
        const selection = [{
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            primary: null,
            style: null,
        }];
        selections.setSelections('test', 'sheet1', selection);
        let releaseRead = () => {};
        const readGate = new Promise<void>((resolve) => {
            releaseRead = resolve;
        });
        const pendingPaste = clipboardService.paste({
            presentationStyle: 'unspecified',
            types: ['text/plain'],
            getType: async () => {
                await readGate;
                return new Blob(['MUST_NOT_WRITE'], { type: 'text/plain' });
            },
        });
        if (state === 'disposed') {
            instances.disposeUnit('test');
        } else {
            const permissions = get(IPermissionService);
            const point = new WorkbookEditablePermission('test');
            if (!permissions.getPermissionPoint(point.id)) {
                permissions.addPermissionPoint(point);
            }
            permissions.updatePermissionPoint(point.id, false);
        }
        instances.setCurrentUnitForType('paste-peer');
        selections.setSelections('paste-peer', 'sheet1', selection);
        releaseRead();
        if (state === 'read-only') {
            await expect(pendingPaste).rejects.toThrow(CustomCommandExecutionError);
        } else {
            expect(await pendingPaste).toBe(false);
        }
        expect(peer.getSnapshot()).toEqual(peerBefore);
        if (state === 'read-only') {
            expect(source.getSnapshot()).toEqual(snapshot);
        }
    });

    describe('Test paste, the original data is a merged cell of 1 row and 2 columns, the current selection consists only of ordinary cells', () => {
        it('The current selection is a single cell in 1 row and 1 column', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to A1
            const startRow = 0;
            const startColumn = 0;
            const endRow = 0;
            const endColumn = 0;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            const columnManager = get(IUniverInstanceService).getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)?.getSheetBySheetId('sheet1')?.getColumnManager();
            const columnWidth = columnManager?.getColumnWidth(0);
            expect(columnWidth).toBe(88);
            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            expect(mergedCells && mergedCells[0]).toStrictEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 1,
            });
        });
        it('The current selection is a single cell in 1 row and 2 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to A2:B2
            const startRow = 1;
            const startColumn = 0;
            const endRow = 1;
            const endColumn = 1;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            expect(mergedCells && mergedCells[0]).toStrictEqual({
                startRow,
                startColumn,
                endRow,
                endColumn,
            });
        });
        it('The current selection is a single cell in 1 row and 3 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to A3:C3
            const startRow = 2;
            const startColumn = 0;
            const endRow = 2;
            const endColumn = 2;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            expect(values && values[0][2]?.v).toBe(undefined);
            expect(styles && styles[0][2]).toStrictEqual(undefined);
            expect(mergedCells && mergedCells[0]).toStrictEqual({
                startRow: 2,
                startColumn: 0,
                endRow: 2,
                endColumn: 1,
            });
        });
        it('The current selection is a single cell in 2 rows and 2 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to A4:B5
            const startRow = 3;
            const startColumn = 0;
            const endRow = 4;
            const endColumn = 1;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(values && values[1][0]?.v).toBe('row1col2');

            expect(styles && styles[0][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            expect(styles && styles[1][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            expect(mergedCells).toStrictEqual([
                {
                    startRow: 3,
                    startColumn: 0,
                    endRow: 3,
                    endColumn: 1,
                },
                {
                    startRow: 4,
                    startColumn: 0,
                    endRow: 4,
                    endColumn: 1,
                },
            ]);
        });
        it('The current selection is a single cell in 4 rows and 4 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to A6:D9
            const startRow = 5;
            const startColumn = 0;
            const endRow = 8;
            const endColumn = 3;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            for (let i = 0; i < 4; i++) {
                expect(values && values[i][0]?.v).toBe('row1col2');
                expect(values && values[i][2]?.v).toBe('row1col2');
                expect(styles && styles[i][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
                expect(styles && styles[i][2]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            }
            expect(mergedCells).toStrictEqual([
                {
                    startRow: 5,
                    startColumn: 0,
                    endRow: 5,
                    endColumn: 1,
                },
                {
                    startRow: 5,
                    startColumn: 2,
                    endRow: 5,
                    endColumn: 3,
                },
                {
                    startRow: 6,
                    startColumn: 0,
                    endRow: 6,
                    endColumn: 1,
                },
                {
                    startRow: 6,
                    startColumn: 2,
                    endRow: 6,
                    endColumn: 3,
                },
                {
                    startRow: 7,
                    startColumn: 0,
                    endRow: 7,
                    endColumn: 1,
                },
                {
                    startRow: 7,
                    startColumn: 2,
                    endRow: 7,
                    endColumn: 3,
                },
                {
                    startRow: 8,
                    startColumn: 0,
                    endRow: 8,
                    endColumn: 1,
                },
                {
                    startRow: 8,
                    startColumn: 2,
                    endRow: 8,
                    endColumn: 3,
                },
            ]);
        });
    });

    describe('Test paste, the original data is a merged cell of 1 row and 2 columns, the current selection contains merged cells and no content', () => {
        it('The current selection is a merged cell of 1 row and 2 columns.', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F1:G2
            const startRow = 0;
            const startColumn = 5;
            const endRow = 0;
            const endColumn = 6;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            expect(mergedCells && mergedCells[0]).toStrictEqual({
                startRow,
                startColumn,
                endRow,
                endColumn,
            });
        });

        it('The current selection is a merged cell of 1 row and 3 columns.', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F3:H3
            const startRow = 2;
            const startColumn = 5;
            const endRow = 2;
            const endColumn = 7;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            const res = await sheetClipboardService.paste(clipboardItem);
            expect(res).toBeFalsy();
        });

        it('The current selection is a merged cell of 1 row and 4 columns.', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F5:I5
            const startRow = 4;
            const startColumn = 5;
            const endRow = 4;
            const endColumn = 8;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            const res = await sheetClipboardService.paste(clipboardItem);
            expect(res).toBeFalsy();
        });

        it('The current selection is a merged cell of 2 rows and 2 columns.', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F7:G8
            const startRow = 6;
            const startColumn = 5;
            const endRow = 7;
            const endColumn = 6;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            const res = await sheetClipboardService.paste(clipboardItem);
            expect(res).toBeFalsy();
        });

        it('The current selection is a merged cell of 1 row and 2 columns, with 1 ordinary cell', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F10:H10
            const startRow = 9;
            const startColumn = 5;
            const endRow = 9;
            const endColumn = 7;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            expect(mergedCells && mergedCells[0]).toStrictEqual({
                startRow: 9,
                startColumn: 5,
                endRow: 9,
                endColumn: 6,
            });
        });

        it('The current selection is a merged cell of 2 rows and 2 columns, with a merged cell of 2 rows and 1 column', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F12:H13
            const startRow = 11;
            const startColumn = 5;
            const endRow = 12;
            const endColumn = 7;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            const res = await sheetClipboardService.paste(clipboardItem);
            expect(res).toBeFalsy();
        });
    });

    describe('Test paste, the original data is a merged cell of 1 row and 2 columns, the current selection contains merged cells with content and style', () => {
        it('The current selection is a merged cell of 1 row and 3 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to K4:M4
            const startRow = 3;
            const startColumn = 10;
            const endRow = 3;
            const endColumn = 12;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            const res = await sheetClipboardService.paste(clipboardItem);
            expect(res).toBeFalsy();
        });
        it('The current selection is a merged cell of 1 row and 2 columns, with a merged cell of 2 rows and 2 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to K7:M10
            const startRow = 6;
            const startColumn = 10;
            const endRow = 9;
            const endColumn = 12;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);

            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // first merged cells changed
            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);

            // second merged cells not changed
            expect(values && values[2][1]?.v).toBe('456');
            expect(styles && styles[2][1]).toStrictEqual({ bg: { rgb: '#ccc' }, ht: 2, vt: 2 });

            expect(mergedCells).toStrictEqual([
                {
                    startRow: 8,
                    startColumn: 11,
                    endRow: 9,
                    endColumn: 12,
                },
                {
                    startRow: 6,
                    startColumn: 10,
                    endRow: 6,
                    endColumn: 11,
                },
            ]);
        });
        it('The current selection is a merged cell of 1 row and 3 columns, with a merged cell of 2 rows and 2 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to K12:M15
            const startRow = 11;
            const startColumn = 10;
            const endRow = 14;
            const endColumn = 12;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);

            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // first merged cells not changed
            expect(values && values[0][0]?.v).toBe('456');
            expect(styles && styles[0][0]).toStrictEqual({ bg: { rgb: '#ccc' }, ht: 3 });

            // second merged cells not changed
            expect(values && values[2][1]?.v).toBe('456');
            expect(styles && styles[2][1]).toStrictEqual({ bg: { rgb: '#ccc' } });

            expect(mergedCells).toStrictEqual([
                {
                    startRow: 11,
                    startColumn: 10,
                    endRow: 11,
                    endColumn: 12,
                },
                {
                    startRow: 13,
                    startColumn: 11,
                    endRow: 14,
                    endColumn: 12,
                },
            ]);
        });
        it('The current selection is a merged cell of 2 rows and 2 columns, with a merged cell of 1 row and 2 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to K22:M24
            const startRow = 21;
            const startColumn = 10;
            const endRow = 23;
            const endColumn = 12;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);

            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // first merged cells not changed
            expect(values && values[0][0]?.v).toBe('456');
            expect(styles && styles[0][0]).toStrictEqual({ bg: { rgb: '#ccc' } });

            // second merged cells not changed
            expect(values && values[2][1]?.v).toBe('456');
            expect(styles && styles[2][1]).toStrictEqual({ bg: { rgb: '#ccc' } });

            expect(mergedCells).toStrictEqual([
                {
                    startRow: 21,
                    startColumn: 10,
                    endRow: 22,
                    endColumn: 11,
                },
                {
                    startRow: 23,
                    startColumn: 11,
                    endRow: 23,
                    endColumn: 12,
                },
            ]);
        });
    });

    describe('Test internal copy and cut of merged cells', () => {
        it.each([
            { name: 'copies within the current sheet', copyType: COPY_TYPE.COPY, targetSubUnitId: 'sheet1' },
            { name: 'cuts within the current sheet', copyType: COPY_TYPE.CUT, targetSubUnitId: 'sheet1' },
            { name: 'copies across sheets', copyType: COPY_TYPE.COPY, targetSubUnitId: 'sheet2' },
            { name: 'cuts across sheets', copyType: COPY_TYPE.CUT, targetSubUnitId: 'sheet2' },
        ])('$name', async ({ copyType, targetSubUnitId }) => {
            const sourceRange = {
                startRow: 21,
                startColumn: 10,
                endRow: 22,
                endColumn: 11,
            };
            const targetRange = {
                startRow: 25,
                startColumn: 5,
                endRow: 26,
                endColumn: 6,
            };
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([{
                range: { ...sourceRange, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            }]);

            expect(await (copyType === COPY_TYPE.COPY ? sheetClipboardService.copy() : sheetClipboardService.cut())).toBe(true);
            const copyId = sheetClipboardService.copyContentCache().getLastCopyId();
            expect(copyId).not.toBeNull();

            if (targetSubUnitId !== 'sheet1') {
                expect(await commandService.executeCommand(SetWorksheetActiveOperation.id, {
                    unitId: 'test',
                    subUnitId: targetSubUnitId,
                })).toBe(true);
            }
            selectionManager.addSelections([{
                range: { ...targetRange, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            }]);

            expect(await sheetClipboardService.pasteByCopyId(copyId!)).toBe(true);
            expect(getValues(targetRange.startRow, targetRange.startColumn, targetRange.endRow, targetRange.endColumn, targetSubUnitId)?.[0][0]?.v).toBe(
                copyType === COPY_TYPE.COPY ? 456 : '456'
            );
            expect(getMergedCells(sourceRange.startRow, sourceRange.startColumn, sourceRange.endRow, sourceRange.endColumn)).toEqual(
                copyType === COPY_TYPE.COPY ? [sourceRange] : []
            );
            expect(getMergedCells(targetRange.startRow, targetRange.startColumn, targetRange.endRow, targetRange.endColumn, targetSubUnitId)).toEqual([targetRange]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(getMergedCells(sourceRange.startRow, sourceRange.startColumn, sourceRange.endRow, sourceRange.endColumn)).toEqual([sourceRange]);
            expect(getMergedCells(targetRange.startRow, targetRange.startColumn, targetRange.endRow, targetRange.endColumn, targetSubUnitId)).toEqual([]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(getMergedCells(sourceRange.startRow, sourceRange.startColumn, sourceRange.endRow, sourceRange.endColumn)).toEqual(
                copyType === COPY_TYPE.COPY ? [sourceRange] : []
            );
            expect(getMergedCells(targetRange.startRow, targetRange.startColumn, targetRange.endRow, targetRange.endColumn, targetSubUnitId)).toEqual([targetRange]);
        });
    });

    it('copies displayed formula values to text, HTML and values-only paste without changing public values', async () => {
        const target = { unitId: 'test', subUnitId: 'sheet2', range: { startRow: 30, endRow: 30, startColumn: 0, endColumn: 0 } };
        expect(commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: { 30: { 0: { f: '=SUBTOTAL(109,A2:A4)', v: 180, t: CellValueType.NUMBER } } },
        })).toBe(true);
        const workbook = get(IUniverInstanceService).getUnit<Workbook>('test')!;
        const before = Tools.deepClone(workbook.getSnapshot());
        get(SheetSkeletonManagerService).setProjection('sheet1', {
            isRowFiltered: () => false,
            getCell: (row, column) => row === 30 && column === 0 ? { v: 150, t: CellValueType.NUMBER } : undefined,
        });
        const range = { startRow: 30, endRow: 30, startColumn: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL };
        const content = sheetClipboardService.generateCopyContent('test', 'sheet1', range)!;
        expect(content.plain).toBe('150');
        const document = new DOMParser().parseFromString(content.html, 'text/html');
        expect(document.querySelector('td')?.textContent).toBe('150');
        expect(content.matrixFragment.getValue(0, 0)).toMatchObject({ f: '=SUBTOTAL(109,A2:A4)', v: 150, t: CellValueType.NUMBER });
        expect(workbook.getSnapshot()).toEqual(before);
        get(SheetsSelectionsService).addSelections([{ range, primary: null, style: null }]);
        expect(await sheetClipboardService.copy()).toBe(true);
        const copyId = sheetClipboardService.copyContentCache().getLastCopyId()!;
        expect(await sheetClipboardService.pasteByCopyId(copyId, PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE, target)).toBe(true);
        expect(getValues(30, 0, 30, 0, 'sheet2')?.[0][0]).toMatchObject({ v: 150 });
        expect(getValues(30, 0, 30, 0, 'sheet2')?.[0][0]?.f).toBeFalsy();
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getValues(30, 0, 30, 0, 'sheet2')?.[0][0]?.v).toBeFalsy();
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getValues(30, 0, 30, 0, 'sheet2')?.[0][0]?.v).toBe(150);
        expect(workbook.getSheetBySheetId('sheet1')!.getCellRaw(30, 0)?.v).toBe(180);
    });

    it('copies new and cleared projected spill cells instead of public spill values', () => {
        expect(commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: { 30: { 0: { v: 180 } } },
        })).toBe(true);
        get(SheetSkeletonManagerService).setProjection('sheet1', {
            isRowFiltered: () => false,
            getCell: (row, column) => {
                if (column !== 0) {
                    return undefined;
                }
                if (row === 30) {
                    return null;
                }
                return row === 31 ? { v: 151, t: CellValueType.NUMBER } : undefined;
            },
        });
        const content = sheetClipboardService.generateCopyContent('test', 'sheet1', { startRow: 30, endRow: 31, startColumn: 0, endColumn: 0 })!;
        expect(content.matrixFragment.getValue(0, 0)?.v ?? null).toBeNull();
        expect(content.matrixFragment.getValue(1, 0)?.v).toBe(151);
        const document = new DOMParser().parseFromString(content.html, 'text/html');
        expect(Array.from(document.querySelectorAll('td'), (cell) => cell.textContent)).toEqual(['', '151']);
    });

    it('keeps covered merged values out of projected clipboard content', () => {
        const target = { unitId: 'test', subUnitId: 'sheet1' };
        const range = { startRow: 30, endRow: 30, startColumn: 0, endColumn: 1 };
        expect(commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            ...target,
            cellValue: { 30: { 0: { v: 'Anchor' }, 1: { v: 'Covered' } } },
        })).toBe(true);
        expect(commandService.syncExecuteCommand(AddWorksheetMergeMutation.id, { ...target, ranges: [range] })).toBe(true);
        get(SheetSkeletonManagerService).setProjection('sheet1', {
            isRowFiltered: () => false,
            getCell: () => undefined,
        });
        const content = sheetClipboardService.generateCopyContent('test', 'sheet1', range)!;
        expect(content.plain).toBe('Anchor\t');
        expect(content.matrixFragment.getValue(0, 1)?.v).toBeFalsy();
        expect(content.matrixFragment.getValue(0, 0)).toMatchObject({ v: 'Anchor', colSpan: 2 });
    });

    it.each(['outside selection', 'filtered'] as const)('omits covered HTML values when the merge anchor is %s', (anchor) => {
        const target = { unitId: 'test', subUnitId: 'sheet1' };
        const range = { startRow: 30, endRow: 31, startColumn: 0, endColumn: 0 };
        expect(commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            ...target,
            cellValue: { 30: { 0: { v: 'Anchor' } }, 31: { 0: { v: 'Covered' } } },
        })).toBe(true);
        expect(commandService.syncExecuteCommand(AddWorksheetMergeMutation.id, { ...target, ranges: [range] })).toBe(true);
        get(SheetSkeletonManagerService).setProjection('sheet1', {
            isRowFiltered: (row) => anchor === 'filtered' && row === 30,
            getCell: () => undefined,
        });
        const content = sheetClipboardService.generateCopyContent('test', 'sheet1', {
            ...range,
            startRow: anchor === 'outside selection' ? 31 : 30,
        })!;
        const document = new DOMParser().parseFromString(content.html, 'text/html');
        expect(document.querySelector('td')?.textContent).toBe('');
        expect(content.matrixFragment.getValue(0, 0)?.v).toBeFalsy();
    });

    it('copies only projected visible rows and compacts a merge across a hidden row', async () => {
        const target = { unitId: 'test', subUnitId: 'sheet1' };
        const range = { startRow: 30, endRow: 33, startColumn: 0, endColumn: 0 };
        expect(commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            ...target,
            cellValue: { 30: { 0: { v: 'Merged' } }, 33: { 0: { v: 'Next' } } },
        })).toBe(true);
        expect(commandService.syncExecuteCommand(AddWorksheetMergeMutation.id, {
            ...target,
            ranges: [{ ...range, endRow: 32 }],
        })).toBe(true);
        get(SheetSkeletonManagerService).setProjection('sheet1', {
            isRowFiltered: (row) => row === 31,
            getCell: () => undefined,
        });
        const sheet = get(IUniverInstanceService).getUnit<Workbook>('test')!.getSheetBySheetId('sheet1')!;
        const read = vi.spyOn(sheet, 'getCellRaw');
        try {
            const content = sheetClipboardService.generateCopyContent('test', 'sheet1', range)!;
            expect(read.mock.calls.some(([row]) => row === 31)).toBe(false);
            expect(content.discreteRange.rows).toEqual([30, 32, 33]);
            expect(content.matrixFragment.getValue(0, 0)).toMatchObject({ v: 'Merged', rowSpan: 2 });
            expect(content.matrixFragment.getValue(2, 0)?.v).toBe('Next');
            const document = new DOMParser().parseFromString(content.html, 'text/html');
            expect(Array.from(document.querySelectorAll('td'), (cell) => cell.textContent)).toEqual(['Merged', 'Next']);
            expect(document.querySelector('td')?.getAttribute('rowspan')).toBe('2');
        } finally {
            read.mockRestore();
        }
        get(SheetsSelectionsService).addSelections([{ range, primary: null, style: null }]);
        expect(await sheetClipboardService.copy()).toBe(true);
        const copyId = sheetClipboardService.copyContentCache().getLastCopyId()!;
        expect(await sheetClipboardService.pasteByCopyId(copyId, undefined, {
            unitId: 'test',
            subUnitId: 'sheet2',
            range: { startRow: 35, endRow: 35, startColumn: 0, endColumn: 0 },
        })).toBe(true);
        expect(getMergedCells(35, 0, 37, 0, 'sheet2')).toEqual([
            expect.objectContaining({ startRow: 35, endRow: 36, startColumn: 0, endColumn: 0 }),
        ]);
        expect(getValues(37, 0, 37, 0, 'sheet2')?.[0][0]?.v).toBe('Next');
    });

    it('shares projected source rows with metadata copy hooks', () => {
        const rows: number[][] = [];
        sheetClipboardService.addClipboardHook({
            id: 'metadata-source-rows',
            onBeforeCopy: (...args) => rows.push(args[4]?.rows ?? []),
        });
        get(SheetSkeletonManagerService).setProjection('sheet1', {
            isRowFiltered: (row) => row === 31,
            getCell: () => undefined,
        });
        const content = sheetClipboardService.generateCopyContent('test', 'sheet1', {
            startRow: 30,
            endRow: 32,
            startColumn: 0,
            endColumn: 0,
        })!;
        expect(rows).toEqual([content.discreteRange.rows]);
        expect(rows[0]).toEqual([30, 32]);
    });

    it('copies a publicly filtered row with its visible projected height', () => {
        const worksheet = get(IUniverInstanceService).getUnit<Workbook>('test')!.getSheetBySheetId('sheet1')!;
        worksheet.__interceptViewModel((viewModel) => {
            viewModel.registerRowFilteredInterceptor({ getRowFiltered: (row) => row === 32 });
        });
        get(SheetSkeletonManagerService).setProjection('sheet1', { isRowFiltered: () => false, getCell: () => undefined });
        const content = sheetClipboardService.generateCopyContent('test', 'sheet1', {
            startRow: 32,
            endRow: 32,
            startColumn: 0,
            endColumn: 0,
        })!;
        expect(content.html).toContain(`height: ${worksheet.getRowManager().getRowHeight(32)}px;`);
        expect(worksheet.getRowHeight(32)).toBe(0);
    });

    it.each([
        { copyType: COPY_TYPE.COPY, filteredRow: 31, expected: ['A', undefined, 'C'], remaining: ['A', 'B', 'C'] },
        { copyType: COPY_TYPE.CUT, filteredRow: 31, expected: ['A', 'B', 'C'], remaining: [undefined, undefined, undefined] },
        { copyType: COPY_TYPE.CUT, filteredRow: 30, expected: ['B', 'C', undefined], remaining: ['A', undefined, undefined] },
    ])('uses projected coordinates for $copyType with filtered row $filteredRow', async ({ copyType, filteredRow, expected, remaining }) => {
        const source = { unitId: 'test', subUnitId: 'sheet1' };
        const target = { unitId: 'test', subUnitId: 'sheet2' };
        expect(commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            ...source,
            cellValue: { 30: { 0: { v: 'A' } }, 31: { 0: { v: 'B' } }, 32: { 0: { v: 'C' } } },
        })).toBe(true);
        const worksheet = get(IUniverInstanceService).getUnit<Workbook>('test')!.getSheetBySheetId('sheet1')!;
        worksheet.__interceptViewModel((viewModel) => {
            viewModel.registerRowFilteredInterceptor({ getRowFiltered: (row) => row === 32 });
        });
        expect(worksheet.getRowFiltered(32)).toBe(true);
        const display = get(SheetSkeletonManagerService);
        display.setProjection('sheet1', { isRowFiltered: (row) => row === filteredRow, getCell: () => undefined });
        if (copyType === COPY_TYPE.COPY) {
            display.setProjection('sheet2', { isRowFiltered: (row) => row === 36, getCell: () => undefined });
        }
        get(SheetsSelectionsService).addSelections([{
            range: { startRow: 30, endRow: 32, startColumn: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
            primary: null,
            style: null,
        }]);
        expect(await (copyType === COPY_TYPE.COPY ? sheetClipboardService.copy() : sheetClipboardService.cut())).toBe(true);
        const copyId = sheetClipboardService.copyContentCache().getLastCopyId()!;
        expect(await sheetClipboardService.pasteByCopyId(copyId, undefined, {
            ...target,
            range: { startRow: 35, endRow: 35, startColumn: 0, endColumn: 0 },
        })).toBe(true);
        expect(getValues(35, 0, 37, 0, 'sheet2')?.map(([cell]) => cell?.v ?? undefined)).toEqual(expected);
        expect(getValues(30, 0, 32, 0)?.map(([cell]) => cell?.v ?? undefined)).toEqual(remaining);
    });

    describe('Test cut command in single selection', () => {
        it('checks range movement before resource hooks and keeps a rejected cut available for retry', async () => {
            const workbook = get(IUniverInstanceService).getUnit<Workbook>('test')!;
            const snapshot = Tools.deepClone(workbook.getSnapshot());
            const history = get(IUndoRedoService).getUndoRedoStatus('test');
            const matrix = new ObjectMatrix<ICellData>();
            matrix.setValue(0, 0, { v: 'A25' });
            const copyId = 'rejected-cut';
            sheetClipboardService.copyContentCache().set(copyId, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { rows: [24], cols: [0] },
                matrix,
                copyType: COPY_TYPE.CUT,
            });
            let allowed = false;
            const checks: unknown[] = [];
            const validation = get(SheetInterceptorService).interceptBeforeCommand({
                performCheck: async (command) => {
                    checks.push(command);
                    return allowed;
                },
            });
            let hooksCalled = 0;
            const hook = sheetClipboardService.addClipboardHook({
                id: 'movement-preflight-resource',
                onBeforePaste: () => {
                    hooksCalled++;
                    return true;
                },
            });
            const target = {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 24, endRow: 24, startColumn: 1, endColumn: 1 },
            };
            expect(await sheetClipboardService.pasteByCopyId(copyId, undefined, target)).toBe(false);
            expect(checks).toEqual([{
                id: MoveRangeCommand.id,
                params: {
                    fromUnitId: 'test',
                    fromSubUnitId: 'sheet1',
                    fromRange: { startRow: 24, endRow: 24, startColumn: 0, endColumn: 0 },
                    toUnitId: 'test',
                    toSubUnitId: 'sheet1',
                    toRange: target.range,
                },
            }]);
            expect(hooksCalled).toBe(0);
            expect(workbook.getSnapshot()).toEqual(snapshot);
            expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual(history);
            expect(sheetClipboardService.copyContentCache().get(copyId)?.matrix).toBe(matrix);
            allowed = true;
            expect(await sheetClipboardService.pasteByCopyId(copyId, undefined, target)).toBe(true);
            expect(getValues(24, 0, 24, 1)?.[0].map((cell) => cell?.v ?? null)).toEqual([null, 'A25']);
            expect(hooksCalled).toBe(1);
            validation.dispose();
            hook.dispose();
        });

        it('rejects cross-workbook cuts before running resource hooks and retains the cut for a valid retry', async () => {
            const instances = get(IUniverInstanceService);
            const source = instances.getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!;
            const sourceBefore = Tools.deepClone(source.getSnapshot());
            const peer = instances.createUnit(UniverInstanceType.UNIVER_SHEET, {
                ...Tools.deepClone(sourceBefore),
                id: 'cut-peer',
            }, { makeCurrent: false });
            const peerBefore = Tools.deepClone(peer.getSnapshot());
            const history = get(IUndoRedoService);
            const peerHistory = history.getUndoRedoStatus('cut-peer');
            const sourceHistory = history.getUndoRedoStatus('test');
            const copyId = 'cross-workbook-cut';
            const matrix = new ObjectMatrix<ICellData>();
            matrix.setValue(0, 0, { v: 'A25' });
            sheetClipboardService.copyContentCache().set(copyId, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { rows: [24], cols: [0] },
                matrix,
                copyType: COPY_TYPE.CUT,
            });
            let beforePasteCalls = 0;
            const hook = sheetClipboardService.addClipboardHook({
                id: 'cross-workbook-cut-resource-boundary',
                onBeforePaste: () => {
                    beforePasteCalls += 1;
                    return true;
                },
            });
            const range = { startRow: 24, endRow: 24, startColumn: 1, endColumn: 1 };
            expect(await sheetClipboardService.pasteByCopyId(copyId, undefined, {
                unitId: 'cut-peer',
                subUnitId: 'sheet1',
                range,
            })).toBe(false);
            expect(beforePasteCalls).toBe(0);
            expect(source.getSnapshot()).toEqual(sourceBefore);
            expect(peer.getSnapshot()).toEqual(peerBefore);
            expect(history.getUndoRedoStatus('test')).toEqual(sourceHistory);
            expect(history.getUndoRedoStatus('cut-peer')).toEqual(peerHistory);
            expect(sheetClipboardService.copyContentCache().get(copyId)?.matrix).toBe(matrix);
            hook.dispose();
            instances.setCurrentUnitForType('test');
            expect(await sheetClipboardService.pasteByCopyId(copyId, undefined, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range,
            })).toBe(true);
            expect(getValues(24, 0, 24, 1)?.[0].map((cell) => cell?.v ?? null)).toEqual([null, 'A25']);
            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(getValues(24, 0, 24, 1)?.[0].map((cell) => cell?.v ?? null)).toEqual(['A25', 'B25']);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(getValues(24, 0, 24, 1)?.[0].map((cell) => cell?.v ?? null)).toEqual([null, 'A25']);
            expect(peer.getSnapshot()).toEqual(peerBefore);
        });

        it.each([COPY_TYPE.COPY, COPY_TYPE.CUT])('delegates cross-workbook focused-object %s to its hook without moving cells', async (copyType) => {
            const instances = get(IUniverInstanceService);
            const source = instances.getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!;
            const sourceBefore = Tools.deepClone(source.getSnapshot());
            const peer = instances.createUnit(UniverInstanceType.UNIVER_SHEET, {
                ...Tools.deepClone(sourceBefore),
                id: 'object-peer',
            }, { makeCurrent: false });
            const peerBefore = Tools.deepClone(peer.getSnapshot());
            const copyId = 'focused-object';
            sheetClipboardService.copyContentCache().set(copyId, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { rows: [24], cols: [0] },
                matrix: new ObjectMatrix({ 0: { 0: { v: '' } } }),
                copyType,
                skipCellCopy: true,
            });
            const handled: Array<{ source: string | undefined; target: string; copyType: COPY_TYPE | undefined }> = [];
            const hook = sheetClipboardService.addClipboardHook({
                id: 'focused-object-owner',
                onBeforeCopyFocusedObject: () => true,
                onPasteCells: (from, to, _data, payload) => {
                    handled.push({ source: from?.unitId, target: to.unitId, copyType: payload.copyType });
                    return { redos: [], undos: [] };
                },
            });
            expect(await sheetClipboardService.pasteByCopyId(copyId, undefined, {
                unitId: 'object-peer',
                subUnitId: 'sheet1',
                range: { startRow: 24, endRow: 24, startColumn: 1, endColumn: 1 },
            })).toBe(false);
            expect(handled).toEqual([{ source: 'test', target: 'object-peer', copyType }]);
            expect(source.getSnapshot()).toEqual(sourceBefore);
            expect(peer.getSnapshot()).toEqual(peerBefore);
            hook.dispose();
        });

        it('cut value from A25 to B25', async () => {
            const unitId = 'test';
            const subUnitId = 'sheet1';
            const fromRange = { rows: [24], cols: [0] };
            const toRange = { startRow: 24, startColumn: 1, endRow: 24, endColumn: 1 };
            const copyContentCache = sheetClipboardService.copyContentCache();
            const { matrixFragment, copyId } = sheetClipboardService.generateCopyContent(
                unitId,
                subUnitId,
                discreteRangeToRange(fromRange)
            )!;

            // cache the copy content for internal paste
            copyContentCache.set(copyId, {
                unitId,
                subUnitId,
                range: fromRange,
                matrix: matrixFragment,
                copyType: COPY_TYPE.CUT,
            });

            const selectionManager = get(SheetsSelectionsService);

            selectionManager.addSelections([
                {
                    range: { ...toRange, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            expect(await sheetClipboardService.pasteByCopyId(copyId, PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE)).toBe(true);

            expect(getValues(24, 0, 24, 0)![0][0]).toBe(null);
            expect(getValues(24, 1, 24, 1)![0][0]!.v).toBe('A25');

            // undo
            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getValues(24, 0, 24, 0)![0][0]!.v).toStrictEqual('A25');
            expect(getValues(24, 1, 24, 1)![0][0]!.v).toStrictEqual('B25');

            // redo
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getValues(24, 0, 24, 0)![0][0]).toBe(null);
            expect(getValues(24, 1, 24, 1)![0][0]!.v).toBe('A25');
        });
    });
});

describe('Multiline clipboard cells', () => {
    let univer: Univer;
    let workbook: Workbook;
    let commands: ICommandService;
    let clipboard: ISheetClipboardService;
    let writes: Array<{ text: string; html: string }>;

    beforeEach(() => {
        writes = [];
        const boundary: IClipboardInterfaceService = {
            supportClipboard: true,
            write: async (text, html) => { writes.push({ text, html }); },
            writeText: async (text) => { writes.push({ text, html: '' }); },
            readText: async () => '',
            read: async () => [],
        };
        const bed = clipboardTestBed(undefined, undefined, boundary);
        univer = bed.univer;
        workbook = bed.sheet;
        commands = bed.get(ICommandService);
        for (const command of [
            SetRangeValuesMutation,
            SetWorksheetRowHeightMutation,
            SetWorksheetColWidthMutation,
            AddWorksheetMergeMutation,
            RemoveWorksheetMergeMutation,
            SetSelectionsOperation,
            SetWorksheetRowAutoHeightMutation,
        ]) {
            commands.registerCommand(command);
        }
        bed.get(SheetSkeletonManagerService).setCurrent({ sheetId: 'sheet1' });
        clipboard = bed.get(ISheetClipboardService);
    });

    afterEach(() => univer.dispose());

    function select(range: IRange) {
        return commands.executeCommand(SetSelectionsOperation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            selections: [{ range: { ...range, rangeType: RANGE_TYPE.NORMAL }, primary: null, style: null }],
        });
    }

    it('exports multiline cells as Excel-compatible HTML and quoted TSV', async () => {
        await commands.executeCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: {
                0: {
                    0: {
                        p: {
                            id: 'doc-multiline',
                            body: {
                                dataStream: 'line1\rline2\r\n',
                                paragraphs: [
                                    { startIndex: 5, paragraphId: 'p1' },
                                    { startIndex: 11, paragraphId: 'p2' },
                                ],
                                sectionBreaks: [{ startIndex: 12, sectionId: 's1' }],
                            },
                            documentStyle: {},
                        },
                    },
                    1: { v: 'plain1\nplain2', t: CellValueType.STRING },
                },
                1: { 0: { v: 'quote "here"' }, 1: { v: '\n', t: CellValueType.STRING } },
            },
        });
        await select({ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 });

        expect(await commands.executeCommand(SheetCopyCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        })).toBe(true);

        const [{ text, html }] = writes;
        expect(html).toContain('br { mso-data-placement: same-cell; }');
        expect(html).toMatch(/<td[^>]*>line1<br>line2<\/td>/);
        expect(html).toMatch(/<td[^>]*>plain1<br>plain2<\/td>/);
        expect(html).toMatch(/<td[^>]*><br><\/td>/);
        expect(text).toBe('"line1\nline2"\t"plain1\nplain2"\n"quote ""here"""\t"\n"');
    });

    it('round-trips a quoted single cell through plain text', async () => {
        const value = 'quote "here"';
        await commands.executeCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: { 0: { 0: { v: value } } },
        });
        await select({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 });
        expect(await commands.executeCommand(SheetCopyCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        })).toBe(true);

        await select({ startRow: 3, endRow: 3, startColumn: 0, endColumn: 0 });
        expect(await clipboard.legacyPaste(undefined, writes[0].text)).toBe(true);
        expect(workbook.getActiveSheet().getCellRaw(3, 0)?.v).toBe(value);
    });

    it('pastes multiline Excel HTML without splitting cells or inserting leading spaces', async () => {
        await select({ startRow: 3, endRow: 3, startColumn: 0, endColumn: 0 });
        const html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office"
                  xmlns:x="urn:schemas-microsoft-com:office:excel">
            <head><style>br { mso-data-placement: same-cell; } .xl65 { color: #ff0000; }</style></head>
            <body><table><tr>
                <td class="xl65">first<br>\r\n  second</td>
                <td><span style="font-weight:bold">alpha<br>beta</span></td>
            </tr></table></body></html>
        `;

        expect(await clipboard.legacyPaste(html)).toBe(true);

        const sheet = workbook.getActiveSheet();
        expect(sheet.getCellRaw(3, 0)?.p?.body?.dataStream).toBe('first\rsecond\r\n');
        expect(sheet.getCellRaw(3, 1)?.p?.body?.dataStream).toBe('alpha\rbeta\r\n');
    });

    it.each(['keyboard', 'clipboard item'])('pastes quoted multiline TSV through the %s entry point', async (entry) => {
        await select({ startRow: 12, endRow: 12, startColumn: 0, endColumn: 0 });
        const tsv = '"row1-a\nrow1-b"\tcol2\r\nrow2-a\trow2-b\r\n';
        const pasted = entry === 'keyboard'
            ? await clipboard.legacyPaste(undefined, tsv)
            : await clipboard.paste({
                presentationStyle: 'unspecified',
                types: [PLAIN_TEXT_CLIPBOARD_MIME_TYPE],
                getType: async () => new Blob([tsv], { type: PLAIN_TEXT_CLIPBOARD_MIME_TYPE }),
            });
        expect(pasted).toBe(true);

        const sheet = workbook.getActiveSheet();
        expect(sheet.getCellRaw(12, 0)?.p?.body?.dataStream).toBe('row1-a\rrow1-b\r\n');
        expect(sheet.getCellRaw(12, 1)?.v).toBe('col2');
        expect(sheet.getCellRaw(13, 0)?.v).toBe('row2-a');
        expect(sheet.getCellRaw(13, 1)?.v).toBe('row2-b');
    });
});

describe('CHART clipboard without grid selection', () => {
    let univer: Univer;
    let get: Injector['get'];
    let workbook: Workbook;
    let commands: ICommandService;
    let clipboard: ISheetClipboardService;
    let writes: Array<{ text: string; html: string }>;

    beforeEach(() => {
        writes = [];
        const boundary: IClipboardInterfaceService = {
            supportClipboard: true,
            write: async (text, html) => { writes.push({ text, html }); },
            writeText: async (text) => { writes.push({ text, html: '' }); },
            readText: async () => '',
            read: async () => [],
        };
        const bed = clipboardTestBed(undefined, [
            [SheetPermissionInterceptorClipboardController],
            [MergeCellController],
            [RefRangeService],
        ], boundary);
        univer = bed.univer;
        get = bed.get;
        workbook = bed.sheet;
        commands = get(ICommandService);
        for (const command of [
            SetRangeValuesMutation,
            SetWorksheetRowHeightMutation,
            SetWorksheetColWidthMutation,
            SetSelectionsOperation,
            SetWorksheetActiveOperation,
            SetWorksheetRowAutoHeightMutation,
            SetWorksheetNameMutation,
        ]) {
            commands.registerCommand(command);
        }
        get(MergeCellController);
        get(SheetPermissionInterceptorClipboardController);
        clipboard = get(ISheetClipboardService);
        workbook.addWorksheet('chart-host', 1, {
            id: 'chart-host',
            name: 'Chart Host',
            type: SheetTypes.CHART,
            cellData: {},
        });
        commands.syncExecuteCommand(SetWorksheetActiveOperation.id, { unitId: 'test', subUnitId: 'chart-host' });
        get(SheetsSelectionsService).setSelections('test', 'chart-host', []);
        get(IUndoRedoService).clearUndoRedo('test');
    });

    afterEach(() => univer.dispose());

    function seedObjectCache(copyId = 'chart-object') {
        clipboard.copyContentCache().set(copyId, {
            unitId: 'test',
            subUnitId: 'chart-host',
            range: { rows: [0], cols: [0] },
            matrix: new ObjectMatrix({ 0: { 0: {} } }),
            copyType: COPY_TYPE.COPY,
            skipCellCopy: true,
        });
        return copyId;
    }

    function trackMutations() {
        const executed: string[] = [];
        const listener = commands.onCommandExecuted((command) => {
            if (command.type === CommandType.MUTATION || command.id === SetSelectionsOperation.id) {
                executed.push(command.id);
            }
        });
        onTestFinished(() => listener.dispose());
        return executed;
    }

    it.each([COPY_TYPE.COPY, COPY_TYPE.CUT])('delegates focused-object %s through the permission entry without creating a grid selection', async (operation) => {
        let focusedCalls = 0;
        let cellCalls = 0;
        const hook = clipboard.addClipboardHook({
            id: 'chart-selectionless-object-copy',
            onBeforeCopyFocusedObject: (_unitId, _subUnitId, copyType) => {
                focusedCalls += 1;
                expect(copyType).toBe(operation);
                return true;
            },
            onBeforeCopy: () => { cellCalls += 1; },
        });
        onTestFinished(() => hook.dispose());
        const before = Tools.deepClone(workbook.getSnapshot());
        const executed = trackMutations();
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
        const command = operation === COPY_TYPE.COPY ? SheetCopyCommand : SheetCutCommand;
        expect(await command.handler(get(Injector))).toBe(true);
        const copyId = clipboard.copyContentCache().getLastCopyId();
        const cached = clipboard.copyContentCache().get(copyId!)!;
        expect(focusedCalls).toBe(1);
        expect(cellCalls).toBe(0);
        expect(cached.skipCellCopy).toBe(true);
        const content: string[] = [];
        cached.matrix!.forValue((_row, _column, cell) => {
            content.push(extractPureTextFromCell(cell));
        });
        expect(content.every((text) => text === '')).toBe(true);
        expect(writes).toHaveLength(1);
        expect(writes[0].text).toBe('');
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(executed).toEqual([]);
        expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
    });

    it('pastes an object cache through its extension plan without selection or autoheight side effects', async () => {
        const copyId = seedObjectCache();
        let pasted = false;
        const hook = clipboard.addClipboardHook({
            id: 'chart-selectionless-object-plan',
            onBeforeCopyFocusedObject: () => true,
            onPasteCells: (from, to, matrix) => {
                pasted = true;
                expect(from?.subUnitId).toBe('chart-host');
                expect(to.subUnitId).toBe('chart-host');
                matrix.forValue((_row, _column, cell) => expect(extractPureTextFromCell(cell)).toBe(''));
                // A real metadata mutation exercises the extension-plan contract; Drawing acceptance belongs to its consumer.
                return {
                    redos: [{ id: SetWorksheetNameMutation.id, params: { unitId: to.unitId, subUnitId: to.subUnitId, name: 'Pasted object metadata' } }],
                    undos: [{ id: SetWorksheetNameMutation.id, params: { unitId: to.unitId, subUnitId: to.subUnitId, name: 'Chart Host' } }],
                };
            },
        });
        onTestFinished(() => hook.dispose());
        const beforeCells = Tools.deepClone(workbook.getActiveSheet().getConfig().cellData);
        const executed = trackMutations();
        expect(await clipboard.pasteByCopyId(copyId)).toBe(true);
        expect(pasted).toBe(true);
        expect(executed).toEqual([SetWorksheetNameMutation.id]);
        expect(workbook.getActiveSheet().getName()).toBe('Pasted object metadata');
        expect(workbook.getActiveSheet().getConfig().cellData).toEqual(beforeCells);
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
        expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 1, redos: 0 });
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(workbook.getActiveSheet().getName()).toBe('Chart Host');
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(workbook.getActiveSheet().getName()).toBe('Pasted object metadata');
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
    });

    it('pastes a CHART object into GRID without touching its selected text cell or autoheight row', async () => {
        const copyId = seedObjectCache();
        commands.syncExecuteCommand(SetWorksheetActiveOperation.id, { unitId: 'test', subUnitId: 'sheet1' });
        expect(commands.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: { 4: { 3: { v: 'A wrapped text line that must remain untouched.\n'.repeat(12), s: { tb: WrapStrategy.WRAP } } } },
        })).toBe(true);
        expect(commands.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rowsAutoHeightInfo: [{ row: 4, autoHeight: 64 }],
        })).toBe(true);
        const selections = get(SheetsSelectionsService);
        selections.setSelections('test', 'sheet1', [{
            range: { startRow: 4, endRow: 4, startColumn: 3, endColumn: 3 },
            primary: null,
            style: null,
        }]);
        const grid = workbook.getActiveSheet();
        const beforeCells = Tools.deepClone(grid.getConfig().cellData);
        const beforeRows = Tools.deepClone(grid.getConfig().rowData);
        const beforeSelections = Tools.deepClone(selections.getCurrentSelections());
        const originalName = grid.getName();
        const skeleton = get(SheetSkeletonManagerService).ensureSkeleton('sheet1')!;
        const calculateAutoHeight = vi.spyOn(skeleton, 'calculateAutoHeightInRange');
        onTestFinished(() => calculateAutoHeight.mockRestore());
        const rowAndColumnHooks: string[] = [];
        const hook = clipboard.addClipboardHook({
            id: 'chart-to-grid-object-plan',
            onBeforeCopyFocusedObject: () => true,
            onPasteRows: () => {
                rowAndColumnHooks.push('row');
                return { redos: [], undos: [] };
            },
            onPasteColumns: () => {
                rowAndColumnHooks.push('column');
                return { redos: [], undos: [] };
            },
            onPasteCells: (from, to) => {
                expect(from?.subUnitId).toBe('chart-host');
                expect(to.subUnitId).toBe('sheet1');
                return {
                    redos: [{ id: SetWorksheetNameMutation.id, params: { unitId: to.unitId, subUnitId: to.subUnitId, name: 'GRID object metadata' } }],
                    undos: [{ id: SetWorksheetNameMutation.id, params: { unitId: to.unitId, subUnitId: to.subUnitId, name: originalName } }],
                };
            },
        });
        onTestFinished(() => hook.dispose());
        get(IUndoRedoService).clearUndoRedo('test');
        const executed = trackMutations();
        expect(await clipboard.pasteByCopyId(copyId)).toBe(true);
        expect(executed).toEqual([SetWorksheetNameMutation.id]);
        expect(rowAndColumnHooks).toEqual([]);
        expect(calculateAutoHeight).not.toHaveBeenCalled();
        expect(grid.getName()).toBe('GRID object metadata');
        expect(grid.getConfig().cellData).toEqual(beforeCells);
        expect(grid.getConfig().rowData).toEqual(beforeRows);
        expect(selections.getCurrentSelections()).toEqual(beforeSelections);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(grid.getName()).toBe(originalName);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(grid.getName()).toBe('GRID object metadata');
        expect(grid.getConfig().cellData).toEqual(beforeCells);
        expect(grid.getConfig().rowData).toEqual(beforeRows);
        expect(selections.getCurrentSelections()).toEqual(beforeSelections);
    });

    it.each(['success', 'empty plan', 'owner throws'])('finalizes before-only CHART paste observers exactly once after %s', async (outcome) => {
        const copyId = seedObjectCache();
        const observed: boolean[] = [];
        const ownerFinalized: boolean[] = [];
        let beforeCalls = 0;
        const observer = clipboard.addClipboardHook({
            id: 'chart-before-only-paste-observer',
            onBeforePaste: () => {
                beforeCalls += 1;
                return true;
            },
            onAfterPaste: (result) => { observed.push(result); },
        });
        const owner = clipboard.addClipboardHook({
            id: 'chart-object-paste-lifecycle-owner',
            onBeforeCopyFocusedObject: () => true,
            onPasteCells: (_from, to) => {
                if (outcome === 'owner throws') {
                    throw new Error('Object owner preparation failed');
                }
                if (outcome === 'empty plan') {
                    return { redos: [], undos: [] };
                }
                return {
                    redos: [{ id: SetWorksheetNameMutation.id, params: { unitId: to.unitId, subUnitId: to.subUnitId, name: 'Finalized object metadata' } }],
                    undos: [{ id: SetWorksheetNameMutation.id, params: { unitId: to.unitId, subUnitId: to.subUnitId, name: 'Chart Host' } }],
                };
            },
            onAfterPaste: (result) => { ownerFinalized.push(result); },
        });
        onTestFinished(() => {
            observer.dispose();
            owner.dispose();
        });
        const before = Tools.deepClone(workbook.getSnapshot());
        const executed = trackMutations();
        const paste = clipboard.pasteByCopyId(copyId);
        if (outcome === 'owner throws') {
            await expect(paste).rejects.toThrow('Object owner preparation failed');
        } else {
            expect(await paste).toBe(outcome === 'success');
        }
        expect(beforeCalls).toBe(1);
        expect(observed).toEqual([outcome === 'success']);
        expect(ownerFinalized).toEqual(observed);
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
        if (outcome === 'success') {
            expect(executed).toEqual([SetWorksheetNameMutation.id]);
            expect(workbook.getActiveSheet().getName()).toBe('Finalized object metadata');
            expect(workbook.getActiveSheet().getConfig().cellData).toEqual(before.sheets['chart-host'].cellData);
            expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 1, redos: 0 });
        } else {
            expect(executed).toEqual([]);
            expect(workbook.getSnapshot()).toEqual(before);
            expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
        }
    });

    it.each(['error', 'undefined'])('finishes every CHART paste finalizer once and preserves the first after %s', async (failure) => {
        let afterCalls = 0;
        let ownerAfterCalls = 0;
        const firstFailure = failure === 'undefined' ? undefined : new Error('Paste finalizer failed');
        const observer = clipboard.addClipboardHook({
            id: 'chart-failing-finalizer',
            onBeforePaste: () => true,
            onAfterPaste: () => {
                afterCalls += 1;
                throw firstFailure;
            },
        });
        const owner = clipboard.addClipboardHook({
            id: 'chart-empty-plan-with-failing-finalizer',
            onBeforeCopyFocusedObject: () => true,
            onPasteCells: () => ({ redos: [], undos: [] }),
            onAfterPaste: () => {
                ownerAfterCalls += 1;
                throw new Error('Later finalizer failed');
            },
        });
        onTestFinished(() => {
            observer.dispose();
            owner.dispose();
        });
        const before = Tools.deepClone(workbook.getSnapshot());
        const executed = trackMutations();
        await expect(clipboard.pasteByCopyId(seedObjectCache())).rejects.toBe(firstFailure);
        expect(afterCalls).toBe(1);
        expect(ownerAfterCalls).toBe(1);
        expect(executed).toEqual([]);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
    });

    it.each(['owner error', 'owner undefined', 'before error', 'before undefined'])('preserves the original %s while completing failing CHART finalizers', async (failure) => {
        const originalFailure = failure.endsWith('undefined') ? undefined : new Error('Original paste preparation failed');
        const finalizers: string[] = [];
        const observer = clipboard.addClipboardHook({
            id: 'chart-original-error-observer',
            onBeforePaste: () => true,
            onAfterPaste: (result) => {
                expect(result).toBe(false);
                finalizers.push('observer');
                throw new Error('Observer finalization failed');
            },
        });
        const owner = clipboard.addClipboardHook({
            id: 'chart-original-error-owner',
            onBeforeCopyFocusedObject: () => true,
            onBeforePaste: () => {
                if (failure.startsWith('before')) {
                    throw originalFailure;
                }
                return true;
            },
            onPasteCells: () => { throw originalFailure; },
            onAfterPaste: (result) => {
                expect(result).toBe(false);
                finalizers.push('owner');
                throw new Error('Owner finalization failed');
            },
        });
        onTestFinished(() => {
            observer.dispose();
            owner.dispose();
        });
        const before = Tools.deepClone(workbook.getSnapshot());
        const executed = trackMutations();
        await expect(clipboard.pasteByCopyId(seedObjectCache())).rejects.toBe(originalFailure);
        expect(finalizers).toEqual(['observer', 'owner']);
        expect(executed).toEqual([]);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
    });

    it('rejects an unclaimed CHART copy instead of falling back to cell content', async () => {
        let focusedCalls = 0;
        let cellCalls = 0;
        const hook = clipboard.addClipboardHook({
            id: 'chart-no-focused-object',
            onBeforeCopyFocusedObject: () => {
                focusedCalls += 1;
                return false;
            },
            onBeforeCopy: () => { cellCalls += 1; },
        });
        onTestFinished(() => hook.dispose());
        expect(await clipboard.copy()).toBe(false);
        expect(focusedCalls).toBe(1);
        expect(cellCalls).toBe(0);
        expect(writes).toEqual([]);
        expect(clipboard.copyContentCache().getLastCopyId()).toBeNull();
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
    });

    it('does not allow formula-only copy to use the selectionless object path', async () => {
        let focusedCalls = 0;
        const hook = clipboard.addClipboardHook({
            id: 'chart-copy-only',
            onBeforeCopyFocusedObject: () => {
                focusedCalls += 1;
                return true;
            },
        });
        onTestFinished(() => hook.dispose());
        expect(await clipboard.copy({ copyHookType: PREDEFINED_HOOK_NAME_COPY.SPECIAL_COPY_FORMULA_ONLY })).toBe(false);
        expect(focusedCalls).toBe(0);
        expect(writes).toEqual([]);
        expect(clipboard.copyContentCache().getLastCopyId()).toBeNull();
    });

    it.each(['workbook', 'worksheet'])('retains %s copy permission before invoking a focused CHART owner', async (scope) => {
        const permissions = get(IPermissionService);
        const point = scope === 'workbook' ? new WorkbookCopyPermission('test') : new WorksheetCopyPermission('test', 'chart-host');
        if (!permissions.getPermissionPoint(point.id)) {
            permissions.addPermissionPoint(point);
        }
        permissions.updatePermissionPoint(point.id, false);
        let focusedCalls = 0;
        const hook = clipboard.addClipboardHook({
            id: 'chart-denied-copy',
            onBeforeCopyFocusedObject: () => {
                focusedCalls += 1;
                return true;
            },
        });
        onTestFinished(() => hook.dispose());
        await expect(SheetCopyCommand.handler(get(Injector))).rejects.toThrow(CustomCommandExecutionError);
        expect(focusedCalls).toBe(0);
        expect(writes).toEqual([]);
        expect(clipboard.copyContentCache().getLastCopyId()).toBeNull();
    });

    it('runs paste permissions before a CHART object extension plan', async () => {
        const point = new WorksheetEditPermission('test', 'chart-host');
        const permissions = get(IPermissionService);
        if (!permissions.getPermissionPoint(point.id)) {
            permissions.addPermissionPoint(point);
        }
        permissions.updatePermissionPoint(point.id, false);
        let pasted = false;
        const hook = clipboard.addClipboardHook({
            id: 'chart-denied-paste',
            onBeforeCopyFocusedObject: () => true,
            onPasteCells: () => {
                pasted = true;
                return { redos: [], undos: [] };
            },
        });
        onTestFinished(() => hook.dispose());
        const before = Tools.deepClone(workbook.getSnapshot());
        const executed = trackMutations();
        await expect(clipboard.pasteByCopyId(seedObjectCache())).rejects.toThrow(CustomCommandExecutionError);
        expect(pasted).toBe(false);
        expect(executed).toEqual([]);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
    });

    it.each(['chart-host', 'sheet1'])('rejects an object paste to %s whose hooks contribute no mutation plan', async (targetSheet) => {
        let pasted = false;
        const hook = clipboard.addClipboardHook({
            id: 'chart-empty-object-plan',
            onBeforeCopyFocusedObject: () => true,
            onPasteCells: () => {
                pasted = true;
                return { redos: [], undos: [] };
            },
        });
        onTestFinished(() => hook.dispose());
        const before = Tools.deepClone(workbook.getSnapshot());
        const executed = trackMutations();
        expect(await clipboard.pasteByCopyId(seedObjectCache(), undefined, {
            unitId: 'test',
            subUnitId: targetSheet,
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
        })).toBe(false);
        expect(pasted).toBe(true);
        expect(executed).toEqual([]);
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
    });

    it.each(['chart-host', 'sheet1'])('lets the object owner handle CUT into %s and replays its history', async (targetSheet) => {
        const copyId = seedObjectCache();
        const cached = clipboard.copyContentCache().get(copyId)!;
        clipboard.copyContentCache().set(copyId, { ...cached, copyType: COPY_TYPE.CUT });
        const sheet = workbook.getSheetBySheetId(targetSheet)!;
        const originalName = sheet.getName();
        const hook = clipboard.addClipboardHook({
            id: 'object-cut-owner',
            onBeforeCopyFocusedObject: () => true,
            onBeforePaste: (_target, payload) => {
                expect(payload).toMatchObject({ copyId, copyType: COPY_TYPE.CUT, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE });
                expect(clipboard.copyContentCache().get(payload!.copyId!)?.skipCellCopy).toBe(true);
                return true;
            },
            onPasteCells: (_from, to) => ({
                redos: [{ id: SetWorksheetNameMutation.id, params: { unitId: to.unitId, subUnitId: to.subUnitId, name: 'Object owner result' } }],
                undos: [{ id: SetWorksheetNameMutation.id, params: { unitId: to.unitId, subUnitId: to.subUnitId, name: originalName } }],
            }),
        });
        onTestFinished(() => hook.dispose());
        const executed = trackMutations();
        expect(await clipboard.pasteByCopyId(copyId, undefined, {
            unitId: 'test',
            subUnitId: targetSheet,
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
        })).toBe(true);
        expect(executed).toEqual([SetWorksheetNameMutation.id]);
        expect(sheet.getName()).toBe('Object owner result');
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(sheet.getName()).toBe(originalName);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(sheet.getName()).toBe('Object owner result');
    });

    it('keeps GRID cell copy and paste working while rejecting an empty GRID selection', async () => {
        commands.syncExecuteCommand(SetWorksheetActiveOperation.id, { unitId: 'test', subUnitId: 'sheet1' });
        const selections = get(SheetsSelectionsService);
        selections.setSelections('test', 'sheet1', [{
            range: { startRow: 24, endRow: 24, startColumn: 0, endColumn: 0 },
            primary: null,
            style: null,
        }]);
        expect(await clipboard.copy()).toBe(true);
        const copyId = clipboard.copyContentCache().getLastCopyId()!;
        selections.setSelections('test', 'sheet1', [{
            range: { startRow: 24, endRow: 24, startColumn: 1, endColumn: 1 },
            primary: null,
            style: null,
        }]);
        expect(await clipboard.pasteByCopyId(copyId)).toBe(true);
        expect(workbook.getActiveSheet().getCellRaw(24, 1)?.v).toBe('A25');
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(workbook.getActiveSheet().getCellRaw(24, 1)?.v).toBe('B25');
        selections.setSelections('test', 'sheet1', []);
        let focusedCalls = 0;
        const hook = clipboard.addClipboardHook({
            id: 'grid-selection-required',
            onBeforeCopyFocusedObject: () => {
                focusedCalls += 1;
                return true;
            },
        });
        onTestFinished(() => hook.dispose());
        const before = Tools.deepClone(workbook.getSnapshot());
        expect(await clipboard.copy()).toBe(false);
        expect(clipboard.capturePasteTarget()).toBeNull();
        expect(await clipboard.pasteByCopyId(copyId)).toBe(false);
        expect(focusedCalls).toBe(0);
        expect(workbook.getSnapshot()).toEqual(before);
    });
});

describe('SheetClipboardService', () => {
    class NoopNotificationService {
        show() {
            return { dispose: () => {} };
        }
    }

    class TestClipboardInterfaceService {
        readonly writes: Array<{ text: string; html: string; customData?: Record<string, string> }> = [];

        get supportClipboard(): boolean {
            return true;
        }

        async writeText(text: string): Promise<void> {
            this.writes.push({ text, html: '' });
        }

        async write(text: string, html: string, customData?: Record<string, string>): Promise<void> {
            this.writes.push({ text, html, customData });
        }

        async readText(): Promise<string> {
            return '';
        }

        async read(): Promise<ClipboardItem[]> {
            return [];
        }
    }

    interface ITestCell {
        v?: string;
        f?: string;
        s?: unknown;
        rowSpan?: number;
        colSpan?: number;
    }

    interface ITestDiscreteRange {
        rows: number[];
        cols: number[];
    }

    interface IPrivateClipboardServiceAccess {
        _pasteUSM(
            data: { cellMatrix: ObjectMatrix<ITestCell>; rowProperties: unknown[]; colProperties: unknown[] },
            target: { unitId: string; subUnitId: string; pastedRange: ITestDiscreteRange },
            pasteType: string,
            source?: {
                unitId: string;
                subUnitId: string;
                range: ITestDiscreteRange;
                copyId: string;
                copyType: COPY_TYPE;
                skipCellCopy?: boolean;
            }
        ): boolean;
        _transformPastedData(
            rowCount: number,
            colCount: number,
            cellMatrix: ObjectMatrix<ITestCell>
        ): { unitId: string; subUnitId: string; pastedRange: ITestDiscreteRange } | null;
        _expandOrShrinkRowsCols(
            unitId: string,
            subUnitId: string,
            range: ITestDiscreteRange,
            colCount: number,
            rowCount: number
        ): ITestDiscreteRange;
        _getSetSelectionOperation(
            unitId: string,
            subUnitId: string,
            range: ITestDiscreteRange,
            cellMatrix: ObjectMatrix<ITestCell>,
            pasteType: string
        ): {
            params: {
                selections: Array<{
                    primary: {
                        startRow: number;
                        endRow: number;
                        startColumn: number;
                        endColumn: number;
                        isMerged?: boolean;
                        isMergedMainCell?: boolean;
                    };
                }>;
            };
        };
        _topLeftCellsMatch(rowCount: number, colCount: number, range: { topRow: number; leftCol: number }): boolean;
    }

    function createTestContext(appVersion = 'Linux') {
        vi.stubGlobal('navigator', { appVersion });
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([SheetsSelectionsService]);
        injector.add([IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }]);
        injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([SheetSkeletonService]);
        injector.add([IMarkSelectionService, { useClass: MarkSelectionService }]);
        injector.add([INotificationService, { useClass: NoopNotificationService }]);
        injector.add([IPlatformService, { useClass: PlatformService }]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([ThemeService]);
        injector.add([LocaleService]);
        injector.add([RegionService]);
        injector.add([ErrorService]);
        injector.add([ISheetClipboardService, { useClass: SheetClipboardService }]);
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.ZH_CN]: {} });
        localeService.setLocale(LocaleType.ZH_CN);
        localeService.setDirection('ltr');
        const commandService = injector.get(ICommandService);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(SetWorksheetActiveOperation);
        const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
        const workbook = injector.createInstance(Workbook, {
            id: 'unit-1',
            sheets: {
                'sheet-1': {
                    id: 'sheet-1',
                    cellData: {
                        0: {
                            0: {
                                v: 'Quarterly revenue',
                            },
                        },
                    },
                    mergeData: [
                        {
                            startRow: 1,
                            startColumn: 1,
                            endRow: 2,
                            endColumn: 2,
                        },
                    ],
                },
            },
            sheetOrder: ['sheet-1'],
        });
        univerInstanceService.__addUnit(workbook);
        univerInstanceService.focusUnit('unit-1');
        return {
            injector,
            service: injector.get(ISheetClipboardService),
        };
    }

    function createService(): ISheetClipboardService {
        return createTestContext().service;
    }

    function selectCell(injector: Injector, row = 0, column = 0) {
        selectRange(injector, row, column, row, column);
    }

    function selectRange(injector: Injector, startRow: number, startColumn: number, endRow: number, endColumn: number) {
        const selectionManager = injector.get(SheetsSelectionsService);
        selectionManager.addSelections([
            {
                range: {
                    startRow,
                    startColumn,
                    endRow,
                    endColumn,
                    rangeType: RANGE_TYPE.NORMAL,
                },
                primary: null,
                style: null,
            },
        ]);
    }

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('tracks paste menu state, paste options, and clipboard hooks used by copy/paste features', () => {
        const service = createService();
        const hook = { id: 'business-copy', priority: 1 };
        const cache = { pasteType: 'special-paste-value' };

        service.setShowMenu(true);
        service.updatePasteOptionsCache(cache as never);
        const disposable = service.addClipboardHook(hook as never);

        expect(service.getPasteMenuVisible()).toBe(true);
        expect(service.getPasteOptionsCache()).toBe(cache);
        expect(service.getClipboardHooks()).toEqual([hook]);

        disposable.dispose();
        service.disposePasteOptionsCache();
        expect(service.getClipboardHooks()).toEqual([]);
        expect(service.getPasteMenuVisible()).toBe(false);
        expect(service.getPasteOptionsCache()).toBeNull();
    });

    it('keeps clipboard hooks in priority order and ignores duplicate hook ids', () => {
        const service = createService();
        const lowPriority = { id: 'after-default', priority: 20 };
        const highPriority = { id: 'before-default', priority: 1 };
        const duplicateHighPriority = { id: 'before-default', priority: 0 };

        service.addClipboardHook(lowPriority as never);
        service.addClipboardHook(highPriority as never);
        service.addClipboardHook(duplicateHighPriority as never);

        expect(service.getClipboardHooks().map((hook) => hook.id)).toEqual(['before-default', 'after-default']);
    });

    it('copies the current sheet selection into clipboard text/html and internal paste cache', async () => {
        const { injector, service } = createTestContext();
        selectCell(injector);

        const copied = await service.copy();
        const clipboard = injector.get(IClipboardInterfaceService) as unknown as TestClipboardInterfaceService;
        const copyId = clipboard.writes[0].html.match(/data-copy-id="([^"]+)"/)?.[1];

        expect(copied).toBe(true);
        expect(clipboard.writes[0].text).toBe('Quarterly revenue');
        expect(clipboard.writes[0].html).toContain('data-copy-id=');
        expect(copyId && service.copyContentCache().get(copyId)?.copyType).toBe(COPY_TYPE.COPY);
    });

    it('wraps merged sheet html with Excel metadata only when writing to the system clipboard', async () => {
        const { injector, service } = createTestContext();
        selectRange(injector, 1, 1, 2, 2);
        service.addClipboardHook({
            id: 'merged-cell-html',
            onCopyCellStyle(_row: number, _column: number, rowSpan?: number, colSpan?: number) {
                return rowSpan || colSpan
                    ? { rowspan: `${rowSpan || 1}`, colspan: `${colSpan || 1}` }
                    : undefined;
            },
        } as never);

        const generatedHtml = service.generateCopyContent('unit-1', 'sheet-1', {
            startRow: 1,
            startColumn: 1,
            endRow: 2,
            endColumn: 2,
        })?.html;

        expect(generatedHtml).toMatch(/^<google-sheets-html-origin><table/);
        expect(await service.copy()).toBe(true);

        const clipboard = injector.get(IClipboardInterfaceService) as unknown as TestClipboardInterfaceService;
        const writtenHtml = clipboard.writes[0].html;

        expect(writtenHtml).toContain('xmlns:o="urn:schemas-microsoft-com:office:office"');
        expect(writtenHtml).toContain('xmlns:x="urn:schemas-microsoft-com:office:excel"');
        expect(writtenHtml).toContain('xmlns="http://www.w3.org/TR/REC-html40"');
        expect(writtenHtml).toContain('<meta name="ProgId" content="Excel.Sheet">');
        expect(writtenHtml).toContain('<meta name="Generator" content="Univer">');
        expect(writtenHtml).toContain('<!--StartFragment--><table');
        expect(writtenHtml).toContain('rowspan="2" colspan="2"');
        expect(writtenHtml).toContain('data-copy-id=');
        expect(writtenHtml).toContain('</table><!--EndFragment-->');
    });

    it('recognizes its Excel-compatible clipboard html as internal content on Windows', async () => {
        const { injector, service } = createTestContext('Windows');
        selectCell(injector);
        const notificationService = injector.get(INotificationService);
        const notificationSpy = vi.spyOn(notificationService, 'show');

        expect(await service.copy()).toBe(true);

        const clipboard = injector.get(IClipboardInterfaceService) as unknown as TestClipboardInterfaceService;
        const item = new MockClipboardItem({ 'text/html': clipboard.writes[0].html });

        await service.paste(item as unknown as ClipboardItem);

        expect(notificationSpy).not.toHaveBeenCalled();
    });

    it('writes formula clipboard payload for copyable formula cells', async () => {
        const { injector, service } = createTestContext();
        selectRange(injector, 1, 2, 2, 3);

        service.addClipboardHook({
            id: PREDEFINED_HOOK_NAME_COPY.SPECIAL_COPY_FORMULA_ONLY,
            getCopyCellFormula(row: number, column: number) {
                return row === 2 && column === 3 ? '=A1+B1' : '';
            },
        } as never);

        expect(await service.copy()).toBe(true);

        const clipboard = injector.get(IClipboardInterfaceService) as unknown as TestClipboardInterfaceService;
        const formulaPayload = clipboard.writes[0].customData?.['web application/x-univer-sheets-formula'];

        expect(formulaPayload).toBe(JSON.stringify({
            rowCount: 2,
            columnCount: 2,
            origin: {
                row: 1,
                column: 2,
            },
            formulas: [
                {
                    row: 1,
                    column: 1,
                    f: '=A1+B1',
                },
            ],
        }));
    });

    it('does not write formula clipboard payload when filtered rows are skipped', async () => {
        const { injector, service } = createTestContext();
        selectRange(injector, 1, 2, 2, 3);

        service.addClipboardHook({
            id: PREDEFINED_HOOK_NAME_COPY.SPECIAL_COPY_FORMULA_ONLY,
            getFilteredOutRows() {
                return [1];
            },
            getCopyCellFormula(row: number, column: number) {
                return row === 2 && column === 3 ? '=A1+B1' : '';
            },
        } as never);

        expect(await service.copy()).toBe(true);

        const clipboard = injector.get(IClipboardInterfaceService) as unknown as TestClipboardInterfaceService;
        expect(clipboard.writes[0].customData?.['web application/x-univer-sheets-formula']).toBeUndefined();
    });

    it('records cut selections as cut copy cache entries', async () => {
        const { injector, service } = createTestContext();
        selectCell(injector);

        const cut = await service.cut();
        const clipboard = injector.get(IClipboardInterfaceService) as unknown as TestClipboardInterfaceService;
        const copyId = clipboard.writes[0].html.match(/data-copy-id="([^"]+)"/)?.[1];

        expect(cut).toBe(true);
        expect(clipboard.writes[0].html).toContain('xmlns:x="urn:schemas-microsoft-com:office:excel"');
        expect(service.copyContentCache().get(copyId!)?.copyType).toBe(COPY_TYPE.CUT);
    });

    it('routes plain text and image clipboard items to paste hooks with the requested paste type', async () => {
        const { injector, service } = createTestContext();
        selectCell(injector);
        const pastedTexts: Array<{ text: string; pasteType: string }> = [];
        const pastedFiles: Array<{ name: string; pasteType: string }> = [];

        service.addClipboardHook({
            id: 'plain-and-image-paste',
            onPastePlainText(_payload: unknown, text: string, options: { pasteType: string }) {
                pastedTexts.push({ text, pasteType: options.pasteType });
                return { redos: [], undos: [] };
            },
            onPasteFiles(_payload: unknown, files: File[], options: { pasteType: string }) {
                pastedFiles.push({ name: files[0].name, pasteType: options.pasteType });
                return { redos: [], undos: [] };
            },
        } as never);

        const textItem = new MockClipboardItem({ 'text/plain': 'North\tSouth' });
        const imageItem = new MockClipboardItem({ 'image/png': 'image-bytes' });

        expect(await service.paste(textItem as unknown as ClipboardItem, PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE)).toBe(true);
        expect(await service.paste(imageItem as unknown as ClipboardItem, PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT)).toBe(true);
        expect(pastedTexts).toEqual([{ text: 'North\tSouth', pasteType: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE }]);
        expect(pastedFiles).toEqual([{ name: 'clipboard-image.png', pasteType: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT }]);
    });

    it('uses the same HTML and image precedence for ClipboardItem and legacy paste', async () => {
        const { injector, service } = createTestContext();
        selectCell(injector);
        const pastedCells: string[] = [];
        const pastedFiles: string[] = [];
        const target = service.capturePasteTarget();

        service.addClipboardHook({
            id: 'html-image-precedence',
            onPasteCells() {
                pastedCells.push('html');
                return { redos: [], undos: [] };
            },
            onPasteFiles(_payload: unknown, files: File[]) {
                pastedFiles.push(files[0].name);
                return { redos: [], undos: [] };
            },
        } as never);

        const tableHTML = '<table><tbody><tr><td>North</td><td>South</td></tr></tbody></table>';
        const preview = new File(['preview'], 'preview.png', { type: 'image/png' });
        const tableItem = new MockClipboardItem({
            'text/html': tableHTML,
            'image/png': 'preview',
        });

        expect(await service.paste(tableItem as unknown as ClipboardItem, PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE, target)).toBe(true);
        expect(await service.legacyPaste(tableHTML, undefined, [preview], undefined, target)).toBe(true);
        expect(pastedCells).toEqual(['html', 'html']);
        expect(pastedFiles).toEqual([]);

        const imageHTML = '<img src="data:image/png;base64,cHJldmlldw==">';
        const imageItem = new MockClipboardItem({
            'text/html': imageHTML,
            'image/png': 'preview',
        });

        expect(await service.paste(imageItem as unknown as ClipboardItem, PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE, target)).toBe(true);
        expect(await service.legacyPaste(imageHTML, undefined, [preview], undefined, target)).toBe(true);
        expect(pastedCells).toEqual(['html', 'html']);
        expect(pastedFiles).toEqual(['clipboard-image.png', 'preview.png']);
    });

    it('routes formula clipboard payload to structured paste before html fallback', async () => {
        const { injector, service } = createTestContext();
        selectCell(injector, 5, 6);
        const pasted: Array<{ pasteFrom: ITestDiscreteRange | undefined; formula: string | undefined }> = [];

        service.addClipboardHook({
            id: 'formula-payload-paste',
            onPasteCells(pasteFrom: { range: ITestDiscreteRange } | null, _pasteTo: unknown, data: ObjectMatrix<ITestCell>) {
                pasted.push({
                    pasteFrom: pasteFrom?.range,
                    formula: data.getValue(0, 0)?.f,
                });
                return { redos: [], undos: [] };
            },
        } as never);

        const formulaItem = new MockClipboardItem({
            'web application/x-univer-sheets-formula': JSON.stringify({
                rowCount: 1,
                columnCount: 1,
                origin: {
                    row: 1,
                    column: 2,
                },
                formulas: [
                    {
                        row: 0,
                        column: 0,
                        f: '=A1+B1',
                    },
                ],
            }),
            'text/html': '<table><tbody><tr><td>html fallback</td></tr></tbody></table>',
        });

        expect(await service.paste(formulaItem as unknown as ClipboardItem)).toBe(true);
        expect(pasted).toEqual([{
            pasteFrom: {
                rows: [1],
                cols: [2],
            },
            formula: '=A1+B1',
        }]);
    });

    it('falls back to html paste when formula clipboard payload is invalid', async () => {
        const { injector, service } = createTestContext();
        selectCell(injector);
        const pastedHtml: string[] = [];

        service.addClipboardHook({
            id: 'html-fallback-paste',
            onPasteCells() {
                pastedHtml.push('html');
                return { redos: [], undos: [] };
            },
        } as never);

        const formulaItem = new MockClipboardItem({
            'web application/x-univer-sheets-formula': '{invalid',
            'text/html': '<table><tbody><tr><td>html fallback</td></tr></tbody></table>',
        });

        expect(await service.paste(formulaItem as unknown as ClipboardItem)).toBe(true);
        expect(pastedHtml).toEqual(['html']);
    });

    it('returns false when a clipboard item has no usable sheet content', async () => {
        const service = createService();
        const emptyItem = new MockClipboardItem({});

        expect(await service.paste(emptyItem as unknown as ClipboardItem)).toBe(false);
    });

    it('returns false when internal paste and repaste have no cached business content', async () => {
        const service = createService();

        expect(await service.pasteByCopyId('missing-copy-id')).toBe(false);
        expect(service.rePasteWithPasteType('SPECIAL_PASTE_VALUE')).toBe(false);
    });

    it('lets a special copy hook provide business-only cell values', () => {
        const service = createService();
        const lifecycle: string[] = [];

        service.addClipboardHook({
            id: PREDEFINED_HOOK_NAME_COPY.SPECIAL_COPY_FORMULA_ONLY,
            onBeforeCopy() {
                lifecycle.push('before');
            },
            getCellValueBySpecialMatrix() {
                return {
                    v: '=SUM(A1:A4)',
                    displayV: 'Projected revenue',
                };
            },
            onAfterCopy() {
                lifecycle.push('after');
            },
        } as never);

        const copyContent = service.generateCopyContent('unit-1', 'sheet-1', {
            startRow: 0,
            startColumn: 0,
            endRow: 0,
            endColumn: 0,
        }, { copyHookType: PREDEFINED_HOOK_NAME_COPY.SPECIAL_COPY_FORMULA_ONLY });

        expect(copyContent?.plain).toBe('Projected revenue');
        expect(copyContent?.matrixFragment.getValue(0, 0)?.v).toBe('=SUM(A1:A4)');
        expect(lifecycle).toEqual(['before', 'after']);
    });

    it('does not copy or mark cell data when a copy hook handles a focused object', async () => {
        const { injector, service } = createTestContext();
        selectCell(injector);
        const workbook = injector.get(IUniverInstanceService).getUnit<Workbook>('unit-1');
        const worksheet = workbook!.getSheetBySheetId('sheet-1')!;
        const getMatrixWithMergedCells = vi.spyOn(worksheet, 'getMatrixWithMergedCells');
        const addCopyMark = vi.spyOn(injector.get(IMarkSelectionService), 'addShape');
        const cellBeforeCopy = vi.fn();

        service.addClipboardHook({
            id: 'focused-object-copy',
            onBeforeCopyFocusedObject() {
                return true;
            },
        } as never);
        service.addClipboardHook({ id: 'cell-feature-copy', onBeforeCopy: cellBeforeCopy } as never);

        expect(await service.copy()).toBe(true);

        const clipboard = injector.get(IClipboardInterfaceService) as unknown as TestClipboardInterfaceService;
        const copied = clipboard.writes[0];
        const copyId = copied.html.match(/data-copy-id="([^"]+)"/)?.[1];
        const cachedCopy = copyId ? service.copyContentCache().get(copyId) : undefined;

        expect(getMatrixWithMergedCells).not.toHaveBeenCalled();
        expect(cellBeforeCopy).not.toHaveBeenCalled();
        expect(addCopyMark).not.toHaveBeenCalled();
        expect(copied.text).toBe('');
        expect(copied.html).not.toContain('Quarterly revenue');
        expect(cachedCopy?.matrix?.getValue(0, 0)?.v).toBeNull();
        expect(cachedCopy?.skipCellCopy).toBe(true);
    });

    it('keeps explicit range content generation independent from focused objects', () => {
        const service = createService();
        const focusedObjectBeforeCopy = vi.fn(() => true);
        const rangeBeforeCopy = vi.fn();
        service.addClipboardHook({
            id: 'focused-object-copy',
            onBeforeCopyFocusedObject: focusedObjectBeforeCopy,
            onBeforeCopy: rangeBeforeCopy,
        } as never);

        const copyContent = service.generateCopyContent('unit-1', 'sheet-1', {
            startRow: 0,
            startColumn: 0,
            endRow: 0,
            endColumn: 0,
        });

        expect(copyContent?.plain).toBe('Quarterly revenue');
        expect(focusedObjectBeforeCopy).not.toHaveBeenCalled();
        expect(rangeBeforeCopy).toHaveBeenCalledOnce();
    });

    it('runs only the focused object hook when pasting an object-only copy', () => {
        const service = createService();
        const objectPaste = vi.fn(() => ({ redos: [], undos: [] }));
        const cellPaste = vi.fn(() => ({ redos: [], undos: [] }));
        const matrix = new ObjectMatrix<ITestCell>({ 0: { 0: {} } });

        service.addClipboardHook({
            id: 'focused-object-copy',
            onBeforeCopyFocusedObject: () => false,
            onPasteCells: objectPaste,
        } as never);
        service.addClipboardHook({ id: 'cell-feature-copy', onPasteCells: cellPaste } as never);

        (service as unknown as IPrivateClipboardServiceAccess)._pasteUSM(
            { cellMatrix: matrix, rowProperties: [], colProperties: [] },
            { unitId: 'unit-1', subUnitId: 'sheet-1', pastedRange: { rows: [0], cols: [0] } },
            PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE,
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0], cols: [0] },
                copyId: 'object-copy',
                copyType: COPY_TYPE.COPY,
                skipCellCopy: true,
            }
        );

        expect(objectPaste).toHaveBeenCalledOnce();
        expect(cellPaste).not.toHaveBeenCalled();
    });

    it('stops paste execution when a hook blocks the target range', async () => {
        const { injector, service } = createTestContext();
        selectCell(injector);
        const pasteResults: boolean[] = [];

        service.addClipboardHook({
            id: 'protected-range-paste',
            onBeforePaste() {
                return false;
            },
            onAfterPaste(result: boolean) {
                pasteResults.push(result);
            },
            onPastePlainText() {
                return { redos: [], undos: [] };
            },
        } as never);

        const textItem = new MockClipboardItem({ 'text/plain': 'Blocked update' });

        expect(await service.paste(textItem as unknown as ClipboardItem)).toBe(false);
        expect(pasteResults).toEqual([false]);
    });

    it('stops structured sheet paste when a hook blocks the computed range', () => {
        const service = createService();
        const matrix = new ObjectMatrix<ITestCell>();
        const pasteResults: boolean[] = [];
        matrix.setValue(0, 0, { v: 'Blocked matrix' });

        service.addClipboardHook({
            id: 'structured-protection',
            onBeforePaste() {
                return false;
            },
            onAfterPaste(result: boolean) {
                pasteResults.push(result);
            },
        } as never);

        const pasted = (service as unknown as IPrivateClipboardServiceAccess)._pasteUSM(
            {
                cellMatrix: matrix,
                rowProperties: [],
                colProperties: [],
            },
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                pastedRange: {
                    rows: [0],
                    cols: [0],
                },
            },
            PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE
        );

        expect(pasted).toBe(false);
        expect(pasteResults).toEqual([false]);
    });

    it('computes pasted target ranges when a one-cell source fills a business selection', () => {
        const { injector, service } = createTestContext();
        selectCell(injector, 3, 3);
        const matrix = new ObjectMatrix<ITestCell>();
        matrix.setValue(0, 0, { v: 'Region total' });

        const target = (service as unknown as IPrivateClipboardServiceAccess)._transformPastedData(1, 1, matrix);

        expect(target).toMatchObject({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            pastedRange: {
                rows: [3],
                cols: [3],
            },
        });
        expect(matrix.getValue(0, 0)?.v).toBe('Region total');
    });

    it('keeps a single pasted cell inside an existing merged target and strips source span styling', () => {
        const { injector, service } = createTestContext();
        selectRange(injector, 1, 1, 2, 2);
        const matrix = new ObjectMatrix<ITestCell>();
        matrix.setValue(0, 0, {
            v: 'Merged-region note',
            s: { bl: 1 },
            rowSpan: 2,
            colSpan: 2,
        });

        const target = (service as unknown as IPrivateClipboardServiceAccess)._transformPastedData(1, 1, matrix);

        expect(target?.pastedRange).toEqual({
            rows: [1, 2],
            cols: [1, 2],
        });
        expect(matrix.getValue(0, 0)).toMatchObject({
            v: 'Merged-region note',
            s: null,
        });
        expect(matrix.getValue(0, 0)?.rowSpan).toBeUndefined();
        expect(matrix.getValue(0, 0)?.colSpan).toBeUndefined();
    });

    it('expands paste rows and columns beyond the current selection when pasted data is larger', () => {
        const service = createService();

        const range = (service as unknown as IPrivateClipboardServiceAccess)._expandOrShrinkRowsCols(
            'unit-1',
            'sheet-1',
            { rows: [4], cols: [2] },
            3,
            2
        );

        expect(range).toEqual({
            rows: [4, 5],
            cols: [2, 3, 4],
        });
    });

    it('expands the primary selection when default paste creates a merged cell', () => {
        const service = createService();
        const matrix = new ObjectMatrix<ITestCell>();
        matrix.setValue(0, 0, { v: 'Merged header', rowSpan: 2, colSpan: 2 });

        const operation = (service as unknown as IPrivateClipboardServiceAccess)._getSetSelectionOperation(
            'unit-1',
            'sheet-1',
            { rows: [6, 7], cols: [1, 2] },
            matrix,
            PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE
        );

        expect(operation.params.selections[0].primary).toMatchObject({
            startRow: 6,
            endRow: 7,
            startColumn: 1,
            endColumn: 2,
            isMerged: true,
            isMergedMainCell: true,
        });
    });

    it('detects whether the top-left paste target crosses existing merged cells', () => {
        const service = createService();
        const access = service as unknown as IPrivateClipboardServiceAccess;

        expect(access._topLeftCellsMatch(1, 2, { topRow: 1, leftCol: 1 })).toBe(false);
        expect(access._topLeftCellsMatch(1, 1, { topRow: 5, leftCol: 5 })).toBe(true);
    });
});
