import {
    BooleanNumber,
    CommandType,
    FontItalic,
    FontWeight,
    HorizontalAlign,
    IColorStyle,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IStyleData,
    ITextRotation,
    IUndoRedoService,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Tools,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../services/selection-manager.service';
import {
    ISetRangeStyleMutationParams,
    SetRangeStyleMutation,
    SetRangeStyleUndoMutationFactory,
} from '../mutations/set-range-styles.mutation';

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
        const currentUniverService = accessor.get(ICurrentUniverService);

        const ranges = selectionManagerService.getRangeDatas();
        if (!ranges?.length) {
            return false;
        }

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService
            .getCurrentUniverSheetInstance()
            .getWorkBook()
            .getActiveSheet()
            .getSheetId();
        const style = params.style;

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        let value: ObjectMatrixPrimitiveType<IStyleData>;
        for (let i = 0; i < ranges.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = ranges[i];
            if (Tools.isArray(style.value)) {
                const matrix = new ObjectMatrix<IStyleData>();
                for (let r = 0; r < endRow - startRow + 1; r++) {
                    for (let c = 0; c < endColumn - startColumn + 1; c++) {
                        matrix.setValue(r, c, {
                            [style.type]: style.value[r][c],
                        });
                    }
                }
                value = matrix.getData();
            } else {
                const colorObj: IStyleData = {
                    [style.type]: style.value,
                };
                value = Tools.fillObjectMatrix(endRow - startRow + 1, endColumn - startColumn + 1, colorObj);
            }
        }

        const setRangeStyleMutationParams: ISetRangeStyleMutationParams = {
            range: ranges,
            worksheetId,
            workbookId,
            value: value!,
        };

        const undoSetRangeStyleMutationParams: ISetRangeStyleMutationParams = SetRangeStyleUndoMutationFactory(
            accessor,
            setRangeStyleMutationParams
        );

        const result = commandService.executeCommand(SetRangeStyleMutation.id, setRangeStyleMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetRangeStyleMutation.id, undoSetRangeStyleMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetRangeStyleMutation.id, setRangeStyleMutationParams);
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
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selectedRange = selectionManagerService.getLast()?.rangeData;
        const currentUniverService = accessor.get(ICurrentUniverService);
        const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();

        let currentlyBold = true;
        if (selectedRange) {
            currentlyBold =
                worksheet.getRange(selectedRange.startRow, selectedRange.startColumn).getFontWeight() ===
                FontWeight.BOLD;
        }

        const setStyleParams: ISetStyleParams<BooleanNumber> = {
            style: {
                type: 'bl',
                value: currentlyBold ? BooleanNumber.FALSE : BooleanNumber.TRUE,
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

/**
 * Set italic font style to currently selected ranges. If the cell is already italic then it will cancel the italic style.
 */
export const SetItalicCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-italic',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const cellRange = selectionManagerService.getLast()?.cellRange;
        const currentUniverService = accessor.get(ICurrentUniverService);
        const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();

        let currentlyItalic = true;
        if (cellRange) {
            currentlyItalic = worksheet.getRange(cellRange.row, cellRange.column).getFontStyle() === FontItalic.ITALIC;
        }

        const setStyleParams: ISetStyleParams<BooleanNumber> = {
            style: {
                type: 'it',
                value: currentlyItalic ? BooleanNumber.FALSE : BooleanNumber.TRUE,
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

/**
 * Set underline font style to currently selected ranges. If the cell is already underline then it will cancel the underline style.
 */
export const SetUnderlineCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-underline',
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const cellRange = selectionManagerService.getLast()?.cellRange;
        const currentUniverService = accessor.get(ICurrentUniverService);
        const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();

        let currentlyUnderline = true;
        if (cellRange) {
            currentlyUnderline = !!worksheet.getRange(cellRange.row, cellRange.column).getUnderline().s;
        }

        const setStyleParams: ISetStyleParams<{ s: number }> = {
            style: {
                type: 'ul',
                value: {
                    s: currentlyUnderline ? BooleanNumber.FALSE : BooleanNumber.TRUE,
                },
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

/**
 * Set strike through font style to currently selected ranges. If the cell is already stroke then it will cancel the stroke style.
 */
export const SetStrikeThroughCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-stroke',
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);

        const selectionManagerService = accessor.get(SelectionManagerService);
        const cellRange = selectionManagerService.getLast()?.cellRange;
        const currentUniverService = accessor.get(ICurrentUniverService);
        const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();

        let currentlyStrokeThrough = true;
        if (cellRange) {
            currentlyStrokeThrough = !!worksheet.getRange(cellRange.row, cellRange.column).getStrikeThrough().s;
        }

        const setStyleParams: ISetStyleParams<{ s: number }> = {
            style: {
                type: 'st',
                value: { s: currentlyStrokeThrough ? BooleanNumber.FALSE : BooleanNumber.TRUE },
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
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
        if (!params) {
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
                    rgb: '#000',
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
        if (!params) {
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
                    rgb: undefined,
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

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
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
