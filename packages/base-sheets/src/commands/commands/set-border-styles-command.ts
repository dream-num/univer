import {
    BorderStyleTypes,
    BorderType,
    CommandType,
    IBorderStyleData,
    ICommand,
    ICommandService,
    IRange,
    IStyleData,
    IUndoRedoService,
    IUniverInstanceService,
    Nullable,
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

export interface ISetBorderCommandParams {
    workbookId?: string;
    worksheetId?: string;
    range?: IRange;
    top?: Nullable<boolean>;
    left?: Nullable<boolean>;
    bottom?: Nullable<boolean>;
    right?: Nullable<boolean>;
    vertical?: Nullable<boolean>;
    horizontal?: Nullable<boolean>;
    color?: string;
    style?: BorderStyleTypes;
}

function forEach(range: IRange, action: (row: number, column: number) => void): void {
    const { startRow, startColumn, endRow, endColumn } = range;
    for (let i = startRow; i <= endRow; i++) {
        for (let j = startColumn; j <= endColumn; j++) {
            action(i, j);
        }
    }
}

/**
 * The command to clear content in current selected ranges.
 */
export const SetBorderCommand: ICommand = {
    id: 'sheet.command.set-border',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params: ISetBorderCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const selectionManagerService = accessor.get(SelectionManagerService);

        const range = params.range || selectionManagerService.getSelectionRanges()?.[0];
        if (!range) {
            return false;
        }

        const {
            top = null,
            left = null,
            bottom = null,
            right = null,
            vertical = null,
            horizontal = null,
            color = 'black',
            style = BorderStyleTypes.DASH_DOT,
        } = params;

        const workbookId = params.workbookId || univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId =
            params.worksheetId || univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;
        const sheetMatrix = worksheet.getCellMatrix();
        const styles = workbook.getStyles();

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

        const mr = new ObjectMatrix<IStyleData>();

        const border: IBorderStyleData = {
            s: style,
            cl: {
                rgb: color,
            },
        };

        if (top === true || top === false || top === null) {
            // Probably to the border, there are no surrounding cells
            // Clear the bottom border of the top range
            forEach(topRangeOut, (row, column) => {
                mr.setValue(row, column, { bd: { b: null } });
            });

            // first row
            forEach(topRange, (row, column) => {
                // update
                if (top === true) {
                    const style = Tools.deepMerge(
                        Tools.deepClone(styles.get(sheetMatrix.getValue(row, column)?.s)) || {},
                        {
                            bd: { t: Tools.deepClone(border) },
                        }
                    );
                    mr.setValue(row, column, style);
                }
                // delete
                else if (top === false) {
                    const style = Tools.deepMerge(
                        Tools.deepClone(styles.get(sheetMatrix.getValue(row, column)?.s)) || {},
                        {
                            bd: { t: null },
                        }
                    );
                    mr.setValue(row, column, style);
                }
            });
        }
        if (bottom === true || bottom === false || bottom === null) {
            // Probably to the border, there are no surrounding cells
            // Clear the top border of the lower range
            forEach(bottomRangeOut, (row, column) => {
                mr.setValue(row, column, { bd: { t: null } });
            });

            // the last row
            forEach(bottomRange, (row, column) => {
                // update
                if (bottom === true) {
                    const style = Tools.deepMerge(
                        Tools.deepClone(styles.get(sheetMatrix.getValue(row, column)?.s)) || {},
                        {
                            bd: { b: Tools.deepClone(border) },
                        }
                    );
                    mr.setValue(row, column, style);
                }
                // delete
                else if (bottom === false) {
                    const style = Tools.deepMerge(
                        Tools.deepClone(styles.get(sheetMatrix.getValue(row, column)?.s)) || {},
                        {
                            bd: { b: null },
                        }
                    );
                    mr.setValue(row, column, style);
                }
            });
        }
        if (left === true || left === false || left === null) {
            // Probably to the border, there are no surrounding cells
            //  Clear the right border of the left range
            forEach(leftRangeOut, (row, column) => {
                mr.setValue(row, column, { bd: { r: null } });
            });

            // first column
            forEach(leftRange, (row, column) => {
                // update
                if (left === true) {
                    const style = Tools.deepMerge(
                        Tools.deepClone(styles.get(sheetMatrix.getValue(row, column)?.s)) || {},
                        {
                            bd: { l: Tools.deepClone(border) },
                        }
                    );
                    mr.setValue(row, column, style);
                }
                // delete
                else if (left === false) {
                    const style = Tools.deepMerge(
                        Tools.deepClone(styles.get(sheetMatrix.getValue(row, column)?.s)) || {},
                        {
                            bd: { l: null },
                        }
                    );
                    mr.setValue(row, column, style);
                }
            });
        }
        if (right === true || right === false || right === null) {
            // Probably to the border, there are no surrounding cells
            //  Clear the left border of the right range
            forEach(rightRangeOut, (row, column) => {
                mr.setValue(row, column, { bd: { l: null } });
            });

            // last column
            forEach(rightRange, (row, column) => {
                // update
                if (right === true) {
                    const style = Tools.deepMerge(
                        Tools.deepClone(styles.get(sheetMatrix.getValue(row, column)?.s)) || {},
                        {
                            bd: { r: Tools.deepClone(border) },
                        }
                    );
                    mr.setValue(row, column, style);
                }
                // delete
                else if (right === false) {
                    const style = Tools.deepMerge(
                        Tools.deepClone(styles.get(sheetMatrix.getValue(row, column)?.s)) || {},
                        {
                            bd: { r: null },
                        }
                    );
                    mr.setValue(row, column, style);
                }
            });
        }

        // inner vertical border
        if (vertical === true || vertical === false) {
            // current range
            forEach(range, (row, column) => {
                // Set the right border except the last column
                if (column !== range.endColumn) {
                    // update
                    if (vertical === true) {
                        const style = Tools.deepMerge(
                            Tools.deepClone(styles.get(sheetMatrix.getValue(row, column)?.s)) || {},
                            {
                                bd: { r: Tools.deepClone(border) },
                            }
                        );
                        mr.setValue(row, column, style);
                    }
                    // delete
                    else if (vertical === false) {
                        const style = Tools.deepMerge(
                            Tools.deepClone(styles.get(sheetMatrix.getValue(row, column)?.s)) || {},
                            {
                                bd: { r: null },
                            }
                        );
                        mr.setValue(row, column, style);
                    }
                }

                // Except for the first column, clear the left border
                if (column !== range.startColumn) {
                    const style = Tools.deepMerge(
                        Tools.deepClone(styles.get(sheetMatrix.getValue(row, column)?.s)) || {},
                        {
                            bd: { l: null },
                        }
                    );
                    mr.setValue(row, column, style);
                }
            });
        }
        // inner horizontal border
        if (horizontal === true || horizontal === false) {
            // current range
            forEach(range, (row, column) => {
                // Except for the last row, set the bottom border
                if (row !== range.endRow) {
                    // update
                    if (horizontal === true) {
                        const style = Tools.deepMerge(styles.get(sheetMatrix.getValue(row, column)?.s) || {}, {
                            bd: { b: Tools.deepClone(border) },
                        });
                        mr.setValue(row, column, style);
                    }
                    // delete
                    else if (horizontal === false) {
                        const style = Tools.deepMerge(styles.get(sheetMatrix.getValue(row, column)?.s) || {}, {
                            bd: { b: null },
                        });
                        mr.setValue(row, column, style);
                    }
                }

                // Except for the first row, clear the top border
                if (row !== range.startRow) {
                    const style = Tools.deepMerge(styles.get(sheetMatrix.getValue(row, column)?.s) || {}, {
                        bd: { t: null },
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
        const undoSetBorderStylesMutationParams: ISetBorderStylesMutationParams = SetBorderStylesUndoMutationFactory(
            accessor,
            setBorderStylesMutationParams
        );

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.syncExecuteCommand(SetBorderStylesMutation.id, setBorderStylesMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: workbookId,
                undo() {
                    return commandService.syncExecuteCommand(
                        SetBorderStylesMutation.id,
                        undoSetBorderStylesMutationParams
                    );
                },
                redo() {
                    return commandService.syncExecuteCommand(SetBorderStylesMutation.id, setBorderStylesMutationParams);
                },
            });

            return true;
        }

        return false;
    },
};

interface ISetBorderType {
    type: BorderType;
}

export const SetBorderTypeCommand: ICommand = {
    id: 'sheet.command.set-border-types',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params?: ISetBorderType) => {
        const commandService = accessor.get(ICommandService);
        const borderService = accessor.get(BorderStyleManagerService);
        const type = params ? params.type : BorderType.ALL;
        borderService.setType(type);

        let top = null;
        let left = null;
        let bottom = null;
        let right = null;
        let vertical = null;
        let horizontal = null;

        switch (type) {
            case BorderType.TOP:
                top = true;
                break;
            case BorderType.BOTTOM:
                bottom = true;
                break;
            case BorderType.LEFT:
                left = true;
                break;
            case BorderType.RIGHT:
                right = true;
                break;
            case BorderType.NONE:
                top = false;
                left = false;
                bottom = false;
                right = false;
                vertical = false;
                horizontal = false;
                break;
            case BorderType.ALL:
                top = true;
                left = true;
                bottom = true;
                right = true;
                vertical = true;
                horizontal = true;
                break;
            case BorderType.OUTSIDE:
                top = true;
                left = true;
                bottom = true;
                right = true;
                break;
            case BorderType.INSIDE:
                vertical = true;
                horizontal = true;
                break;
            case BorderType.HORIZONTAL:
                horizontal = true;
                break;
            case BorderType.VERTICAL:
                vertical = true;
                break;

            default:
                break;
        }

        const { color, style } = borderService.getBorderInfo();
        const setBorderParams: ISetBorderCommandParams = {
            top,
            left,
            bottom,
            right,
            vertical,
            horizontal,
            color,
            style,
        };

        return commandService.executeCommand(SetBorderCommand.id, setBorderParams);
    },
};

interface ISetBorderStyle {
    style: BorderStyleTypes;
}

export const SetBorderStyleCommand: ICommand = {
    id: 'sheet.command.set-border-styles',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params?: ISetBorderStyle) => {
        const borderService = accessor.get(BorderStyleManagerService);
        const style = params ? params.style : BorderStyleTypes.THIN;
        borderService.setStyle(style);
        return true;
    },
};

interface ISetBorderColor {
    color: string;
}

export const SetBorderColorCommand: ICommand = {
    id: 'sheet.command.set-border-color',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params?: ISetBorderColor) => {
        const borderService = accessor.get(BorderStyleManagerService);
        const color = params ? params.color : '#000';
        borderService.setColor(color);
        return true;
    },
};
