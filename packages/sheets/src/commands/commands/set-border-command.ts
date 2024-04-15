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

import type {
    BorderStyleTypes,
    IBorderData,
    IBorderStyleData,
    ICellData,
    ICommand,
    IRange,
    IStyleData,
} from '@univerjs/core';
import {
    BorderType,
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    Rectangle,
    Tools,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import { BorderStyleManagerService, type IBorderInfo } from '../../services/border-style-manager.service';
import { SelectionManagerService } from '../../services/selection-manager.service';
import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';
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

    value: IBorderInfo;
}
export const SetBorderBasicCommand: ICommand<ISetBorderBasicCommandParams> = {
    id: 'sheet.command.set-border-basic',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: ISetBorderBasicCommandParams) => {
        const { unitId, subUnitId, value } = params;
        const { type, color, style } = value;

        const commandService = accessor.get(ICommandService);
        const borderManager = accessor.get(BorderStyleManagerService);

        borderManager.setType(type);
        borderManager.setColor(color);
        borderManager.setStyle(style);

        return commandService.executeCommand(SetBorderCommand.id, {
            unitId,
            subUnitId,
        });
    },
};

export interface ISetBorderPositionCommandParams {
    value: BorderType;
}

export const SetBorderPositionCommand: ICommand<ISetBorderPositionCommandParams> = {
    id: 'sheet.command.set-border-position',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: ISetBorderPositionCommandParams) => {
        if (!params.value) return false;
        const commandService = accessor.get(ICommandService);
        const borderManager = accessor.get(BorderStyleManagerService);
        borderManager.setType(params.value);
        return commandService.executeCommand(SetBorderCommand.id);
    },
};

export interface ISetBorderStyleCommandParams {
    value: BorderStyleTypes;
}

export const SetBorderStyleCommand: ICommand = {
    id: 'sheet.command.set-border-style',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: ISetBorderStyleCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const borderManager = accessor.get(BorderStyleManagerService);
        borderManager.setStyle(params.value);
        return commandService.executeCommand(SetBorderCommand.id);
    },
};

export interface ISetBorderColorCommandParams {
    value: string;
}

export const SetBorderColorCommand: ICommand<ISetBorderColorCommandParams> = {
    id: 'sheet.command.set-border-color',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: ISetBorderColorCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const borderManager = accessor.get(BorderStyleManagerService);
        borderManager.setColor(params.value);
        return commandService.executeCommand(SetBorderCommand.id);
    },
};

export interface ISetBorderCommandParams {
    unitId?: string;
    subUnitId?: string;
}

/**
 * The command to clear content in current selected ranges.
 */
