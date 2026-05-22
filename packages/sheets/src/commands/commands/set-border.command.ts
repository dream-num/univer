/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type {
    BorderStyleTypes,
    IAccessor,
    IBorderData,
    IBorderStyleData,
    ICellData,
    ICommand,
    IRange,
    IStyleData,
} from '@univerjs/core';

import type { IBorderInfo } from '../../services/border-style-manager.service';
import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';
import type { IResult } from './utils/target-util';
import {
    BorderType,
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    Tools,
} from '@univerjs/core';
import { BorderStyleManagerService } from '../../services/border-style-manager.service';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../mutations/set-range-values.mutation';
import { getSheetCommandTarget } from './utils/target-util';

function forEach(range: IRange, action: (row: number, column: number) => void): void {
    const { startRow, startColumn, endRow, endColumn } = range;
    for (let i = startRow; i <= endRow; i++) {
        for (let j = startColumn; j <= endColumn; j++) {
            action(i, j);
        }
    }
}

export interface ISetBorderBasicCommandParams {
    unitId?: string;
    subUnitId?: string;
    ranges: IRange[];
    value: IBorderInfo;

}

export interface ISetBorderPositionCommandParams {
    value: BorderType;
}

export interface ISetBorderStyleCommandParams {
    value: BorderStyleTypes;
}

export interface ISetBorderCommandParams {
    unitId?: string;
    subUnitId?: string;
    ranges?: IRange[];
}

export interface ISetBorderColorCommandParams {
    value: string;
}

const setBorderStyleForRange = (borderContext: ReturnType<typeof getBorderContext>, range: IRange, defaultStyle: IBorderData, reserve?: boolean) => {
    const { mr, worksheet } = borderContext;
    if (range.startRow < 0 || range.startColumn < 0) return;
    forEach(range, (row, column) => {
        const rectangle = worksheet.getMergedCell(row, column);

        let bdStyle = defaultStyle;

        if (rectangle && (defaultStyle.bc_tr || defaultStyle.ml_tr || defaultStyle.bl_tr || defaultStyle.tl_mr || defaultStyle.tl_bc || defaultStyle.tl_br)) {
            if (reserve) {
                const style = Tools.deepClone(
                    mr.getValue(rectangle.startRow, rectangle.startColumn)?.s
                ) as IStyleData;
                bdStyle = style?.bd ? Object.assign(style.bd, defaultStyle) : defaultStyle;
            }
            mr.setValue(rectangle.startRow, rectangle.startColumn, {
                s: {
                    bd: bdStyle,
                },
            });
        } else {
            if (reserve) {
                const style = Tools.deepClone(mr.getValue(row, column)?.s) as IStyleData;
                bdStyle = style?.bd ? Object.assign(style.bd, defaultStyle) : defaultStyle;
            }
            mr.setValue(row, column, { s: { bd: bdStyle } });
        }
    });
};

const prepareEdgeRange = (range: IRange) => {
    const topRangeOut = {
        startRow: range.startRow - 1,
        startColumn: range.startColumn,
        endRow: range.startRow - 1,
        endColumn: range.endColumn,
    };

    const leftRangeOut = {
        startRow: range.startRow,
        startColumn: range.startColumn - 1,
        endRow: range.endRow,
        endColumn: range.startColumn - 1,
    };

    const bottomRangeOut = {
        startRow: range.endRow + 1,
        startColumn: range.startColumn,
        endRow: range.endRow + 1,
        endColumn: range.endColumn,
    };

    const rightRangeOut = {
        startRow: range.startRow,
        startColumn: range.endColumn + 1,
        endRow: range.endRow,
        endColumn: range.endColumn + 1,
    };

    // Cells in the upper, lower, left and right ranges
    const topRange = {
        startRow: range.startRow,
        startColumn: range.startColumn,
        endRow: range.startRow,
        endColumn: range.endColumn,
    };

    const leftRange = {
        startRow: range.startRow,
        startColumn: range.startColumn,
        endRow: range.endRow,
        endColumn: range.startColumn,
    };

    const bottomRange = {
        startRow: range.endRow,
        startColumn: range.startColumn,
        endRow: range.endRow,
        endColumn: range.endColumn,
    };

    const rightRange = {
        startRow: range.startRow,
        startColumn: range.endColumn,
        endRow: range.endRow,
        endColumn: range.endColumn,
    };
    return {
        topRangeOut,
        leftRangeOut,
        bottomRangeOut,
        rightRangeOut,
        topRange,
        leftRange,
        bottomRange,
        rightRange,
    };
};

