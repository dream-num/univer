import {
    CommandType,
    IBorderData,
    ICurrentUniverService,
    IDocumentData,
    IKeyValue,
    IMutation,
    IRange,
    IStyleData,
    ITextStyle,
    Nullable,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetRangeStyleMutationParams {
    workbookId: string;
    worksheetId: string;
    range: IRange[];
    value?: ObjectMatrixPrimitiveType<IStyleData>;
}

/**
 * Generate undo mutation of a `SetRangeStyleMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {ISetRangeStyleMutationParams} params - do mutation params
 * @returns {ISetRangeStyleMutationParams} undo mutation params
 *
 */
export const SetRangeStyleUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetRangeStyleMutationParams
): ISetRangeStyleMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const workbook = currentUniverService.getCurrentUniverSheetInstance();
    const worksheet = currentUniverService
        .getCurrentUniverSheetInstance()

        .getSheetBySheetId(params.worksheetId);
    if (worksheet == null) {
        throw new Error('error');
    }
    const cellMatrix = worksheet.getCellMatrix();
    const styles = workbook.getStyles();

    const value = params.value ?? null;

    const undoData = new ObjectMatrix<IStyleData>();
    for (let i = 0; i < params.range.length; i++) {
        const { startRow, endRow, startColumn, endColumn } = params.range[i];
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const cell = cellMatrix.getValue(r, c) || {};
                const old = styles.getStyleByCell(cell);
                const test = transformStyle(
                    old,
                    value ? (value[r - startRow][c - startColumn] as Nullable<IStyleData>) : null
                );
                undoData.setValue(r - startRow, c - startColumn, test);
            }
        }
    }

    return {
        ...Tools.deepClone(params),
        value: undoData.getData(),
    } as ISetRangeStyleMutationParams;
};

/**
 * @deprecated use set range values mutation instead
 */
export const SetRangeStyleMutation: IMutation<ISetRangeStyleMutationParams, boolean> = {
    id: 'sheet.mutation.set-range-style',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getUniverSheetInstance(params.workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;

        const cellMatrix = worksheet.getCellMatrix();
        const styles = workbook.getStyles();
        const value = params.value ?? null;

        for (let i = 0; i < params.range.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = params.range[i];
            for (let r = startRow; r <= endRow; r++) {
                for (let c = startColumn; c <= endColumn; c++) {
                    const cell = cellMatrix.getValue(r, c) || {};
                    // use null to clear style
                    const old = styles.getStyleByCell(cell);

                    if (old == null) {
                        // clear
                        delete cell.s;
                    }

                    // set style
                    const merge = mergeStyle(
                        old,
                        value ? (value[r - startRow][c - startColumn] as Nullable<IStyleData>) : null
                    );

                    // then remove null
                    merge && Tools.removeNull(merge);

                    if (Tools.isEmptyObject(merge)) {
                        delete cell.s;
                    } else {
                        cell.s = styles.setValue(merge);
                    }

                    // When the rich text sets the cell style, you need to modify the style of all rich text
                    // TODO redo/undo use setRangeData to undo rich text setting
                    if (cell.p) {
                        mergeRichTextStyle(
                            cell.p,
                            value ? (value[r - startRow][c - startColumn] as Nullable<IStyleData>) : null
                        );
                    }

                    cellMatrix.setValue(r, c, cell);
                }
            }
        }

        return true;
    },
};

/**
 * Convert old style data for storage
 * @param style
 */
export function transformStyle(oldStyle: Nullable<IStyleData>, newStyle: Nullable<IStyleData>): Nullable<IStyleData> {
    const backupStyle = transformNormalKey(oldStyle, newStyle);
    return backupStyle;
}
/**
 * Convert old style normal key for storage
 *
 * @param style
 */
