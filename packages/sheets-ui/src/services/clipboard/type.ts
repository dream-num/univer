import type { ICellData, IMutationInfo, IRange, ObjectMatrix } from '@univerjs/core';

export enum COPY_TYPE {
    COPY = 'COPY',
    CUT = 'CUT',
}

export type ICellDataWithSpanInfo = ICellData & { rowSpan?: number; colSpan?: number };

export interface IClipboardPropertyItem {
    [key: string]: string;
}

export interface IParsedCellValue {
    rowSpan?: number;
    colSpan?: number;
    properties?: IClipboardPropertyItem;
    content: string;
}

export interface IUniverSheetCopyDataModel {
    rowProperties?: IClipboardPropertyItem[];
    colProperties?: IClipboardPropertyItem[] | null;
    cellMatrix: ObjectMatrix<ICellDataWithSpanInfo>;
}

export interface IPasteTarget {
    pastedRange: IRange;
    worksheetId: string;
    workbookId: string;
}

export interface IPasteSource {
    copyId: string;
    worksheetId: string;
    workbookId: string;
    range: IRange;
    copyType: COPY_TYPE;
}

export interface ISpecialPasteInfo {
    label: string;
    icon?: string;
}
/**
 * `ClipboardHook` could:
 * 1. Before copy/cut/paste, decide whether to execute the command and prepare caches if necessary.
 * 1. When copying, decide what content could be written into clipboard.
 * 1. When pasting, get access to the clipboard content and append mutations to the paste command.
 */
export interface ISheetClipboardHook {
    hookName: string;
    isDefaultHook?: boolean;
    specialPasteInfo?: ISpecialPasteInfo; // only special paste info should be provided, which will replace the default hook.
    priority?: number;

    /**
     * The callback would be called after the clipboard service has decided what region need to be copied.
     * Features could use this hook to build copying cache or any other pre-copy jobs.
     */
    onBeforeCopy?(workbookId: string, worksheetId: string, range: IRange): void;
    /**
     *
     * @param row
     * @param col
     * @return content
     */
    onCopyCellContent?(row: number, col: number): string;
    /**
     * Properties that would be appended to the td element.
     *
     * @deprecated should be merged with `onCopyCellContent` to `onCopyCell`
     * @param row row of the the copied cell
     * @param col col of the the copied cell
     */
    onCopyCellStyle?(row: number, col: number, rowSpan?: number, colSpan?: number): IClipboardPropertyItem | null;
    /**
     * Properties that would be appended to the tr element.
     * @param row each row of the the copied range
     */
    onCopyRow?(row: number): IClipboardPropertyItem | null;
    /**
     * Properties that would be appended to the col element.
     * @param col each col of the copied range
     */
    onCopyColumn?(col: number): IClipboardPropertyItem | null;
    /**
     * Would be called after copy content has been written into clipboard.
     * Features could do some cleaning up jobs here.
     */
    onAfterCopy?(): void;

    // We do not need cut hooks. We could just use copy hooks to do the same thing,
    // and tell paste hooks that the source is from a cut command.

    // Unlike copy hooks, paste hooks would be called **only once each** because features would do batch mutations.

    /**
     * The callback would be called after the clipboard service has decided what region need to be pasted.
     * Features could use this hook to build copying cache or any other pre-copy jobs.
     *
     * @returns if it block copying it should return false
     */
    onBeforePaste?(workbookId: string, worksheetId: string, range: IRange): boolean;
    /**
     *
     * @param row
     * @param col
     */
    onPasteCells?(
        pastedRange: IRange,
        matrix: ObjectMatrix<ICellDataWithSpanInfo>,
        pasteType: string,
        copyInfo: {
            copyType: COPY_TYPE;
            copyRange?: IRange;
            worksheetId?: string;
            workbookId?: string;
        }
    ): {
        undos: IMutationInfo[];
        redos: IMutationInfo[];
    };
    onPasteRows?(
        range: IRange,
        rowProperties: IClipboardPropertyItem[],
        pasteType: string
    ): {
        undos: IMutationInfo[];
        redos: IMutationInfo[];
    };
    onPasteColumns?(
        range: IRange,
        colProperties: IClipboardPropertyItem[],
        pasteType: string
    ): {
        undos: IMutationInfo[];
        redos: IMutationInfo[];
    };
    onAfterPaste?(success: boolean): void;

    /**
     * The callback would be called before the clipboard service decides what region need to be copied from or pasted to.
     * It would jump over these filtered rows when copying or pasting.
     */
    getFilteredOutRows?(): number[];
}
