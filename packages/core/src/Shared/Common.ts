import { Tools } from './Tools';
import { Nullable } from '.';
import { ICellInfo, ISelection, ICellData, IColorStyle } from '../Interfaces';
import { ColorBuilder } from '../Sheets/Domain';

export function makeCellToSelection(
    cellInfo: Nullable<ICellInfo>
): Nullable<ISelection> {
    if (!cellInfo) {
        return;
    }
    let { row, column, startY, endY, startX, endX, isMerged, mergeInfo } = cellInfo;
    let startRow = row;
    let startColumn = column;
    let endRow = row;
    let endColumn = column;
    if (isMerged && mergeInfo) {
        const {
            startRow: mergeStartRow,
            startColumn: mergeStartColumn,
            endRow: mergeEndRow,
            endColumn: mergeEndColumn,
            startY: mergeStartY,
            endY: mergeEndY,
            startX: mergeStartX,
            endX: mergeEndX,
        } = mergeInfo;
        startRow = mergeStartRow;
        startColumn = mergeStartColumn;
        endRow = mergeEndRow;
        endColumn = mergeEndColumn;
        startY = mergeStartY;
        endY = mergeEndY;
        startX = mergeStartX;
        endX = mergeEndX;
    }

    return {
        startRow,
        startColumn,
        endRow,
        endColumn,
        startY,
        endY,
        startX,
        endX,
    };
}

export function isEmptyCell(cell: Nullable<ICellData>) {
    if (!cell) {
        return true;
    }

    const content = cell?.m || '';
    if (content.length === 0 && !cell.p) {
        return true;
    }
    return false;
}

export function getColorStyle(color: Nullable<IColorStyle>): Nullable<string> {
    if (color) {
        if (color.rgb) {
            return color.rgb;
        }
        if (color.th) {
            return new ColorBuilder()
                .setThemeColor(color.th)
                .asThemeColor()
                .asRgbColor()
                .getCssString();
        }
    }
    return null;
}

export function isFormulaString(value: any): boolean {
    return Tools.isString(value) && value.indexOf('=') === 0;
}