function getBorderContext(borderStyleManagerService: BorderStyleManagerService, target: IResult, selections: IRange[]) {
    const { style, color, type } = borderStyleManagerService.getBorderInfo();

    const top = type === BorderType.TOP || type === BorderType.ALL || type === BorderType.OUTSIDE;
    const left = type === BorderType.LEFT || type === BorderType.ALL || type === BorderType.OUTSIDE;
    const bottom = type === BorderType.BOTTOM || type === BorderType.ALL || type === BorderType.OUTSIDE;
    const right = type === BorderType.RIGHT || type === BorderType.ALL || type === BorderType.OUTSIDE;
    const vertical = type === BorderType.VERTICAL || type === BorderType.ALL || type === BorderType.INSIDE;
    const horizontal = type === BorderType.HORIZONTAL || type === BorderType.ALL || type === BorderType.INSIDE;

    const tl_br = type.indexOf('tlbr') > -1;

    const tl_bc = type.indexOf('tlbc') > -1;

    const tl_mr = type.indexOf('tlmr') > -1;

    const bl_tr = type.indexOf('bltr') > -1;

    const ml_tr = type.indexOf('mltr') > -1;

    const bc_tr = type.indexOf('bctr') > -1;

    const range = selections[0]; // TODO @Dushusir support multiple ranges

    // Cells in the surrounding range may need to clear the border
    const {
        topRangeOut,
        leftRangeOut,
        bottomRangeOut,
        rightRangeOut,
        topRange,
        leftRange,
        bottomRange,
        rightRange,
    } = prepareEdgeRange(range);

    const mr = new ObjectMatrix<ICellData>();

    const { worksheet, unitId, subUnitId } = target;

    const borderStyle: IBorderStyleData = {
        s: style,
        cl: {
            rgb: color,
        },
    };
    return {
        worksheet,
        unitId,
        subUnitId,
        style,
        color,
        type,
        top,
        left,
        right,
        bottom,
        vertical,
        horizontal,
        tl_br,
        tl_bc,
        tl_mr,
        bl_tr,
        ml_tr,
        bc_tr,
        topRangeOut,
        leftRangeOut,
        bottomRangeOut,
        rightRangeOut,
        topRange,
        leftRange,
        bottomRange,
        rightRange,
        range,
        mr,
        borderStyle,
    };
}

// const setBorderStyle = (borderContext: ReturnType<typeof getBorderContext>, defaultStyle: IBorderData, reserve?: boolean) => {
//     setBorderStyleForRange(borderContext.mr, borderContext.worksheet, borderContext.range, defaultStyle, reserve);
// };

