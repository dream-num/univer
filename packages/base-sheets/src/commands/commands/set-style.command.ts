import {
    BooleanNumber,
    CommandType,
    FontItalic,
    FontWeight,
    HorizontalAlign,
    ICellData,
    IColorStyle,
    ICommand,
    ICommandService,
    IStyleData,
    ITextRotation,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    Tools,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../services/selection-manager.service';
import {
    ISetRangeValuesMutationParams,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
} from '../mutations/set-range-values.mutation';
import { SetRowAutoHeightCommand } from './set-worksheet-row-height.command';

export interface IStyleTypeValue<T> {
    type: keyof IStyleData;
    value: T | T[][];
}

export interface ISetStyleParams<T> {
    style: IStyleTypeValue<T>;
}

/**
 * The command to set cell style.
 * Set style to a bunch of ranges.
 */
export const SetStyleCommand: ICommand<ISetStyleParams<unknown>> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-style',

    handler: async <T>(accessor: IAccessor, params: ISetStyleParams<T>) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const ranges = selectionManagerService.getRangeDatas();
        if (!ranges?.length) {
            return false;
        }

        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        const style = params.style;

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;

        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const cellValue = new ObjectMatrix<ICellData>();
        // let value: ObjectMatrixPrimitiveType<ICellData> | undefined;

        if (Tools.isArray(style.value)) {
            for (let i = 0; i < ranges.length; i++) {
                const { startRow, endRow, startColumn, endColumn } = ranges[i];

                for (let r = 0; r <= endRow - startRow; r++) {
                    for (let c = 0; c <= endColumn - startColumn; c++) {
                        cellValue.setValue(r + startRow, c + startColumn, {
                            s: {
                                [style.type]: style.value[r][c],
                            },
                        });
                    }
                }
            }

            // value = cellValue.getData();
        } else {
            for (let i = 0; i < ranges.length; i++) {
                const { startRow, endRow, startColumn, endColumn } = ranges[i];

                const colorObj: ICellData = {
                    s: {
                        [style.type]: style.value,
                    },
                };
                // value = Tools.fillObjectMatrix(endRow - startRow + 1, endColumn - startColumn + 1, colorObj);
                for (let r = startRow; r <= endRow; r++) {
                    for (let c = startColumn; c <= endColumn; c++) {
                        cellValue.setValue(r, c, colorObj);
                    }
                }
            }
        }

        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            range: ranges,
            worksheetId,
            workbookId,
            cellValue: cellValue.getMatrix(),
        };

        const undoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            setRangeValuesMutationParams
        );

        const result = commandService.executeCommand(SetRangeValuesMutation.id, setRangeValuesMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetRangeValuesMutation.id, undoSetRangeValuesMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetRangeValuesMutation.id, setRangeValuesMutationParams);
                },
            });

            return true;
        }

        return false;
    },
};

/**
 * Set bold font style to currently selected ranges. If the cell is already bold then it will cancel the bold style.
 */
