/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICellData, IDocumentData, IMutationInfo, IRange, ObjectMatrix } from '@univerjs/core';
import type { IDiscreteRange } from '../../controllers/utils/range-tools';

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

export interface IParsedCellValueByClipboard {
    rowSpan?: number;
    colSpan?: number;
    style?: string;
    content?: string;
    richTextParma?: {
        p?: IDocumentData;
        v?: string;
    };

}

export interface IUniverSheetCopyDataModel {
    rowProperties?: IClipboardPropertyItem[];
    colProperties?: IClipboardPropertyItem[] | null;
    cellMatrix: ObjectMatrix<ICellDataWithSpanInfo>;
}

export interface IPasteTarget {
    pastedRange: IDiscreteRange;
    subUnitId: string;
    unitId: string;
}

export interface ICopyPastePayload {
    copyType?: COPY_TYPE;
    copyId?: string;
    pasteType: string;
}

export interface ISheetRangeLocation {
    range: IRange;
    subUnitId: string;
    unitId: string;
}

export interface ISheetDiscreteRangeLocation {
    range: IDiscreteRange;
    subUnitId: string;
    unitId: string;
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
    id: string;
    isDefaultHook?: boolean;
    specialPasteInfo?: ISpecialPasteInfo; // only special paste info should be provided, which will replace the default hook.
    priority?: number;

    /**
     * The callback would be called after the clipboard service has decided what region need to be copied.
     * Features could use this hook to build copying cache or any other pre-copy jobs.
     */
    onBeforeCopy?(unitId: string, subUnitId: string, range: IRange): void;
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
    onBeforePaste?(pasteTo: ISheetDiscreteRangeLocation): boolean;
    /**
     *
     * @param row
     * @param col
     */
    onPasteCells?(
        pasteFrom: ISheetDiscreteRangeLocation | null,
        pasteTo: ISheetDiscreteRangeLocation,
        data: ObjectMatrix<ICellDataWithSpanInfo>,
        payload: ICopyPastePayload
    ): {
        undos: IMutationInfo[];
        redos: IMutationInfo[];
    };
    onPasteRows?(
        pasteTo: ISheetDiscreteRangeLocation,
        rowProperties: IClipboardPropertyItem[],
        payload: ICopyPastePayload
    ): {
        undos: IMutationInfo[];
        redos: IMutationInfo[];
    };
    onPasteColumns?(
        pasteTo: ISheetDiscreteRangeLocation,
        colProperties: IClipboardPropertyItem[],
        payload: ICopyPastePayload
    ): {
        undos: IMutationInfo[];
        redos: IMutationInfo[];
    };
    onPastePlainText?(
        pasteTo: ISheetDiscreteRangeLocation,
        text: string,
        payload: ICopyPastePayload
    ): {
        undos: IMutationInfo[];
        redos: IMutationInfo[];
    };
    onAfterPaste?(success: boolean): void;

    /**
     * The callback would be called before the clipboard service decides what region need to be copied from or pasted to.
     * It would jump over these filtered rows when copying or pasting.
     */
    getFilteredOutRows?(range: IRange): number[];
}
