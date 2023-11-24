import {
    CellValueType,
    CommandType,
    IBorderData,
    ICellData,
    ICellV,
    ICopyToOptionsData,
    IDocumentData,
    IKeyValue,
    IMutation,
    IRange,
    IStyleData,
    ITextStyle,
    IUniverInstanceService,
    Nullable,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

/** Params of `SetRangeValuesMutation` */
export interface ISetRangeValuesMutationParams {
    worksheetId: string;
    workbookId: string;

    /**
     * null for clear all
     */
    cellValue?: ObjectMatrixPrimitiveType<ICellData | null>;

    /**
     * @deprecated not a good design
     */
    options?: ICopyToOptionsData;

    /**
     * for formula calculate
     */
    isFormulaUpdate?: boolean;
}

export interface ISetRangeValuesRangeMutationParams extends ISetRangeValuesMutationParams {
    range: IRange[];
}

/**
 * Generate undo mutation of a `SetRangeValuesMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {ISetRangeValuesMutationParams} params - do mutation params
 * @returns {ISetRangeValuesMutationParams} undo mutation params
 */
export const SetRangeValuesUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetRangeValuesMutationParams
): ISetRangeValuesMutationParams => {
    const { workbookId, worksheetId, cellValue } = params;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getUniverSheetInstance(workbookId);

    if (workbook == null) {
        throw new Error('workbook is null error!');
    }

    const worksheet = workbook.getSheetBySheetId(worksheetId);
    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }

    const cellMatrix = worksheet.getCellMatrix();
    const styles = workbook.getStyles();
    const undoData = new ObjectMatrix<ICellData>();

    const newValues = new ObjectMatrix(cellValue);

    newValues.forValue((row, col, newVal) => {
        const cell = Tools.deepClone(cellMatrix?.getValue(row, col)) || {}; // clone cell data，prevent modify the original data
        const oldStyle = styles.getStyleByCell(cell);
        const newStyle = transformStyle(oldStyle, newVal && newVal.s ? (newVal.s as Nullable<IStyleData>) : null);

        cell.s = newStyle;

        undoData.setValue(row, col, setNull(cell));
    });

    return {
        ...Tools.deepClone(params),
        options: {},
        cellValue: undoData.getData(),
    } as ISetRangeValuesMutationParams;
};

/**
 * Supplement the data of the cell, set the other value to NULL, Used to reset properties when undoing
 * @param value
 * @returns
 */
function setNull(value: Nullable<ICellData>) {
    if (value == null) return null;

    if (value.f === undefined) {
        value.f = null;
    }

    if (value.si === undefined) {
        value.si = null;
    }

    if (value.p === undefined) {
        value.p = null;
    }

    if (value.v === undefined) {
        value.v = null;
    }

    if (value.m === undefined) {
        value.m = null;
    }

    if (value.t === undefined) {
        value.t = null;
    }

    if (value.s === undefined) {
        value.s = null;
    }

    return value;
}

export const SetRangeValuesMutation: IMutation<ISetRangeValuesMutationParams, boolean> = {
    id: 'sheet.mutation.set-range-values',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { cellValue, worksheetId, workbookId } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) {
            return false;
        }

        const cellMatrix = worksheet.getCellMatrix();
        const styles = workbook.getStyles();
        const newValues = new ObjectMatrix(cellValue);

        newValues.forValue((row, col, newVal) => {
            // clear all
            if (!newVal) {
                cellMatrix?.setValue(row, col, {});
            } else {
                const oldVal = cellMatrix.getValue(row, col) || {};
                const type = newVal.t ? newVal.t : checkCellValueType(newVal.v);

                if (newVal.f !== undefined) {
                    oldVal.f = newVal.f;
                }

                if (newVal.si !== undefined) {
                    oldVal.si = newVal.si;
                }

                if (newVal.p !== undefined) {
                    oldVal.p = newVal.p;
                }

                // Set to null, clear content
                if (newVal.v !== undefined) {
                    oldVal.v = type === CellValueType.NUMBER ? Number(newVal.v) : newVal.v;
                    oldVal.m = String(oldVal.v);
                }

                if (newVal.m !== undefined) {
                    oldVal.m = newVal.m;
                }

                if (newVal.t !== undefined) {
                    oldVal.t = newVal.t;
                } else if (oldVal.v !== undefined) {
                    oldVal.t = type;
                }

                // handle style
                if (newVal.s !== undefined) {
                    // use null to clear style
                    const oldStyle = styles.getStyleByCell(oldVal);

                    if (oldStyle == null) {
                        // clear
                        delete oldVal.s;
                    }

                    if (typeof newVal.s === 'string') {
                        newVal.s = styles.get(newVal.s);
                    }

                    // set style
                    const merge = mergeStyle(oldStyle, newVal.s ? (newVal.s as Nullable<IStyleData>) : null);

                    // then remove null
                    merge && Tools.removeNull(merge);

                    if (Tools.isEmptyObject(merge)) {
                        delete oldVal.s;
                    } else {
                        oldVal.s = styles.setValue(merge);
                    }

                    // When the rich text sets the cell style, you need to modify the style of all rich text
                    if (oldVal.p) {
                        mergeRichTextStyle(oldVal.p, newVal.s ? (newVal.s as Nullable<IStyleData>) : null);
                    }
                }

                cellMatrix.setValue(row, col, Tools.removeNull(oldVal));
            }
        });

        return true;
    },
};

function checkCellValueType(v: Nullable<ICellV>): Nullable<CellValueType> {
    if (v === null) return null;

    if (typeof v === 'string') {
        if (isNumeric(v)) {
            return CellValueType.NUMBER;
        }
        return CellValueType.STRING;
    }
    if (typeof v === 'number') {
        return CellValueType.NUMBER;
    }
    if (typeof v === 'boolean') {
        return CellValueType.BOOLEAN;
    }
    return CellValueType.FORCE_STRING;
}

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
        }
    }

    // Overline/Strikethrough/Underline color follows text color
    // if ('cl' in backupStyle) {
    //     for (const k in newStyle) {
    //         if (['ul', 'ol', 'st'].includes(k)) {
    //             backupStyle[k].cl = backupStyle.cl;
    //         }
    //     }
    // }

    if ('cl' in backupStyle) {
        if ('ul' in backupStyle) {
            backupStyle.ul.cl = backupStyle.cl;
        }

        if ('ol' in backupStyle) {
            backupStyle.ol.cl = backupStyle.cl;
        }

        if ('st' in backupStyle) {
            backupStyle.st.cl = backupStyle.cl;
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

function isNumeric(str: string) {
    return /^-?\d+(\.\d+)?$/.test(str);
}
