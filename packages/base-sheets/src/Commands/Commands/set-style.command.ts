import { IAccessor } from '@wendellhu/redi';
import { CommandType, ICommand, ICommandService, ICurrentUniverService, IRangeData, IStyleData, IUndoRedoService, ObjectMatrixPrimitiveType } from '@univerjs/core';

import { ISetRangeStyleMutationParams, SetRangeStyleMutation, SetRangeStyleUndoMutationFactory } from '../Mutations/set-range-styles.mutation';
import { ISelectionManager } from '../../Services/tokens';

export interface ISetStyleParams {
    range: IRangeData[];
    value: ObjectMatrixPrimitiveType<IStyleData>;
    workbookId: string;
    worksheetId: string;
}

/**
 * Set style to a bunch of ranges.
 */
export const SetStyleCommand: ICommand<ISetStyleParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-style',
    handler: async (accessor: IAccessor, params: ISetStyleParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const setRangeStyleMutationParams: ISetRangeStyleMutationParams = {
            range: params.range,
            worksheetId: params.worksheetId,
            workbookId: params.workbookId,
            value: params.value,
        };

        const undoSetRangeStyleMutationParams: ISetRangeStyleMutationParams = SetRangeStyleUndoMutationFactory(accessor, setRangeStyleMutationParams);

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(SetRangeStyleMutation.id, setRangeStyleMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: 'sheet', // TODO: this URI is fake
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
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selectionManager = accessor.get(ISelectionManager);
        const commandService = accessor.get(ICommandService);
        const selections = selectionManager.getCurrentSelections();
        const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();

        const setStyleParams: ISetStyleParams = {
            workbookId: workbook.getUnitId(),
            worksheetId: workbook.getActiveSheet().getSheetId(),
            range: selections,
            value: {}, // TODO@wzhudev: change this value to bold style or unset bold style
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
    handler: async (accessor, params) => true,
};

/**
 * Set underline font style to currently selected ranges. If the cell is already underline then it will cancel the underline style.
 */
export const SetUnderlineCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-underline',
    handler: async (accessor, params) => true,
};

/**
 * Set strike through font style to currently selected ranges. If the cell is already stroke then it will cancel the stroke style.
 */
export const SetStrikeThroughCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-stroke',
    handler: async (accessor) => true,
};

export const SetFontFamilyCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-font-family',
    handler: async (accessor) => true,
};

export const SetFontSizeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-font-family',
    handler: async (accessor) => true,
};

export const SetTextColorCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-font-family',
    handler: async (accessor) => true,
};

export const SetBackgroundColorCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-background-color',
    handler: async (accessor) => true,
};

export const SetCellBorderCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-cell-border',
    handler: async (accessor) => true,
};

export const SetSpanCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-span',
    handler: async (params) => true,
};

export const SetVerticalTextAlignCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-vertical-text-align',
    handler: async (params) => true,
};

export const SetHorizontalTextAlignCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-horizontal-text-align',
    handler: async (params) => true,
};

export const SetTextWrapCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-text-wrap',
    handler: async (params) => true,
};

export const SetTextRotationCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-text-rotation',
    handler: async (params) => true,
};
