import { SelectionManagerService } from '@univerjs/base-sheets';
import { IClipboardInterfaceService } from '@univerjs/base-ui';
import { Disposable, ICellData, ICurrentUniverService, ILogService, ObjectMatrix, toDisposable } from '@univerjs/core';
import { createIdentifier, IDisposable, Inject } from '@wendellhu/redi';

export interface IClipboardPropertyItem {
    [key: string]: string;
}

/**
 * ClipboardHook could:
 * 1. Before copy/cut/paste, decide whether to execute the command and prepare caches if necessary.
 * 1. When copying, decide what content could be written into clipboard.
 * 1. When pasting, get access to the clipboard content and append mutations to the paste command.
 */
export interface ISheetClipboardHook {
    onBeforeCopy?(): void;
    onBeforeCut?(): void;
    onBeforePaste?(): void;

    onGetContent(row: number, col: number): string;

    /**
     * Properties that would be appended to the td element.
     * @param row row of the the copied cell
     * @param col col of the the copied cell
     */
    onCopy?(row: number, col: number, rowSpan?: number, colSpan?: number): IClipboardPropertyItem | null;
    onCut?(row: number, col: number): IClipboardPropertyItem | null;
    onPaste?(row: number, col: number): void;

    onCopyRow?(row: number): IClipboardPropertyItem | null;
    onCutRow?(row: number): IClipboardPropertyItem | null;
    onPasteRow?(row: number): void;

    onCopyColumn?(col: number): IClipboardPropertyItem | null;
    onCutColumn?(row: number): IClipboardPropertyItem | null;
    onPasteColumn?(row: number): void;

    onAfterCopy?(): void;
    onAfterCut?(): void;
    onAfterPaste?(): void;

    getFilteredOutRows?(): number[];
}

/**
 * This service provide hooks for sheet features to supplement content or modify behavior of clipboard.
 */
export interface ISheetClipboardService {
    copy(): Promise<boolean>;
    cut(): Promise<boolean>;
    paste(): Promise<boolean>;

    addClipboardHook(hook: ISheetClipboardHook): IDisposable;
}

export const ISheetClipboardService = createIdentifier<ISheetClipboardService>('sheet.clipboard-service');

export class SheetClipboardService extends Disposable implements ISheetClipboardService {
    private _clipboardHooks: ISheetClipboardHook[] = [];

    constructor(
        @ILogService private readonly _logService: ILogService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IClipboardInterfaceService private readonly _clipboardInterfaceService: IClipboardInterfaceService
    ) {
        super();
    }

    async copy(): Promise<boolean> {
        // 1. get the selected range, the range should be the last one of selected ranges
        const selection = this._selectionManagerService.getLast();
        if (!selection) {
            return false; // maybe we should notify user that there is no selection
        }

        // 2. get filtered out rows those are filtered out by plugins (e.g. filter feature)
        const hooks = this._clipboardHooks;
        const filteredRows = hooks.reduce((acc, cur) => {
            const rows = cur.getFilteredOutRows?.();
            rows?.forEach((r) => acc.add(r));
            return acc;
        }, new Set<number>());

        // 3. calculate selection matrix, span cells would only - maybe warn uses that cells are too may in the future
        const { startColumn, startRow, endColumn, endRow } = selection.rangeData;
        const worksheet = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
        const matrix = worksheet.getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn);

        // 4. use filteredRows into to remove rows for the matrix
        // TODO: filtering

        // tell hooks to get ready for copying
        hooks.forEach((h) => h.onBeforeCopy?.());

        // 5. generate html and pure text contents by calling all clipboard hooks
        // col styles
        const colStyles = getColStyle(getArrayFromTo(startColumn, endColumn), hooks);
        // row styles and table contents
        const rowContents: string[] = [];
        matrix.forRow((row, cols) => {
            // TODO: cols here should filtered out those in span cells
            rowContents.push(getRowContent(row, cols, hooks, matrix));
        });
        // final result
        const html = `<google-sheets-html-origin><style type="text/css"><!--td {border: 1px solid #cccccc;}br {mso-data-placement:same-cell;}--></style><table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" border="1" style="table-layout:fixed;font-size:10pt;font-family:Arial;width:0px;border-collapse:collapse;border:none">${colStyles}<tbody>${rowContents.join(
            ''
        )}</tbody></table>`;

