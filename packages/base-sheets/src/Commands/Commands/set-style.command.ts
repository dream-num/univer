import { IAccessor } from '@wendellhu/redi';
import {
    BooleanNumber,
    CommandType,
    FontItalic,
    FontWeight,
    HorizontalAlign,
    IBorderData,
    IColorStyle,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IRangeData,
    IStyleData,
    ITextRotation,
    IUndoRedoService,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Tools,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';

import { ISetRangeStyleMutationParams, SetRangeStyleMutation, SetRangeStyleUndoMutationFactory } from '../Mutations/set-range-styles.mutation';
import { ISelectionManager } from '../../Services/tokens';

export interface IStyleTypeValue<T> {
    type: keyof IStyleData;
    value: T | T[][];
}

export interface ISetStyleParams<T> {
    style: IStyleTypeValue<T>;
    ranges?: IRangeData[];
    workbookId?: string;
    worksheetId?: string;
}

// TODO: @wzhudev: move parameters logic from BasicWorksheetController to here. 30th Aug.

/**
 * The command to set cell style.
 * Set style to a bunch of ranges.
 */
export const SetStyleCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-style',

    handler: async <T>(accessor: IAccessor, params: ISetStyleParams<T>) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const selectionManager = accessor.get(ISelectionManager);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const ranges = params.ranges || selectionManager.getCurrentSelections();
        if (!ranges) {
            return false;
        }

        const workbookId = params.workbookId || currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = params.worksheetId || currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        const style = params.style;

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

        const undoSetRangeStyleMutationParams: ISetRangeStyleMutationParams = SetRangeStyleUndoMutationFactory(accessor, setRangeStyleMutationParams);

        const result = commandService.executeCommand(SetRangeStyleMutation.id, setRangeStyleMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet', // TODO: this URI is fake: would be replace with Univer business instance id
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
    // TODO@wzhudev: toggle bold command?
    type: CommandType.COMMAND,
    id: 'sheet.command.set-bold',
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const selectionManager = accessor.get(ISelectionManager);
        const currentlyBold = selectionManager.getCurrentCell()?.getFontWeight() === FontWeight.BOLD;

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
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const selectionManager = accessor.get(ISelectionManager);
        const currentlyItalic = selectionManager.getCurrentCell()?.getFontStyle() === FontItalic.ITALIC;

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
        const selectionManager = accessor.get(ISelectionManager);
        const currentlyUnderline = !!selectionManager.getCurrentCell()?.getUnderline().s;

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
        const selectionManager = accessor.get(ISelectionManager);
        const currentlyStrokeThrough = !!selectionManager.getCurrentCell()?.getStrikeThrough().s;

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
    fontFamily: string;
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
                value: params.fontFamily,
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
    // all subsequent mutations should succeed inorder to make the whole process succeed
    // Promise.all([]).then(() => true),
};

export interface ISetFontSizeCommandParams {
    fontSize: number;
}

export const SetFontSizeCommand: ICommand<ISetFontSizeCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-font-family',
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleParams<number> = {
            style: {
                type: 'fs',
                value: params.fontSize,
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetColorCommandParams {
    color: IColorStyle;
}

export const SetTextColorCommand: ICommand<ISetColorCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-font-family',
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleParams<IColorStyle> = {
            style: {
                type: 'cl',
                value: params.color,
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
                value: params.color,
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetCellBorderCommandParams {
    border: IBorderData;
}

export const SetCellBorderCommand: ICommand<ISetCellBorderCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-cell-border',
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleParams<IBorderData> = {
            style: {
                type: 'bd',
                value: params.border,
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetVerticalTextAlignCommandParams {
    align: VerticalAlign;
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
                value: params.align,
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetHorizontalTextAlignCommandParams {
    align: HorizontalAlign;
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
                value: params.align,
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetTextWrapCommandParams {
    wrap: WrapStrategy;
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
                value: params.wrap,
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetTextRotationCommandParams {
    rotation: ITextRotation;
}

export const SetTextRotationCommand: ICommand<ISetTextRotationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-text-rotation',
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleParams<ITextRotation> = {
            style: {
                type: 'tr',
                value: params.rotation,
            },
        };

        return commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    },
};