export function transformNormalKey(
    oldStyle: Nullable<IStyleData>,
    newStyle: Nullable<IStyleData>
): Nullable<IStyleData> {
    // If there is no newly set style, directly store the historical style
    if (!newStyle || !Object.keys(newStyle).length) {
        return oldStyle;
    }
    const backupStyle: { [key: string]: any } = Tools.deepClone(oldStyle) || {};

    for (const k in newStyle) {
        if (k === 'bd') {
            backupStyle[k] = transformBorders(backupStyle[k] || {}, newStyle[k]);
        }
        // 1. To modify the existing style,we need original setting to undo
        // 2. Newly set the style, we need null to undo
        else if (!(k in backupStyle)) {
            backupStyle[k] = null;
        }
    }
    return backupStyle;
}
/**
 * Convert old style border for storage
 *

 * @param style
 */
export function transformBorders(oldBorders: IBorderData, newBorders: Nullable<IBorderData>): IBorderData {
    // If there is no newly set border, directly store the historical border
    if (!newBorders || !Object.keys(newBorders).length) {
        return oldBorders;
    }

    for (const k in newBorders) {
        // 1. To modify the existing border,we need original setting to undo
        // 2. Newly set the border, we need null to undo
        if (!(k in oldBorders)) {
            (oldBorders as IKeyValue)[k] = null;
        }
    }

    return oldBorders;
}

/**
 * merge new style to old style
 *
 * @param oldStyle
 * @param newStyle
 */
export function mergeStyle(
    oldStyle: Nullable<IStyleData>,
    newStyle: Nullable<IStyleData>,
    isRichText: boolean = false
): Nullable<IStyleData> {
    // clear style
    if (newStyle === null) return newStyle;
    // don't operate
    if (newStyle === undefined) return oldStyle;

    const backupStyle: { [key: string]: any } = Tools.deepClone(oldStyle) || {};
    if (!backupStyle) return;
    for (const k in newStyle) {
        if (isRichText && ['bd', 'tr', 'td', 'ht', 'vt', 'tb', 'pd'].includes(k)) {
            continue;
        }
        // you can only choose one of the themeColor and rgbColor of the border setting
        if (k in backupStyle && k === 'bd') {
            backupStyle[k] = Object.assign(backupStyle[k], newStyle[k]);
        } else {
            backupStyle[k] = (newStyle as IKeyValue)[k];

            // overline/strikethrough/underline add color
            if ('cl' in backupStyle) {
                if (['ul', 'ol', 'st'].includes(k)) {
                    if (backupStyle[k]) {
                        backupStyle[k].cl = backupStyle.cl;
                    }
                }
            }
        }
    }
    return backupStyle;
}

/**
 * Find the text style of all paragraphs and modify it to the new style
 * @param p
 * @param newStyle
 */
export function mergeRichTextStyle(p: IDocumentData, newStyle: Nullable<IStyleData>) {
    // p.body?.blockElements.forEach((blockElement) => {
    //     if (blockElement.blockType === 0) {
    //         const paragraph = blockElement.paragraph;
    //         paragraph?.elements.forEach((element) => {
    //             if (!element.tr) {
    //                 element.tr = {};
    //             }

    //             const textRun = element.tr as ITextRun;

    //             if (!textRun.ts) {
    //                 textRun.ts = {};
    //             }

    //             const oldStyle = textRun.ts;

    //             const merge = mergeStyle(
    //                 oldStyle as Nullable<IStyleData>,
    //                 newStyle,
    //                 true
    //             );

    //             // then remove null
    //             merge && Tools.removeNull(merge);

    //             if (Tools.isEmptyObject(merge)) {
    //                 delete textRun.ts;
    //             } else {
    //                 textRun.ts = merge as ITextStyle;
    //             }
    //         });
    //     }
    // });
    p.body?.textRuns?.forEach((textRun) => {
        if (!textRun.ts) {
            textRun.ts = {};
        }

        const oldStyle = textRun.ts || {};

        const merge = mergeStyle(oldStyle as Nullable<IStyleData>, newStyle, true);

        // then remove null
        merge && Tools.removeNull(merge);

        if (Tools.isEmptyObject(merge)) {
            delete textRun.ts;
        } else {
            textRun.ts = merge as ITextStyle;
        }
    });
}
