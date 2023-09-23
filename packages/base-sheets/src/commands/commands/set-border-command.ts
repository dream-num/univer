import {
    BorderStyleTypes,
    BorderType,
    CommandType,
    IBorderData,
    IBorderStyleData,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    ISelectionRange,
    IStyleData,
    IUndoRedoService,
    ObjectMatrix,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { BorderStyleManagerService } from '../../services/border-style-manager.service';
import { SelectionManagerService } from '../../services/selection-manager.service';
import {
    ISetBorderStylesMutationParams,
    SetBorderStylesMutation,
    SetBorderStylesUndoMutationFactory,
} from '../mutations/set-border-styles.mutation';

function forEach(rangeData: ISelectionRange, action: (row: number, column: number) => void): void {
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
    handler: async (accessor: IAccessor, params: ISetBorderPositionCommandParams) => {
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

function setStyleValue(matrix: ObjectMatrix<IStyleData>, row: number, column: number, defaultStyle: IBorderData) {
    const style = matrix.getValue(row, column);
    matrix.setValue(row, column, {
        bd: style?.bd ? Object.assign(style.bd, defaultStyle) : defaultStyle,
    });
}

/**
 * The command to clear content in current selected ranges.
 */
export const SetBorderCommand: ICommand = {
    id: 'sheet.command.set-border',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const borderStyleManagerService = accessor.get(BorderStyleManagerService);

        const selections = selectionManagerService.getRangeDatas();
        const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const workbookId = workbook.getUnitId();
        const worksheet = workbook.getActiveSheet();
        const worksheetId = worksheet.getSheetId();
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
        const rangeData = selections[0];

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

        const mr = new ObjectMatrix<IStyleData>();

        const border: IBorderStyleData = {
            s: style,
            cl: {
                rgb: color,
            },
        };

        if (top) {
            // Clear the bottom border of the top range
            forEach(topRangeOut, (row, column) => {
                setStyleValue(mr, row, column, { b: null });
            });

            forEach(topRange, (row, column) => {
                setStyleValue(mr, row, column, {
                    t: Tools.deepClone(border),
                });
            });
        }
        if (bottom) {
            // Clear the top border of the lower range
            forEach(bottomRangeOut, (row, column) => {
                setStyleValue(mr, row, column, { t: null });
            });

            forEach(bottomRange, (row, column) => {
                setStyleValue(mr, row, column, {
                    b: Tools.deepClone(border),
                });
            });
        }
        if (left) {
            //  Clear the right border of the left range
            forEach(leftRangeOut, (row, column) => {
                setStyleValue(mr, row, column, { r: null });
            });

            forEach(leftRange, (row, column) => {
                setStyleValue(mr, row, column, {
                    l: Tools.deepClone(border),
                });
            });
        }
        if (right) {
            //  Clear the left border of the right range
            forEach(rightRangeOut, (row, column) => {
                setStyleValue(mr, row, column, { l: null });
            });

            forEach(rightRange, (row, column) => {
                setStyleValue(mr, row, column, {
                    r: Tools.deepClone(border),
                });
            });
        }
        // inner vertical border
        if (vertical) {
            forEach(rangeData, (row, column) => {
                if (column !== rangeData.endColumn) {
                    setStyleValue(mr, row, column, {
                        r: Tools.deepClone(border),
                    });
                }
            });
        }
        // inner horizontal border
        if (horizontal) {
            forEach(rangeData, (row, column) => {
                if (row !== rangeData.endRow) {
                    setStyleValue(mr, row, column, {
                        b: Tools.deepClone(border),
                    });
                }
            });
        }

        if (!top && !bottom && !left && !right && !vertical && !horizontal) {
            forEach(topRangeOut, (row, column) => {
                setStyleValue(mr, row, column, { b: null });
            });
            forEach(topRange, (row, column) => {
                setStyleValue(mr, row, column, { t: null });
            });

            forEach(bottomRangeOut, (row, column) => {
                setStyleValue(mr, row, column, { t: null });
            });
            forEach(bottomRange, (row, column) => {
                setStyleValue(mr, row, column, { b: null });
            });

            forEach(leftRangeOut, (row, column) => {
                setStyleValue(mr, row, column, { r: null });
            });
            forEach(leftRange, (row, column) => {
                setStyleValue(mr, row, column, { l: null });
            });

            forEach(rightRangeOut, (row, column) => {
                setStyleValue(mr, row, column, { l: null });
            });
            forEach(rightRange, (row, column) => {
                setStyleValue(mr, row, column, { r: null });
            });

            forEach(rangeData, (row, column) => {
                if (column !== rangeData.endColumn) {
                    setStyleValue(mr, row, column, { r: null });
                }
            });

            forEach(rangeData, (row, column) => {
                if (row !== rangeData.endRow) {
                    setStyleValue(mr, row, column, { b: null });
                }
            });
        }

        const setBorderStylesMutationParams: ISetBorderStylesMutationParams = {
            workbookId,
            worksheetId,
            value: mr.getData(),
        };

        const undoSetBorderStylesMutationParams: ISetBorderStylesMutationParams = SetBorderStylesUndoMutationFactory(
            accessor,
            setBorderStylesMutationParams
        );

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(SetBorderStylesMutation.id, setBorderStylesMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetBorderStylesMutation.id, undoSetBorderStylesMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetBorderStylesMutation.id, setBorderStylesMutationParams);
                },
            });

            return true;
        }

        return false;
    },
};