        // 6. write html and maybe plain text info the clipboard interface
        await this._clipboardInterfaceService.write('table', html);

        // tell hooks to clean up
        hooks.forEach((h) => h.onAfterCopy?.());

        return true;
    }

    async cut(): Promise<boolean> {
        return true;
    }

    async paste(): Promise<boolean> {
        return true;
    }

    addClipboardHook(hook: ISheetClipboardHook): IDisposable {
        this._clipboardHooks.push(hook);

        return toDisposable(() => {
            const index = this._clipboardHooks.indexOf(hook);
            if (index > -1) {
                this._clipboardHooks.splice(index, 1);
            }
        });
    }

    getCellContentClipboardHooks(): Readonly<ISheetClipboardHook[]> {
        return this._clipboardHooks.slice();
    }
}

/**
 *
 * @param matrix
 * @param cols
 * @param hooks
 */
export function getTableContent(matrix: number[][], cols: number[], hooks: ISheetClipboardHook[]) {}

export function getSingleCellContent() {}

/**
 * Get content of a single td element.
 * @param row index of the copied cell
 * @param col index of the copied cell
 * @returns
 */
function getTDContent(
    row: number,
    col: number,
    hooks: ISheetClipboardHook[],
    matrix: ObjectMatrix<ICellData & { rowSpan?: number; colSpan?: number }>
) {
    const v = matrix.getValue(row, col);
    const properties = hooks
        .map((hook) => hook.onCopy?.(row, col, v?.rowSpan, v?.colSpan))
        .filter((v) => !!v) as IClipboardPropertyItem[];
    const mergedProperties = mergeProperties(properties);
    const str = zipClipboardPropertyItemToString(mergedProperties);
    const content = hooks.reduce((acc, hook) => acc || hook.onGetContent?.(row, col) || '', '');
    return `<td${str}>${content}</td>`;
}

/**
 *
 * @param row index of the copied row
 * @param cols
 * @param hooks
 * @returns
 */
function getRowContent(
    row: number,
    cols: number[],
    hooks: ISheetClipboardHook[],
    matrix: ObjectMatrix<ICellData & { rowSpan?: number; colSpan?: number }>
) {
    const properties = hooks.map((hook) => hook.onCopyRow?.(row)).filter((v) => !!v) as IClipboardPropertyItem[];
    const mergedProperties = mergeProperties(properties);
    const str = zipClipboardPropertyItemToString(mergedProperties);
    const tds = cols
        .map((col) => getTDContent(row, col, hooks, matrix))
        .filter((v) => !!v)
        .join('');

    return `<tr${str}>${tds}</tr>`;
}

function getColStyle(cols: number[], hooks: ISheetClipboardHook[]) {
    const str = cols
        .map((col) => {
            const properties = hooks
                .map((hook) => hook.onCopyColumn?.(col))
                .filter((v) => !!v) as IClipboardPropertyItem[];
            const mergedProperties = mergeProperties(properties);
            const str = zipClipboardPropertyItemToString(mergedProperties);
            return `<col ${str}>`;
        })
        .join('');

    return `<colgroup>${str}</colgroup>`;
}

function mergeProperties(properties: IClipboardPropertyItem[]): IClipboardPropertyItem {
    return properties.reduce((acc, cur) => {
        const keys = Object.keys(cur);
        keys.forEach((key) => {
            if (!acc[key]) {
                acc[key] = cur[key];
            } else {
                acc[key] += `;${cur[key]}`;
            }
        });
        return acc;
    }, {});
}

function zipClipboardPropertyItemToString(item: IClipboardPropertyItem) {
    return Object.keys(item).reduce((acc, cur) => {
        acc += ` ${cur}="${item[cur]}"`;
        return acc;
    }, '');
}

function getArrayFromTo(f: number, to: number): number[] {
    const arr: number[] = [];
    for (let i = f; i <= to; i++) {
        arr.push(i);
    }
    return arr;
}