// eslint-disable-next-line max-lines-per-function
const innerBorder = (borderContext: ReturnType<typeof getBorderContext>) => {
    const { range, mr, borderStyle, vertical, horizontal, worksheet } = borderContext;
    //#region inner vertical border
    if (vertical) {
        forEach(range, (row, column) => {
            const mergedRange = worksheet.getMergedCell(row, column);
            if (mergedRange) {
                const topLeftStyle = mr.getValue(mergedRange.startRow, mergedRange.startColumn)?.s as IStyleData;
                if (mergedRange.startColumn !== range.startColumn) {
                    mr.setValue(row, column, {
                        s: {
                            bd: topLeftStyle?.bd
                                ? Object.assign(topLeftStyle.bd, { l: Tools.deepClone(borderStyle) })
                                : { l: Tools.deepClone(borderStyle) },
                        },
                    });
                }
            } else {
                if (column !== range.endColumn) {
                    const style = mr.getValue(row, column)?.s as IStyleData;
                    mr.setValue(row, column, {
                        s: {
                            bd: style?.bd
                                ? Object.assign(style.bd, { r: Tools.deepClone(borderStyle) })
                                : { r: Tools.deepClone(borderStyle) },
                        },
                    });
                }

                if (column !== range.startColumn) {
                    const style = mr.getValue(row, column)?.s as IStyleData;
                    mr.setValue(row, column, {
                        s: {
                            bd: style?.bd
                                ? Object.assign(style.bd, { l: Tools.deepClone(borderStyle) })
                                : { l: Tools.deepClone(borderStyle) },
                        },
                    });
                }
            }
        });
    }
    //#endregion

    //#region inner horizontal border
    if (horizontal) {
        forEach(range, (row, column) => {
            const mergedRange = worksheet.getMergedCell(row, column);
            if (mergedRange) {
                const topLeftStyle = mr.getValue(mergedRange.startRow, mergedRange.startColumn)?.s as IStyleData;

                if (mergedRange.startRow !== range.startRow) {
                    mr.setValue(row, column, {
                        s: {
                            bd: topLeftStyle?.bd
                                ? Object.assign(topLeftStyle.bd, { t: Tools.deepClone(borderStyle) })
                                : { t: Tools.deepClone(borderStyle) },
                        },
                    });
                }
            } else {
                if (row !== range.endRow) {
                    const style = mr.getValue(row, column)?.s as IStyleData;
                    mr.setValue(row, column, {
                        s: {
                            bd: style?.bd
                                ? Object.assign(style.bd, { b: Tools.deepClone(borderStyle) })
                                : { b: Tools.deepClone(borderStyle) },
                        },
                    });
                }

                if (row !== range.startRow) {
                    const style = mr.getValue(row, column)?.s as IStyleData;
                    mr.setValue(row, column, {
                        s: {
                            bd: style?.bd
                                ? Object.assign(style.bd, { t: Tools.deepClone(borderStyle) })
                                : { t: Tools.deepClone(borderStyle) },
                        },
                    });
                }
            }
        });
    }
    //#endregion
};

function otherBorders(borderContext: ReturnType<typeof getBorderContext>) {
    const { borderStyle, tl_br, tl_bc, tl_mr, bl_tr, ml_tr, bc_tr } = borderContext;

    const setBorderStyle = (range: IRange, defaultStyle: IBorderData, reserve?: boolean) => {
        setBorderStyleForRange(borderContext, range, defaultStyle, reserve);
    };

    if (tl_br) {
        setBorderStyle(borderContext.range, { tl_br: Tools.deepClone(borderStyle) }, true);
    }

    if (tl_bc) {
        setBorderStyle(borderContext.range, { tl_bc: Tools.deepClone(borderStyle) }, true);
    }

    if (tl_mr) {
        setBorderStyle(borderContext.range, { tl_mr: Tools.deepClone(borderStyle) }, true);
    }

    if (bl_tr) {
        setBorderStyle(borderContext.range, { bl_tr: Tools.deepClone(borderStyle) }, true);
    }

    if (ml_tr) {
        setBorderStyle(borderContext.range, { ml_tr: Tools.deepClone(borderStyle) }, true);
    }

    if (bc_tr) {
        setBorderStyle(borderContext.range, { bc_tr: Tools.deepClone(borderStyle) }, true);
    }
}

const outlineBorder = (borderContext: ReturnType<typeof getBorderContext>) => {
    const { top, left, right, bottom, borderStyle, bottomRange, topRange, leftRange, rightRange, bottomRangeOut, topRangeOut, leftRangeOut, rightRangeOut } = borderContext;
    const setBorderStyle = (range: IRange, defaultStyle: IBorderData, reserve?: boolean) => {
        setBorderStyleForRange(borderContext, range, defaultStyle, reserve);
    };
    if (top) {
        /**
         * pro/issues/344
         * Compatible with Excel's border rendering.
         * When the top border of a cell and the bottom border of the cell above it (r-1) overlap,
         * if the top border of cell r is white, then the rendering is ignored.
         */
        setBorderStyle(topRangeOut, { b: null });
        setBorderStyle(topRange, { t: Tools.deepClone(borderStyle) }, true);
    }

    if (bottom) {
        //see univer-pro/issues/2561
        // add bottom line for merged cell
        // must put below inner horizontal border, horizontal border would clear right border when using topleftBorderStyle
        setBorderStyle(bottomRangeOut, { t: null });
        setBorderStyle(bottomRange, { b: Tools.deepClone(borderStyle) }, true);
    }
    if (left) {
        setBorderStyle(leftRangeOut, { r: null });
        setBorderStyle(leftRange, { l: Tools.deepClone(borderStyle) }, true);
    }
    if (right) {
        //see univer-pro/issues/2561
        // add bottom line for merged cell
        // must put below inner vertical border, vertical border would clear right border when using topleftBorderStyle
        setBorderStyle(rightRangeOut, { l: null });
        setBorderStyle(rightRange, { r: Tools.deepClone(borderStyle) }, true);
    }
};

