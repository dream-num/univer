import {
    BorderStyleTypes,
    BorderType,
    CommandType,
    IBorderStyleData,
    ICommand,
    ICommandService,
    IRangeData,
    IStyleData,
    IUndoRedoService,
    Nullable,
    ObjectMatrix,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ISetRangeValuesMutationParams, SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../Mutations/set-range-values.mutation';

export interface ISetBorderCommandParams {
    workbookId: string;
    worksheetId: string;
    range: IRangeData;
    top: Nullable<boolean>;
    left: Nullable<boolean>;
    bottom: Nullable<boolean>;
    right: Nullable<boolean>;
    vertical: Nullable<boolean>;
    horizontal: Nullable<boolean>;
    color?: string;
    style?: BorderStyleTypes;
}

function forEach(rangeData: IRangeData, action: (row: number, column: number) => void): void {
    const { startRow, startColumn, endRow, endColumn } = rangeData;
    for (let i = startRow; i <= endRow; i++) {
        for (let j = startColumn; j <= endColumn; j++) {
            action(i, j);
        }
    }
}

export interface ISetBorderPositionCommandParams {
    value: BorderType;
}

export const SetBorderPositionCommand: ICommand<ISetBorderPositionCommandParams> = {
    id: 'sheet.command.set-border-position',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: ISetBorderPositionCommandParams) => true,
};

export interface ISetBorderStyleCommandParams {
    value: BorderStyleTypes;
}

export const SetBorderStyleCommand: ICommand = {
    id: 'sheet.command.set-border-style',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: ISetBorderStyleCommandParams) => true,
};

export interface ISetBorderColorCommandParams {
    value: string;
}

export const SetBorderColorCommand: ICommand<ISetBorderColorCommandParams> = {
    id: 'sheet.command.set-border-color',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: ISetBorderColorCommandParams) => true,
};

/**
 * The command to clear content in current selected ranges.
 */