export const SetBoldCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-bold',
    handler: async (accessor) => {
        const selection = accessor.get(SelectionManagerService).getLast();
        if (!selection) {
            return false;
        }

        const worksheet = accessor
            .get(IUniverInstanceService)
            .getCurrentUniverSheetInstance()

            .getActiveSheet();
        const currentlyBold =
            worksheet.getRange(selection.primary.actualRow, selection.primary.actualColumn).getFontWeight() ===
            FontWeight.BOLD;

        const setStyleParams: ISetStyleParams<BooleanNumber> = {
            style: {
                type: 'bl',
                value: currentlyBold ? BooleanNumber.FALSE : BooleanNumber.TRUE,
            },
        };

        return accessor.get(ICommandService).executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

/**
 * Set italic font style to currently selected ranges. If the cell is already italic then it will cancel the italic style.
 */
export const SetItalicCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-italic',
    handler: async (accessor) => {
        const selection = accessor.get(SelectionManagerService).getLast();
        if (!selection) {
            return false;
        }

        const worksheet = accessor
            .get(IUniverInstanceService)
            .getCurrentUniverSheetInstance()

            .getActiveSheet();
        let currentlyItalic = true;
        if (selection.primary) {
            currentlyItalic =
                worksheet.getRange(selection.primary.startRow, selection.primary.startColumn).getFontStyle() ===
                FontItalic.ITALIC;
        }

        const setStyleParams: ISetStyleParams<BooleanNumber> = {
            style: {
                type: 'it',
                value: currentlyItalic ? BooleanNumber.FALSE : BooleanNumber.TRUE,
            },
        };

        return accessor.get(ICommandService).executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

/**
 * Set underline font style to currently selected ranges. If the cell is already underline then it will cancel the underline style.
 */
export const SetUnderlineCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-underline',
    handler: async (accessor) => {
        const selection = accessor.get(SelectionManagerService).getLast();
        if (!selection) {
            return false;
        }

        const worksheet = accessor
            .get(IUniverInstanceService)
            .getCurrentUniverSheetInstance()

            .getActiveSheet();
        let currentlyUnderline = true;
        if (selection.primary) {
            currentlyUnderline = !!worksheet
                .getRange(selection.primary.startRow, selection.primary.startColumn)
                .getUnderline().s;
        }

        const setStyleParams: ISetStyleParams<{ s: number }> = {
            style: {
                type: 'ul',
                value: {
                    s: currentlyUnderline ? BooleanNumber.FALSE : BooleanNumber.TRUE,
                },
            },
        };

        return accessor.get(ICommandService).executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

/**
 * Set strike through font style to currently selected ranges. If the cell is already stroke then it will cancel the stroke style.
 */
export const SetStrikeThroughCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-stroke',
    handler: async (accessor) => {
        const selection = accessor.get(SelectionManagerService).getLast();
        if (!selection) {
            return false;
        }

        const worksheet = accessor
            .get(IUniverInstanceService)
            .getCurrentUniverSheetInstance()

            .getActiveSheet();
        let currentlyStrokeThrough = true;
        if (selection.primary) {
            currentlyStrokeThrough = !!worksheet
                .getRange(selection.primary.actualRow, selection.primary.actualColumn)
                .getStrikeThrough().s;
        }

        const setStyleParams: ISetStyleParams<{ s: number }> = {
            style: {
                type: 'st',
                value: { s: currentlyStrokeThrough ? BooleanNumber.FALSE : BooleanNumber.TRUE },
            },
        };

        return accessor.get(ICommandService).executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

/**
 * Set overline font style to currently selected ranges. If the cell is already overline then it will cancel the overline style.
 */
export const SetOverlineCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-overline',
    handler: async (accessor) => {
        const selection = accessor.get(SelectionManagerService).getLast();
        if (!selection) {
            return false;
        }

        const worksheet = accessor
            .get(IUniverInstanceService)
            .getCurrentUniverSheetInstance()

            .getActiveSheet();
        let currentlyOverline = true;
        if (selection.primary) {
            currentlyOverline = !!worksheet
                .getRange(selection.primary.startRow, selection.primary.startColumn)
                .getOverline().s;
        }

        const setStyleParams: ISetStyleParams<{ s: number }> = {
            style: {
                type: 'ol',
                value: {
                    s: currentlyOverline ? BooleanNumber.FALSE : BooleanNumber.TRUE,
                },
            },
        };

        return accessor.get(ICommandService).executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetFontFamilyCommandParams {
    value: string;
}

export const SetFontFamilyCommand: ICommand<ISetFontFamilyCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-font-family',
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleParams<string> = {
            style: {
                type: 'ff',
                value: params.value,
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetFontSizeCommandParams {
    value: number;
}

export const SetFontSizeCommand: ICommand<ISetFontSizeCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-font-size',
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleParams<number> = {
            style: {
                type: 'fs',
                value: params.value,
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetColorCommandParams {
    value: string;
}

export const SetTextColorCommand: ICommand<ISetColorCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-text-color',
    handler: async (accessor, params) => {
        if (!params || !params.value) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleParams<IColorStyle> = {
            style: {
                type: 'cl',
                value: {
                    rgb: params.value,
                },
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

export const ResetTextColorCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.reset-text-color',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleParams<IColorStyle> = {
            style: {
                type: 'cl',
                value: {
                    rgb: null, // use null to reset text color
                },
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

export const SetBackgroundColorCommand: ICommand<ISetColorCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-background-color',
    handler: async (accessor, params) => {
        if (!params || !params.value) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleParams<IColorStyle> = {
            style: {
                type: 'bg',
                value: {
                    rgb: params.value,
                },
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

export const ResetBackgroundColorCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.reset-background-color',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleParams<IColorStyle> = {
            style: {
                type: 'bg',
                value: {
                    rgb: null, // use null to reset background color
                },
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetVerticalTextAlignCommandParams {
    value: VerticalAlign;
}

export const SetVerticalTextAlignCommand: ICommand<ISetVerticalTextAlignCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-vertical-text-align',
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleParams<VerticalAlign> = {
            style: {
                type: 'vt',
                value: params.value,
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetHorizontalTextAlignCommandParams {
    value: HorizontalAlign;
}

export const SetHorizontalTextAlignCommand: ICommand<ISetHorizontalTextAlignCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-horizontal-text-align',
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleParams<HorizontalAlign> = {
            style: {
                type: 'ht',
                value: params.value,
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetTextWrapCommandParams {
    value: WrapStrategy;
}

export const SetTextWrapCommand: ICommand<ISetTextWrapCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-text-wrap',
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleParams<WrapStrategy> = {
            style: {
                type: 'tb',
                value: params.value,
            },
        };

        await commandService.executeCommand(SetStyleCommand.id, setStyleParams);
        // TODO: 下面这样写可以吗？
        return commandService.executeCommand(SetRowAutoHeightCommand.id);
    },
};

export interface ISetTextRotationCommandParams {
    value: number | string;
}

export const SetTextRotationCommand: ICommand<ISetTextRotationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-text-rotation',
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const value = typeof params.value === 'number' ? { a: params.value } : { a: 0, v: BooleanNumber.TRUE };

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleParams<ITextRotation> = {
            style: {
                type: 'tr',
                value,
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};