// eslint-disable-next-line max-lines-per-function
const clearBorder = (borderContext: ReturnType<typeof getBorderContext>) => {
    const { range, worksheet, mr, top, bottom, left, right, vertical, horizontal, tl_br, tl_bc, tl_mr, bl_tr, ml_tr, bc_tr, topRange, bottomRange, leftRange, rightRange, topRangeOut, bottomRangeOut, leftRangeOut, rightRangeOut } = borderContext;

    const setBorderStyle = (range: IRange, defaultStyle: IBorderData, reserve?: boolean) => {
        setBorderStyleForRange(borderContext, range, defaultStyle, reserve);
    };
    if (
        !top &&
        !bottom &&
        !left &&
        !right &&
        !vertical &&
        !horizontal &&
        !tl_br &&
        !tl_bc &&
        !tl_mr &&
        !bl_tr &&
        !ml_tr &&
        !bc_tr
    ) {
        // eslint-disable-next-line complexity
        forEach(range, (row, column) => {
            const mergedRange = worksheet.getMergedCell(row, column);
            // If this cell has border setting before merge, then we need clear settings of edge border.
            if (mergedRange) {
                // Remove the right border from all cells except for the right border of the rightmost cell.
                if (mergedRange.endColumn !== range.endColumn) {
                    const style = mr.getValue(mergedRange.startRow, mergedRange.startColumn)?.s as IStyleData;
                    mr.setValue(row, column, {
                        s: {
                            bd: style?.bd ? Object.assign(style.bd, { r: null }) : { r: null },
                        },
                    });
                }
                // Remove the left border from all cells except for the left border of the leftmost cell.
                if (mergedRange.startColumn !== range.startColumn) {
                    const style = mr.getValue(mergedRange.startRow, mergedRange.startColumn)?.s as IStyleData;
                    mr.setValue(row, column, {
                        s: {
                            bd: style?.bd ? Object.assign(style.bd, { l: null }) : { l: null },
                        },
                    });
                }
                // see https://github.com/dream-num/univer/pull/3506
                // Remove the top border from all cells except for the top border of the topmost cell.
                if (mergedRange.endRow !== range.endRow) {
                    const style = mr.getValue(mergedRange.startRow, mergedRange.startColumn)?.s as IStyleData;
                    mr.setValue(row, column, {
                        s: {
                            bd: style?.bd ? Object.assign(style.bd, { b: null }) : { b: null },
                        },
                    });
                }
                // Remove the bottom border from all cells except for the bottom border of the bottommost cell.
                if (mergedRange.startRow !== range.startRow) {
                    const style = mr.getValue(mergedRange.startRow, mergedRange.startColumn)?.s as IStyleData;
                    mr.setValue(row, column, {
                        s: {
                            bd: style?.bd ? Object.assign(style.bd, { t: null }) : { t: null },
                        },
                    });
                }
            } else {
                // Clear the right border of all columns except the last column
                if (column !== range.endColumn) {
                    const style = mr.getValue(row, column)?.s as IStyleData;
                    mr.setValue(row, column, {
                        s: {
                            bd: style?.bd ? Object.assign(style.bd, { r: null }) : { r: null },
                        },
                    });
                }
                // Clear the left border of all columns except the first column
                if (column !== range.startColumn) {
                    const style = mr.getValue(row, column)?.s as IStyleData;
                    mr.setValue(row, column, {
                        s: {
                            bd: style?.bd ? Object.assign(style.bd, { l: null }) : { l: null },
                        },
                    });
                }
                // Clear all the bottom border except the last line
                if (row !== range.endRow) {
                    const style = mr.getValue(row, column)?.s as IStyleData;
                    mr.setValue(row, column, {
                        s: {
                            bd: style?.bd ? Object.assign(style.bd, { b: null }) : { b: null },
                        },
                    });
                }
                // Clear the top border of all lines except the first line
                if (row !== range.startRow) {
                    const style = mr.getValue(row, column)?.s as IStyleData;
                    mr.setValue(row, column, {
                        s: {
                            bd: style?.bd ? Object.assign(style.bd, { t: null }) : { t: null },
                        },
                    });
                }
            }
        });

        setBorderStyle(topRangeOut, { b: null });
        setBorderStyle(topRange, { t: null }, true);
        setBorderStyle(bottomRangeOut, { t: null });
        setBorderStyle(bottomRange, { b: null }, true);
        setBorderStyle(leftRangeOut, { r: null });
        setBorderStyle(leftRange, { l: null }, true);
        setBorderStyle(rightRangeOut, { l: null });
        setBorderStyle(rightRange, { r: null }, true);

        setBorderStyle(range, { tl_br: null }, true);
        setBorderStyle(range, { tl_bc: null }, true);
        setBorderStyle(range, { tl_mr: null }, true);
        setBorderStyle(range, { bl_tr: null }, true);
        setBorderStyle(range, { ml_tr: null }, true);
        setBorderStyle(range, { bc_tr: null }, true);
    }
};
/**
 * Set border info for range, including clear border (type = NONE)
 */
