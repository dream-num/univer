import { Styles } from '../Domain';
import {
    ICellData,
    ICopyToOptionsData,
    IRangeData,
    IStyleData,
} from '../../Interfaces';
import { Nullable, Tools } from '../../Shared';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { mergeStyle, transformStyle } from './SetRangeStyle';

/**
 *
 * @param cellMatrix
 * @param addMatrix
 * @param rangeData
 * @param options
 * @returns
 *
 * @internal
 */
export function SetRangeData(
    cellMatrix: ObjectMatrix<ICellData>,
    addMatrix: ObjectMatrixPrimitiveType<ICellData> | ICellData,
    rangeData: IRangeData,
    styles: Styles,
    options?: ICopyToOptionsData
): ObjectMatrixPrimitiveType<ICellData> {
    let target;
    if (!isNaN(parseInt(Object.keys(addMatrix)[0]))) {
        target = new ObjectMatrix(addMatrix as ObjectMatrixPrimitiveType<ICellData>);
    }
    const result = new ObjectMatrix<ICellData>();

    const { startRow, endRow, startColumn, endColumn } = rangeData;

    if (options) {
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const value: Nullable<ICellData> = target
                    ? target.getValue(r, c)
                    : addMatrix;
                const cell = cellMatrix.getValue(r, c);
                const newCell: ICellData = {};

                if (options.contentsOnly) {
                    newCell.m = cell?.m;
                    newCell.v = cell?.v;
                }

                if (options.formatOnly) {
                    // newCell.f = cell?.f;
                    newCell.v = cell?.v;
                    newCell.m = cell?.m;
                }

                result.setValue(r, c, newCell || {});

                cellMatrix.setValue(r, c, value || {});
            }
        }
        return result.getData();
    }

    for (let r = startRow; r <= endRow; r++) {
        for (let c = startColumn; c <= endColumn; c++) {
            const value: Nullable<ICellData> = target
                ? target.getValue(r, c)
                : addMatrix;
            const cell = cellMatrix.getValue(r, c) || {};

            // set null, clear cell
            if (!value) {
                cellMatrix.setValue(r, c, value);
                result.setValue(r, c, cell);
                continue;
            }

            // update style

            // use null to clear style
            const old = cell.s ? styles.get(cell.s) : null;

            // store old data
            const oldCellStyle = transformStyle(
                old,
                value?.s as Nullable<IStyleData>
            );
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
                cell.s = styles.setValue(merge);
            }

            // update other value
            if (value.p) {
                cell.p = value.p;
            }
            if (value.v) {
                cell.v = value.v;
            }
            if (value.m) {
                cell.m = value.m;
            }
            if (value.t) {
                cell.t = value.t;
            }

            cellMatrix.setValue(r, c, cell);
        }
    }
    return result.getData();
}
