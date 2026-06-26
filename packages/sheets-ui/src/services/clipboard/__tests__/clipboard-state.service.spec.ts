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

import {
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    ErrorService,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocalUndoRedoService,
    ObjectMatrix,
    RANGE_TYPE,
    ThemeService,
    UniverInstanceService,
    Workbook,
} from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { SetSelectionsOperation, SetWorksheetActiveOperation, SheetSkeletonService, SheetsSelectionsService } from '@univerjs/sheets';
import {
    IClipboardInterfaceService,
    INotificationService,
    IPlatformService,
    PlatformService,
} from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IMarkSelectionService, MarkSelectionService } from '../../mark-selection/mark-selection.service';
import {
    ISheetClipboardService,
    PREDEFINED_HOOK_NAME_COPY,
    PREDEFINED_HOOK_NAME_PASTE,
    SheetClipboardService,
} from '../clipboard.service';
import { COPY_TYPE } from '../type';
import { MockClipboardItem } from './mock-clipboard';

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
        pasteType: string
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

function createTestContext() {
    vi.stubGlobal('navigator', { appVersion: 'Linux' });
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
    injector.add([ErrorService]);
    injector.add([ISheetClipboardService, { useClass: SheetClipboardService }]);
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

describe('SheetClipboardService', () => {
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

    it('writes formula clipboard payload for copyable formula cells', async () => {
        const { injector, service } = createTestContext();
        selectRange(injector, 1, 2, 2, 3);

        service.addClipboardHook({
            id: PREDEFINED_HOOK_NAME_COPY.SPECIAL_COPY_FORMULA_ONLY,
            onCopyCellContent(row: number, column: number) {
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
            onCopyCellContent(row: number, column: number) {
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