export const SetBorderCommand: ICommand = {
    id: 'sheet.command.set-border',
    type: CommandType.COMMAND,

    handler: (accessor: IAccessor, params?: ISetBorderCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const borderStyleManagerService = accessor.get(BorderStyleManagerService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const ranges = params?.ranges || selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        if (!ranges?.length) {
            return false;
        }

        const { activeBorderType } = borderStyleManagerService.getBorderInfo();
        if (!activeBorderType) return false;

        const borderContext = getBorderContext(borderStyleManagerService, target, ranges);
        innerBorder(borderContext);
        outlineBorder(borderContext);
        otherBorders(borderContext);
        clearBorder(borderContext);

        const { unitId, subUnitId, mr } = borderContext;
        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            unitId,
            subUnitId,
            cellValue: mr.getData(),
        };

        const undoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            setRangeValuesMutationParams
        );

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.syncExecuteCommand(SetRangeValuesMutation.id, setRangeValuesMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetRangeValuesMutation.id, params: undoSetRangeValuesMutationParams }],
                redoMutations: [{ id: SetRangeValuesMutation.id, params: setRangeValuesMutationParams }],
            });

            return true;
        }

        return false;
    },
};

export const SetBorderPositionCommand: ICommand<ISetBorderPositionCommandParams> = {
    id: 'sheet.command.set-border-position',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params: ISetBorderPositionCommandParams) => {
        if (!params.value) return false;
        const commandService = accessor.get(ICommandService);
        const borderManager = accessor.get(BorderStyleManagerService);
        borderManager.setType(params.value);
        return commandService.syncExecuteCommand(SetBorderCommand.id);
    },
};

export const SetBorderStyleCommand: ICommand = {
    id: 'sheet.command.set-border-style',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params: ISetBorderStyleCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const borderManager = accessor.get(BorderStyleManagerService);
        borderManager.setStyle(params.value);
        return commandService.syncExecuteCommand(SetBorderCommand.id);
    },
};

export const SetBorderColorCommand: ICommand<ISetBorderColorCommandParams> = {
    id: 'sheet.command.set-border-color',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params: ISetBorderColorCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const borderManager = accessor.get(BorderStyleManagerService);
        borderManager.setColor(params.value);
        return commandService.syncExecuteCommand(SetBorderCommand.id);
    },
};

export const SetBorderBasicCommand: ICommand<ISetBorderBasicCommandParams> = {
    id: 'sheet.command.set-border-basic',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params: ISetBorderBasicCommandParams) => {
        const { unitId, subUnitId, value, ranges } = params;
        const { type, color, style } = value;

        const commandService = accessor.get(ICommandService);
        const borderManager = accessor.get(BorderStyleManagerService);

        borderManager.setType(type);
        if (color) borderManager.setColor(color);
        borderManager.setStyle(style);

        return commandService.syncExecuteCommand(SetBorderCommand.id, {
            unitId,
            subUnitId,
            ranges,
        });
    },
};
