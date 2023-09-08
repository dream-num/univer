import {
    BorderStyleTypes,
    BorderType,
    CommandType,
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
import { ISelectionManager } from '../../Services/tokens';
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
        const selectionManager = accessor.get(ISelectionManager);
        const borderStyleManagerService = accessor.get(BorderStyleManagerService);

        const selections = selectionManager.getCurrentSelections();
        const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        if (!selections.length) {
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
            // Probably to the border, there are no surrounding cells
            // Clear the bottom border of the top range
            forEach(topRangeOut, (row, column) => {
                mr.setValue(row, column, { bd: { b: null } });
            });

            // first row
            forEach(topRange, (row, column) => {
                const style = Tools.deepMerge(styles.get(sheetMatrix.getValue(row, column)?.s) || {}, {
                    bd: { t: Tools.deepClone(border) },
                });
                mr.setValue(row, column, style);
            });
        }

        if (bottom) {
            // Probably to the border, there are no surrounding cells
            // Clear the top border of the lower range
            forEach(bottomRangeOut, (row, column) => {
                mr.setValue(row, column, { bd: { t: null } });
            });

            // the last row
            forEach(bottomRange, (row, column) => {
                // update
                const style = Tools.deepMerge(styles.get(sheetMatrix.getValue(row, column)?.s) || {}, {
                    bd: { b: Tools.deepClone(border) },
                });
                mr.setValue(row, column, style);
            });
        }
        if (left) {
            // Probably to the border, there are no surrounding cells
            //  Clear the right border of the left range
            forEach(leftRangeOut, (row, column) => {
                mr.setValue(row, column, { bd: { r: null } });
            });

            // first column
            forEach(leftRange, (row, column) => {
                // update
                const style = Tools.deepMerge(styles.get(sheetMatrix.getValue(row, column)?.s) || {}, {
                    bd: { l: Tools.deepClone(border) },
                });
                mr.setValue(row, column, style);
            });
        }
        if (right) {
            // Probably to the border, there are no surrounding cells
            //  Clear the left border of the right range
            forEach(rightRangeOut, (row, column) => {
                mr.setValue(row, column, { bd: { l: null } });
            });

            // last column
            forEach(rightRange, (row, column) => {
                // update
                const style = Tools.deepMerge(styles.get(sheetMatrix.getValue(row, column)?.s) || {}, {
                    bd: { r: Tools.deepClone(border) },
                });
                mr.setValue(row, column, style);
            });
        }

        // inner vertical border
        if (vertical === true) {
            // current range
            forEach(rangeData, (row, column) => {
                // Set the right border except the last column
                if (column !== rangeData.endColumn) {
                    // update
                    const style = Tools.deepMerge(styles.get(sheetMatrix.getValue(row, column)?.s) || {}, {
                        bd: { r: Tools.deepClone(border) },
                    });
                    mr.setValue(row, column, style);
                }
            });
        }
        // inner horizontal border
        if (horizontal === true) {
            // current range
            forEach(rangeData, (row, column) => {
                // Except for the last row, set the bottom border
                if (row !== rangeData.endRow) {
                    const style = Tools.deepMerge(styles.get(sheetMatrix.getValue(row, column)?.s) || {}, {
                        bd: { b: Tools.deepClone(border) },
                    });
                    mr.setValue(row, column, style);
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
                URI: 'sheet', // TODO: this URI is fake
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