export const SetBorderCommand: ICommand = {
    id: 'sheet.command.set-border',
    type: CommandType.COMMAND,

    handler: async (accessor: IAccessor, params?: ISetBorderCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const borderStyleManagerService = accessor.get(BorderStyleManagerService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;
        const selections = selectionManagerService.getSelectionRanges();
        const mergeData = worksheet.getConfig().mergeData;
        if (!selections?.length) {
            return false;
        }

        const { style, color, type, activeBorderType } = borderStyleManagerService.getBorderInfo();
        if (!activeBorderType) return false;
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

        const mr = new ObjectMatrix<ICellData>();

        const border: IBorderStyleData = {
            s: style,
            cl: {
                rgb: color,
            },
        };

        const hasMerge = (row: number, column: number): IRange | null => {
            let res: IRange | null = null;
            mergeData.forEach((merge) => {
                if (
                    Rectangle.intersects(merge, {
                        startColumn: column,
                        endColumn: column,
                        startRow: row,
                        endRow: row,
                    })
                ) {
                    res = merge;
                }
            });
            return res;
        };

        function setBorderStyle(range: IRange, defaultStyle: IBorderData, reserve?: boolean) {
            if (range.startRow < 0 || range.startColumn < 0) return;
            forEach(range, (row, column) => {
                const rectangle = hasMerge(row, column);

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
        }

        if (top) {
            /**
             * pro/issues/344
             * Compatible with Excel's border rendering.
             * When the top border of a cell and the bottom border of the cell above it (r-1) overlap,
             * if the top border of cell r is white, then the rendering is ignored.
             */
            setBorderStyle(topRangeOut, { b: null });
            setBorderStyle(topRange, { t: Tools.deepClone(border) }, true);
        }
        if (bottom) {
            setBorderStyle(bottomRangeOut, { t: null });
            setBorderStyle(bottomRange, { b: Tools.deepClone(border) }, true);
        }
        if (left) {
            setBorderStyle(leftRangeOut, { r: null });
            setBorderStyle(leftRange, { l: Tools.deepClone(border) }, true);
        }
        if (right) {
            setBorderStyle(rightRangeOut, { l: null });
            setBorderStyle(rightRange, { r: Tools.deepClone(border) }, true);
        }

        if (tl_br) {
            setBorderStyle(range, { tl_br: Tools.deepClone(border) }, true);
        }

        if (tl_bc) {
            setBorderStyle(range, { tl_bc: Tools.deepClone(border) }, true);
        }

        if (tl_mr) {
            setBorderStyle(range, { tl_mr: Tools.deepClone(border) }, true);
        }

        if (bl_tr) {
            setBorderStyle(range, { bl_tr: Tools.deepClone(border) }, true);
        }

        if (ml_tr) {
            setBorderStyle(range, { ml_tr: Tools.deepClone(border) }, true);
        }

        if (bc_tr) {
            setBorderStyle(range, { bc_tr: Tools.deepClone(border) }, true);
        }

        // inner vertical border
        if (vertical) {
            forEach(range, (row, column) => {
                const rectangle = hasMerge(row, column);
                if (rectangle) {
                    if (rectangle.endColumn !== range.endColumn) {
                        const style = mr.getValue(rectangle.startRow, rectangle.startColumn)?.s as IStyleData;
                        mr.setValue(row, column, {
                            s: {
                                bd: style?.bd
                                    ? Object.assign(style.bd, { r: Tools.deepClone(border) })
                                    : { r: Tools.deepClone(border) },
                            },
                        });
                    }

                    if (rectangle.startColumn !== range.startColumn) {
                        const style = mr.getValue(rectangle.startRow, rectangle.startColumn)?.s as IStyleData;
                        mr.setValue(row, column, {
                            s: {
                                bd: style?.bd
                                    ? Object.assign(style.bd, { l: Tools.deepClone(border) })
                                    : { l: Tools.deepClone(border) },
                            },
                        });
                    }
                } else {
                    if (column !== range.endColumn) {
                        const style = mr.getValue(row, column)?.s as IStyleData;
                        mr.setValue(row, column, {
                            s: {
                                bd: style?.bd
                                    ? Object.assign(style.bd, { r: Tools.deepClone(border) })
                                    : { r: Tools.deepClone(border) },
                            },
                        });
                    }

                    if (column !== range.startColumn) {
                        const style = mr.getValue(row, column)?.s as IStyleData;
                        mr.setValue(row, column, {
                            s: {
                                bd: style?.bd
                                    ? Object.assign(style.bd, { l: Tools.deepClone(border) })
                                    : { l: Tools.deepClone(border) },
                            },
                        });
                    }
                }
            });
        }
        // inner horizontal border
        if (horizontal) {
            forEach(range, (row, column) => {
                const rectangle = hasMerge(row, column);
                if (rectangle) {
                    if (rectangle.endRow !== range.endRow) {
                        const style = mr.getValue(rectangle.startRow, rectangle.startColumn)?.s as IStyleData;
                        mr.setValue(row, column, {
                            s: {
                                bd: style?.bd
                                    ? Object.assign(style.bd, { b: Tools.deepClone(border) })
                                    : { b: Tools.deepClone(border) },
                            },
                        });
                    }

                    if (rectangle.startRow !== range.startRow) {
                        const style = mr.getValue(rectangle.startRow, rectangle.startColumn)?.s as IStyleData;
                        mr.setValue(row, column, {
                            s: {
                                bd: style?.bd
                                    ? Object.assign(style.bd, { t: Tools.deepClone(border) })
                                    : { t: Tools.deepClone(border) },
                            },
                        });
                    }
                } else {
                    if (row !== range.endRow) {
                        const style = mr.getValue(row, column)?.s as IStyleData;
                        mr.setValue(row, column, {
                            s: {
                                bd: style?.bd
                                    ? Object.assign(style.bd, { b: Tools.deepClone(border) })
                                    : { b: Tools.deepClone(border) },
                            },
                        });
                    }

                    if (row !== range.startRow) {
                        const style = mr.getValue(row, column)?.s as IStyleData;
                        mr.setValue(row, column, {
                            s: {
                                bd: style?.bd
                                    ? Object.assign(style.bd, { t: Tools.deepClone(border) })
                                    : { t: Tools.deepClone(border) },
                            },
                        });
                    }
                }
            });
        }

        // clear
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

            forEach(range, (row, column) => {
                const rectangle = hasMerge(row, column);
                if (rectangle) {
                    // Clear the right border of all columns except the last column
                    if (rectangle.endColumn !== range.endColumn) {
                        const style = mr.getValue(rectangle.startRow, rectangle.startColumn)?.s as IStyleData;
                        mr.setValue(row, column, {
                            s: {
                                bd: style?.bd ? Object.assign(style.bd, { r: null }) : { r: null },
                            },
                        });
                    }
                    // Clear the left border of all columns except the first column
                    if (rectangle.startColumn !== range.startColumn) {
                        const style = mr.getValue(rectangle.startRow, rectangle.startColumn)?.s as IStyleData;
                        mr.setValue(row, column, {
                            s: {
                                bd: style?.bd ? Object.assign(style.bd, { l: null }) : { l: null },
                            },
                        });
                    }
                    // Clear all the bottom border except the last line
                    if (rectangle.endRow !== range.endRow) {
                        const style = mr.getValue(rectangle.startRow, rectangle.startColumn)?.s as IStyleData;
                        mr.setValue(row, column, {
                            s: {
                                bd: style?.bd ? Object.assign(style.bd, { b: null }) : { b: null },
                            },
                        });
                    }
                    // Clear the top border of all lines except the first line
                    if (rectangle.startRow !== range.startRow) {
                        const style = mr.getValue(rectangle.startRow, rectangle.startColumn)?.s as IStyleData;
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
        }

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
