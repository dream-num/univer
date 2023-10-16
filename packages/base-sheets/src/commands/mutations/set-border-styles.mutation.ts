import {
    CommandType,
    IBorderData,
    IDocumentData,
    IKeyValue,
    IMutation,
    IStyleData,
    ITextStyle,
    IUniverInstanceService,
    Nullable,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetBorderStylesMutationParams {
    workbookId: string;
    worksheetId: string;
    value: ObjectMatrixPrimitiveType<IStyleData>;
}

/**
 * Generate undo mutation of a `SetRangeStyleMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {ISetRangeStyleMutationParams} params - do mutation params
 * @returns {ISetRangeStyleMutationParams} undo mutation params
 */
export const SetBorderStylesUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetBorderStylesMutationParams
): ISetBorderStylesMutationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();
    const worksheet = univerInstanceService
        .getCurrentUniverSheetInstance()

        .getSheetBySheetId(params.worksheetId);
    const cellMatrix = worksheet?.getCellMatrix();
    const styles = workbook.getStyles();
    const data = new ObjectMatrix(params.value);

    const undoData = new ObjectMatrix<IStyleData>();
    data.forValue((row: number, col: number, value: any) => {
        const cell = cellMatrix?.getValue(row, col) || {};
        const old = styles.getStyleByCell(cell);
        undoData.setValue(row, col, transformStyle(old, value as Nullable<IStyleData>));
    });

    return {
        ...Tools.deepClone(params),
        value: undoData.getData(),
    };
};

export const SetBorderStylesMutation: IMutation<ISetBorderStylesMutationParams, boolean> = {
    id: 'sheet.mutation.set-border-styles',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUniverSheetInstance(params.workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;

        const cellMatrix = worksheet.getCellMatrix();
        const styles = workbook.getStyles();

        const data = new ObjectMatrix(params.value);

        data.forValue((row: number, col: number, value: any) => {
            const cell = cellMatrix.getValue(row, col) || {};
            // use null to clear style
            const old = styles.getStyleByCell(cell);

            if (old == null) {
                // clear
                delete cell.s;
            }

            // set style
            const merge = mergeStyle(old, value as Nullable<IStyleData>);

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
                mergeRichTextStyle(cell.p, value as Nullable<IStyleData>);
            }

            cellMatrix.setValue(row, col, cell);
        });

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
