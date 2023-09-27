import {
    BorderStyleTypes,
    BorderType,
    CommandType,
    IBorderData,
    IBorderStyleData,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IRange,
    IStyleData,
    IUndoRedoService,
    ObjectMatrix,
    Rectangle,
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

function forEach(range: IRange, action: (row: number, column: number) => void): void {
    const { startRow, startColumn, endRow, endColumn } = range;
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
        const range = selections[0];

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

                if (rectangle) {
                    if (reserve) {
                        const style = mr.getValue(rectangle.startRow, rectangle.startColumn);
                        bdStyle = style?.bd ? Object.assign(style.bd, defaultStyle) : defaultStyle;
                    }
                    mr.setValue(rectangle.startRow, rectangle.startColumn, {
                        bd: bdStyle,
                    });
                } else {
                    if (reserve) {
                        const style = mr.getValue(row, column);
                        bdStyle = style?.bd ? Object.assign(style.bd, defaultStyle) : defaultStyle;
                    }
                    mr.setValue(row, column, { bd: bdStyle });
                }
            });
        }

        if (top) {
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
        // inner vertical border
        if (vertical) {
            forEach(range, (row, column) => {
                const rectangle = hasMerge(row, column);
                if (rectangle) {
                    if (rectangle.endColumn !== range.endColumn) {
                        const style = mr.getValue(rectangle.startRow, rectangle.startColumn);
                        mr.setValue(row, column, {
                            bd: style?.bd
                                ? Object.assign(style.bd, { r: Tools.deepClone(border) })
                                : { r: Tools.deepClone(border) },
                        });
                    }
                } else {
                    if (column !== range.endColumn) {
                        const style = mr.getValue(row, column);
                        mr.setValue(row, column, {
                            bd: style?.bd
                                ? Object.assign(style.bd, { r: Tools.deepClone(border) })
                                : { r: Tools.deepClone(border) },
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
                        const style = mr.getValue(rectangle.startRow, rectangle.startColumn);
                        mr.setValue(row, column, {
                            bd: style?.bd
                                ? Object.assign(style.bd, { b: Tools.deepClone(border) })
                                : { b: Tools.deepClone(border) },
                        });
                    }
                } else {
                    if (row !== range.endRow) {
                        const style = mr.getValue(row, column);
                        mr.setValue(row, column, {
                            bd: style?.bd
                                ? Object.assign(style.bd, { b: Tools.deepClone(border) })
                                : { b: Tools.deepClone(border) },
                        });
                    }
                }
            });
        }

        if (!top && !bottom && !left && !right && !vertical && !horizontal) {
            setBorderStyle(topRangeOut, { b: null });
            setBorderStyle(topRange, { t: null }, true);
            setBorderStyle(bottomRangeOut, { t: null });
            setBorderStyle(bottomRange, { b: null }, true);
            setBorderStyle(leftRangeOut, { r: null });
            setBorderStyle(leftRange, { l: null }, true);
            setBorderStyle(rightRangeOut, { l: null });
            setBorderStyle(rightRange, { r: null }, true);

            forEach(range, (row, column) => {
                const rectangle = hasMerge(row, column);
                if (rectangle) {
                    if (rectangle.endColumn !== range.endColumn) {
                        const style = mr.getValue(rectangle.startRow, rectangle.startColumn);
                        mr.setValue(row, column, {
                            bd: style?.bd ? Object.assign(style.bd, { r: null }) : { r: null },
                        });
                    }
                } else {
                    if (column !== range.endColumn) {
                        const style = mr.getValue(row, column);
                        mr.setValue(row, column, {
                            bd: style?.bd ? Object.assign(style.bd, { r: null }) : { r: null },
                        });
                    }
                }
            });
            forEach(range, (row, column) => {
                const rectangle = hasMerge(row, column);
                if (rectangle) {
                    if (rectangle.endRow !== range.endRow) {
                        const style = mr.getValue(rectangle.startRow, rectangle.startColumn);
                        mr.setValue(row, column, {
                            bd: style?.bd ? Object.assign(style.bd, { b: null }) : { b: null },
                        });
                    }
                } else {
                    if (row !== range.endRow) {
                        const style = mr.getValue(row, column);
                        mr.setValue(row, column, {
                            bd: style?.bd ? Object.assign(style.bd, { b: null }) : { b: null },
                        });
                    }
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
