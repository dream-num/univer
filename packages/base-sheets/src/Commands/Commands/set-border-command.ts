import {
    BorderStyleTypes,
    BorderType,
    CommandType,
    IBorderData,
    IBorderStyleData,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IRangeData,
    IStyleData,
    IUndoRedoService,
    Nullable,
    ObjectMatrix,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { BorderStyleManagerService } from '../../Services/border-style-manager.service';
import { SelectionManagerService } from '../../Services/selection-manager.service';
import { ISetBorderStylesMutationParams, SetBorderStylesMutation, SetBorderStylesUndoMutationFactory } from '../Mutations/set-border-styles.mutatio';

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
    handler: async (accessor: IAccessor, params: ISetBorderPositionCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const borderStyleManagerService = accessor.get(BorderStyleManagerService);

        const selections = selectionManagerService.getRangeDatas();
        const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        if (!selections?.length) {
            return false;
        }

        const value = params.value;
        const borderInfo = borderStyleManagerService.getBorderInfo();
        const destParams: ISetBorderCommandParams = {
            workbookId: workbook.getUnitId(),
            worksheetId: workbook.getActiveSheet().getSheetId(),
            range: selections[0],
            top: value === BorderType.TOP || value === BorderType.ALL || value === BorderType.OUTSIDE,
            left: value === BorderType.LEFT || value === BorderType.ALL || value === BorderType.OUTSIDE,
            bottom: value === BorderType.BOTTOM || value === BorderType.ALL || value === BorderType.OUTSIDE,
            right: value === BorderType.RIGHT || value === BorderType.ALL || value === BorderType.OUTSIDE,
            vertical: value === BorderType.VERTICAL || value === BorderType.ALL || value === BorderType.INSIDE,
            horizontal: value === BorderType.HORIZONTAL || value === BorderType.ALL || value === BorderType.INSIDE,
            style: borderInfo.style,
            color: borderInfo.color,
        };

        return commandService.executeCommand(SetBorderCommand.id, destParams);
    },
};

export interface ISetBorderStyleCommandParams {
    value: BorderStyleTypes;
}

export const SetBorderStyleCommand: ICommand = {
    id: 'sheet.command.set-border-style',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: ISetBorderStyleCommandParams) => {
        const borderManager = accessor.get(BorderStyleManagerService);
        borderManager.setStyle(params.value);
        return true;
    },
};

export interface ISetBorderColorCommandParams {
    value: string;
}

export const SetBorderColorCommand: ICommand<ISetBorderColorCommandParams> = {
    id: 'sheet.command.set-border-color',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: ISetBorderColorCommandParams) => {
        const borderManager = accessor.get(BorderStyleManagerService);
        borderManager.setColor(params.value);
        return true;
    },
};

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

function setStyleValue(matrix: ObjectMatrix<IStyleData>, row: number, column: number, defaultStyle: IBorderData) {
    const style = matrix.getValue(row, column);
    matrix.setValue(row, column, {
        bd: style?.bd ? Object.assign(style.bd, defaultStyle) : defaultStyle,
    });
}

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
        const currentUniverService = accessor.get(ICurrentUniverService);
        const { top, left, bottom, right, vertical, horizontal, color = 'black', style = BorderStyleTypes.DASH_DOT, workbookId, worksheetId, range } = params;

        const workbook = currentUniverService.getUniverSheetInstance(params.workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;
        const sheetMatrix = worksheet.getCellMatrix();
        const rangeData = range;
        const styles = Tools.deepClone(workbook.getStyles());

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

        const undoSetBorderStylesMutationParams: ISetBorderStylesMutationParams = SetBorderStylesUndoMutationFactory(accessor, setBorderStylesMutationParams);

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