export const SetBorderCommand: ICommand<ISetBorderCommandParams> = {
    id: 'sheet.command.set-border',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params: ISetBorderCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { top, left, bottom, right, vertical, horizontal, color = 'black', style = BorderStyleTypes.DASH_DOT, workbookId, worksheetId, range } = params;
        const rangeData = range;

        // Cells in the surrounding range may need to clear the border
        const topRangeOut = {
            startRow: rangeData.startRow - 1,
            startColumn: rangeData.startColumn,
            endRow: rangeData.startRow - 1,
            endColumn: rangeData.endColumn,
        };

        const leftRangeOut = {
            startRow: rangeData.startRow,
            startColumn: rangeData.startColumn - 1,
            endRow: rangeData.endRow,
            endColumn: rangeData.startColumn - 1,
        };

        const bottomRangeOut = {
            startRow: rangeData.endRow + 1,
            startColumn: rangeData.startColumn,
            endRow: rangeData.endRow + 1,
            endColumn: rangeData.endColumn,
        };

        const rightRangeOut = {
            startRow: rangeData.startRow,
            startColumn: rangeData.endColumn + 1,
            endRow: rangeData.endRow,
            endColumn: rangeData.endColumn + 1,
        };

        // Cells in the upper, lower, left and right ranges
        const topRange = {
            startRow: rangeData.startRow,
            startColumn: rangeData.startColumn,
            endRow: rangeData.startRow,
            endColumn: rangeData.endColumn,
        };

        const leftRange = {
            startRow: rangeData.startRow,
            startColumn: rangeData.startColumn,
            endRow: rangeData.endRow,
            endColumn: rangeData.startColumn,
        };

        const bottomRange = {
            startRow: rangeData.endRow,
            startColumn: rangeData.startColumn,
            endRow: rangeData.endRow,
            endColumn: rangeData.endColumn,
        };

        const rightRange = {
            startRow: rangeData.startRow,
            startColumn: rangeData.endColumn,
            endRow: rangeData.endRow,
            endColumn: rangeData.endColumn,
        };

        const mtr = new ObjectMatrix<IStyleData>();
        const mlr = new ObjectMatrix<IStyleData>();
        const mbr = new ObjectMatrix<IStyleData>();
        const mrr = new ObjectMatrix<IStyleData>();
        const mcr = new ObjectMatrix<IStyleData>();

        const border: IBorderStyleData = {
            s: style,
            cl: {
                rgb: color,
            },
        };

        if (top === true || top === false) {
            // Probably to the border, there are no surrounding cells
            // Clear the bottom border of the top range
            forEach(topRangeOut, (row, column) => {
                mtr.setValue(row, column, { bd: { b: null } });
            });

            // first row
            forEach(topRange, (row, column) => {
                // update
                if (top === true) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { t: Tools.deepClone(border) },
                    });
                    mcr.setValue(row, column, style);
                }
                // delete
                else if (top === false) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { t: null },
                    });
                    mcr.setValue(row, column, style);
                }
            });
        }
        if (bottom === true || bottom === false) {
            // Probably to the border, there are no surrounding cells
            // Clear the top border of the lower range
            forEach(bottomRangeOut, (row, column) => {
                mbr.setValue(row, column, { bd: { t: null } });
            });

            // the last row
            forEach(bottomRange, (row, column) => {
                // update
                if (bottom === true) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { b: Tools.deepClone(border) },
                    });
                    mcr.setValue(row, column, style);
                }
                // delete
                else if (bottom === false) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { b: null },
                    });
                    mcr.setValue(row, column, style);
                }
            });
        }
        if (left === true || left === false) {
            // Probably to the border, there are no surrounding cells
            //  Clear the right border of the left range
            forEach(leftRangeOut, (row, column) => {
                mlr.setValue(row, column, { bd: { r: null } });
            });

            // first column
            forEach(leftRange, (row, column) => {
                // update
                if (left === true) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { l: Tools.deepClone(border) },
                    });
                    mcr.setValue(row, column, style);
                }
                // delete
                else if (left === false) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { l: null },
                    });
                    mcr.setValue(row, column, style);
                }
            });
        }
        if (right === true || right === false) {
            // Probably to the border, there are no surrounding cells
            //  Clear the left border of the right range
            forEach(rightRangeOut, (row, column) => {
                mrr.setValue(row, column, { bd: { l: null } });
            });

            // last column
            forEach(rightRange, (row, column) => {
                // update
                if (right === true) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { r: Tools.deepClone(border) },
                    });
                    mcr.setValue(row, column, style);
                }
                // delete
                else if (right === false) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { r: null },
                    });
                    mcr.setValue(row, column, style);
                }
            });
        }

        // inner vertical border
        if (vertical === true || vertical === false) {
            // current range
            forEach(rangeData, (row, column) => {
                // Set the right border except the last column
                if (column !== rangeData.endColumn) {
                    // update
                    if (vertical === true) {
                        const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                            bd: { r: Tools.deepClone(border) },
                        });
                        mcr.setValue(row, column, style);
                    }
                    // delete
                    else if (vertical === false) {
                        const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                            bd: { r: null },
                        });
                        mcr.setValue(row, column, style);
                    }
                }

                // Except for the first column, clear the left border
                if (column !== rangeData.startColumn) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { l: null },
                    });
                    mcr.setValue(row, column, style);
                }
            });
        }
        // inner horizontal border
        if (horizontal === true || horizontal === false) {
            // current range
            forEach(rangeData, (row, column) => {
                // Except for the last row, set the bottom border
                if (row !== rangeData.endRow) {
                    // update
                    if (horizontal === true) {
                        const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                            bd: { b: Tools.deepClone(border) },
                        });
                        mcr.setValue(row, column, style);
                    }
                    // delete
                    else if (horizontal === false) {
                        const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                            bd: { b: null },
                        });
                        mcr.setValue(row, column, style);
                    }
                }

                // Except for the first row, clear the top border
                if (row !== rangeData.startRow) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { t: null },
                    });
                    mcr.setValue(row, column, style);
                }
            });
        }

        const clearMutationParams: ISetRangeValuesMutationParams = {
            rangeData: range,
            worksheetId: worksheet.getSheetId(),
        };
        const undoClearMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(accessor, clearMutationParams);

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(SetRangeValuesMutation.id, clearMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: 'sheet', // TODO: this URI is fake
                undo() {
                    return commandService.executeCommand(SetRangeValuesMutation.id, undoClearMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetRangeValuesMutation.id, clearMutationParams);
                },
            });

            return true;
        }

        return false;
    },
};
