import { ObjectMatrix } from '../../Shared/ObjectMatrix';
import { ISetRangeDataActionData } from '../../Types/Interfaces/IActionModel';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';
import { ICellData } from '../../Types/Interfaces/ICellData';
import { Tools } from '../../Shared/Tools';
import { IBorderData, IStyleData } from '../../Types/Interfaces/IStyleData';
import { IKeyValue, Nullable } from '../../Shared/Types';
import { IDocumentData, ITextStyle } from '../../Types/Interfaces';

export function SetRangeDataApply(spreadsheetModel: SpreadsheetModel, data: ISetRangeDataActionData) {
    const worksheet = spreadsheetModel.worksheets[data.sheetId];
    const cellMatrix = worksheet.cell;
    const addMatrix = data.cellValue;

    const target = new ObjectMatrix(addMatrix);
    const result = new ObjectMatrix<ICellData>();

    target.forValue((r, c, value) => {
        const cell = cellMatrix.getValue(r, c) || {};

        // set null, clear cell
        if (!value) {
            cellMatrix.setValue(r, c, value);
            result.setValue(r, c, cell);
        } else {
            // update style

            // use null to clear style
            const old = worksheet.getStyleByCell(cell);

            // store old data
            const oldCellStyle = transformStyle(old, value?.s as Nullable<IStyleData>);
            const oldCellData = Tools.deepClone(cell);
            oldCellData.s = oldCellStyle;

            result.setValue(r, c, oldCellData);

            if (old == null) {
                // clear
                delete cell.s;
            }

            // set style
            const merge = mergeStyle(old, value?.s as Nullable<IStyleData>);

            // then remove null
            merge && Tools.removeNull(merge);

            if (Tools.isEmptyObject(merge)) {
                delete cell.s;
            } else {
                cell.s = worksheet.setStyleValue(merge);
            }

            // update other value TODO: move
            if (value.p != null) {
                cell.p = value.p;
            }
            if (value.v != null) {
                cell.v = value.v;
            }
            if (value.m != null) {
                cell.m = value.m;
            } else {
                cell.m = String(cell.v);
            }
            if (value.t != null) {
                cell.t = value.t;
            }

            cellMatrix.setValue(r, c, cell);
        }
    });
    return result.getData();
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
export function transformNormalKey(oldStyle: Nullable<IStyleData>, newStyle: Nullable<IStyleData>): Nullable<IStyleData> {
    // If there is no newly set style, directly store the historical style
    if (!newStyle || !Object.keys(newStyle).length) {
        return oldStyle;
    }
    const backupStyle = Tools.deepClone(oldStyle) || {};

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
export function mergeStyle(oldStyle: Nullable<IStyleData>, newStyle: Nullable<IStyleData>, isRichText: boolean = false): Nullable<IStyleData> {
    // clear style
    if (newStyle === null) return newStyle;
    // don't operate
    if (newStyle === undefined) return oldStyle;

    const backupStyle = Tools.deepClone(oldStyle) || {};

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
                    backupStyle[k].cl = backupStyle.cl;
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
