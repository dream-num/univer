import { ITextStyle } from '../../Interfaces/IDocumentData';
import { Styles } from '../Domain';
import { IRangeData, ICellData, IDocumentData, ITextRun } from '../../Interfaces';
import { IBorderData, IStyleData } from '../../Interfaces/IStyleData';
import {
    Nullable,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Tools,
} from '../../Shared';

/**
 * Set the style. The style sent by the user will be merged into the original style object. If you want to delete a style, you need to explicitly set it to null
 * @param param0
 * @returns
 *cellMatrix: ,
    addMatrix: ,
    rangeData: IRangeData
 * @internal
 */
export function SetRangeStyle(
    cellMatrix: ObjectMatrix<ICellData>,
    value: ObjectMatrixPrimitiveType<IStyleData>,
    rangeData: IRangeData,
    styles: Styles
): ObjectMatrixPrimitiveType<IStyleData> {
    const { startRow, endRow, startColumn, endColumn } = rangeData;
    const result = new ObjectMatrix<IStyleData>();
    for (let r = startRow; r <= endRow; r++) {
        const rowResult = [];
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
                value[r - startRow][c - startColumn] as Nullable<IStyleData>
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
                    value[r - startRow][c - startColumn] as Nullable<IStyleData>
                );
            }

            cellMatrix.setValue(r, c, cell);

            // store old data
            result.setValue(
                r - startRow,
                c - startColumn,
                transformStyle(
                    old,
                    value[r - startRow][c - startColumn] as Nullable<IStyleData>
                )
            );
        }

        // result.push(rowResult);
    }
    return result.getData();
}

/**
 * Convert old style data for storage
 * @param style
 */
export function transformStyle(
    oldStyle: Nullable<IStyleData>,
    newStyle: Nullable<IStyleData>
): Nullable<IStyleData> {
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
export function transformBorders(
    oldBorders: IBorderData,
    newBorders: Nullable<IBorderData>
): IBorderData {
    // If there is no newly set border, directly store the historical border
    if (!newBorders || !Object.keys(newBorders).length) {
        return oldBorders;
    }

    for (const k in newBorders) {
        // 1. To modify the existing border,we need original setting to undo
        // 2. Newly set the border, we need null to undo
        if (!(k in oldBorders)) {
            oldBorders[k] = null;
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

    const backupStyle = Tools.deepClone(oldStyle) || {};

    for (const k in newStyle) {
        if (isRichText && ['bd', 'tr', 'td', 'ht', 'vt', 'tb', 'pd'].includes(k)) {
            continue;
        }
        // you can only choose one of the themeColor and rgbColor of the border setting
        if (k in backupStyle && k === 'bd') {
            backupStyle[k] = Object.assign(backupStyle[k], newStyle[k]);
        } else {
            backupStyle[k] = newStyle[k];

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
export function mergeRichTextStyle(
    p: IDocumentData,
    newStyle: Nullable<IStyleData>
) {
    p.body?.blockElementOrder.forEach((blockId) => {
        if (p.body?.blockElements[blockId].blockType === 0) {
            const paragraph = p.body?.blockElements[blockId].paragraph;
            paragraph?.elementOrder.forEach(
                ({ elementId, paragraphElementType }) => {
                    if (!paragraph.elements[elementId].tr) {
                        paragraph.elements[elementId].tr = {};
                    }

                    const textRun = paragraph.elements[elementId].tr as ITextRun;

                    if (!textRun.ts) {
                        textRun.ts = {};
                    }

                    const oldStyle = textRun.ts;

                    const merge = mergeStyle(
                        oldStyle as Nullable<IStyleData>,
                        newStyle,
                        true
                    );

                    // then remove null
                    merge && Tools.removeNull(merge);

                    if (Tools.isEmptyObject(merge)) {
                        delete textRun.ts;
                    } else {
                        textRun.ts = merge as ITextStyle;
                    }
                }
            );
        }
    });
}
