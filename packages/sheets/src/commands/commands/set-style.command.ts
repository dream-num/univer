/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {
    HorizontalAlign,
    IAccessor,
    ICellData,
    IColorStyle,
    ICommand,
    IRange,
    IStyleData,
    ITextRotation,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';

import type { ISheetCommandSharedParams } from '../utils/interface';
import {
    BooleanNumber,
    CommandType,
    FontItalic,
    FontWeight,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    sequenceExecute,
    Tools,
} from '@univerjs/core';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../mutations/set-range-values.mutation';
import { createRangeIteratorWithSkipFilteredRows } from './utils/selection-utils';
import { getSheetCommandTarget } from './utils/target-util';

export interface IStyleTypeValue<T> {
    type: keyof IStyleData;
    value: T | T[][];
}

interface ISetStyleCommonParams extends Partial<ISheetCommandSharedParams> {
    range?: IRange;
}

export interface ISetStyleCommandParams<T> extends ISetStyleCommonParams {
    style: IStyleTypeValue<T>;
}

/**
 * The command to set cell style.
 * Set style to a bunch of ranges.
 */
export const SetStyleCommand: ICommand<ISetStyleCommandParams<unknown>> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-style',

    handler: <T> (accessor: IAccessor, params: ISetStyleCommandParams<T>) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId, worksheet } = target;
        const { range, style } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);

        const ranges = range ? [range] : selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        if (!ranges?.length) {
            return false;
        }

        const cellValue = new ObjectMatrix<ICellData>();

        const iterator = createRangeIteratorWithSkipFilteredRows(worksheet);

        if (Tools.isArray(style.value)) {
            for (let i = 0; i < ranges.length; i++) {
                iterator.forOperableEach(ranges[i], (r, c, range) => {
                    cellValue.setValue(r, c, {
                        s: {
                            [style.type]: (style.value as T[][])[r - range.startRow][c - range.startColumn],
                        },
                    });
                });
            }
        } else {
            for (let i = 0; i < ranges.length; i++) {
                const styleObj: ICellData = {
                    s: {
                        [style.type]: style.value,
                    },
                };
                iterator.forOperableEach(ranges[i], (r, c) => cellValue.setValue(r, c, styleObj));
            }
        }

        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: cellValue.getMatrix(),
        };

        const undoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            setRangeValuesMutationParams
        );

        const setRangeValuesResult = commandService.syncExecuteCommand(
            SetRangeValuesMutation.id,
            setRangeValuesMutationParams
        );

        const { undos, redos } = accessor.get(SheetInterceptorService).onCommandExecute({
            id: SetStyleCommand.id,
            params,
        });

        const result = sequenceExecute([...redos], commandService);

        if (setRangeValuesResult && result.result) {
            undoRedoService.pushUndoRedo({
                unitID: setRangeValuesMutationParams.unitId,
                undoMutations: [{ id: SetRangeValuesMutation.id, params: undoSetRangeValuesMutationParams }, ...undos],
                redoMutations: [{ id: SetRangeValuesMutation.id, params: setRangeValuesMutationParams }, ...redos],
            });

            return true;
        }

        return false;
    },
};

/**
 * Set bold font style to currently selected ranges.
 * If the cell is already bold then it will cancel the bold style.
 */
export const SetBoldCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-bold',
    handler: (accessor) => {
        const selection = accessor.get(SheetsSelectionsService).getCurrentLastSelection();
        if (!selection) return false;

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const { worksheet } = target;
        const { actualRow, actualColumn } = selection.primary;
        const currentlyBold = worksheet.getRange(actualRow, actualColumn).getFontWeight() === FontWeight.BOLD;

        const setStyleParams: ISetStyleCommandParams<BooleanNumber> = {
            style: {
                type: 'bl',
                value: currentlyBold ? BooleanNumber.FALSE : BooleanNumber.TRUE,
            },
        };

        return accessor.get(ICommandService).syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    },
};

/**
 * Set italic font style to currently selected ranges.
 * If the cell is already italic then it will cancel the italic style.
 */
export const SetItalicCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-italic',
    handler: (accessor) => {
        const selection = accessor.get(SheetsSelectionsService).getCurrentLastSelection();
        if (!selection) return false;

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const { worksheet } = target;
        let currentlyItalic = true;

        if (selection.primary) {
            const { startRow, startColumn } = selection.primary;

            currentlyItalic = worksheet.getRange(startRow, startColumn).getFontStyle() === FontItalic.ITALIC;
        }

        const setStyleParams: ISetStyleCommandParams<BooleanNumber> = {
            style: {
                type: 'it',
                value: currentlyItalic ? BooleanNumber.FALSE : BooleanNumber.TRUE,
            },
        };

        return accessor.get(ICommandService).syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    },
};

/**
 * Set underline font style to currently selected ranges. If the cell is already underline then it will cancel the underline style.
 */
export const SetUnderlineCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-underline',
    handler: (accessor) => {
        const selection = accessor.get(SheetsSelectionsService).getCurrentLastSelection();
        if (!selection) return false;

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const { worksheet } = target;

        let currentlyUnderline = true;
        if (selection.primary) {
            currentlyUnderline = !!worksheet
                .getRange(selection.primary.startRow, selection.primary.startColumn)
                .getUnderline()
                .s;
        }

        const setStyleParams: ISetStyleCommandParams<{ s: number }> = {
            style: {
                type: 'ul',
                value: {
                    s: currentlyUnderline ? BooleanNumber.FALSE : BooleanNumber.TRUE,
                },
            },
        };

        return accessor.get(ICommandService).syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    },
};

/**
 * Set strike through font style to currently selected ranges. If the cell is already stroke then it will cancel the stroke style.
 */
export const SetStrikeThroughCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-stroke',
    handler: (accessor) => {
        const selection = accessor.get(SheetsSelectionsService).getCurrentLastSelection();
        if (!selection) return false;

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const { worksheet } = target;

        let currentlyStrokeThrough = true;
        if (selection.primary) {
            currentlyStrokeThrough = !!worksheet
                .getRange(selection.primary.actualRow, selection.primary.actualColumn)
                .getStrikeThrough()
                .s;
        }

        const setStyleParams: ISetStyleCommandParams<{ s: number }> = {
            style: {
                type: 'st',
                value: { s: currentlyStrokeThrough ? BooleanNumber.FALSE : BooleanNumber.TRUE },
            },
        };

        return accessor.get(ICommandService).syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    },
};

/**
 * Set overline font style to currently selected ranges. If the cell is already overline then it will cancel the overline style.
 */
export const SetOverlineCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-overline',
    handler: (accessor) => {
        const selection = accessor.get(SheetsSelectionsService).getCurrentLastSelection();
        if (!selection) return false;

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const { worksheet } = target;
        let currentlyOverline = true;
        if (selection.primary) {
            currentlyOverline = !!worksheet
                .getRange(selection.primary.startRow, selection.primary.startColumn)
                .getOverline()
                .s;
        }

        const setStyleParams: ISetStyleCommandParams<{ s: number }> = {
            style: {
                type: 'ol',
                value: {
                    s: currentlyOverline ? BooleanNumber.FALSE : BooleanNumber.TRUE,
                },
            },
        };

        return accessor.get(ICommandService).syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetFontFamilyCommandParams {
    value: string;
}

export const SetFontFamilyCommand: ICommand<ISetFontFamilyCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-font-family',
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleCommandParams<string> = {
            style: {
                type: 'ff',
                value: params.value,
            },
        };

        return commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetFontSizeCommandParams {
    value: number;
}

export const SetFontSizeCommand: ICommand<ISetFontSizeCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-font-size',
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleCommandParams<number> = {
            style: {
                type: 'fs',
                value: params.value,
            },
        };

        return commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetColorCommandParams {
    value: string | null;
}

export const SetTextColorCommand: ICommand<ISetColorCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-text-color',
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleCommandParams<IColorStyle> = {
            style: {
                type: 'cl',
                value: {
                    rgb: params.value,
                },
            },
        };

        return commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    },
};

export const ResetTextColorCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.reset-text-color',
    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleCommandParams<IColorStyle> = {
            style: {
                type: 'cl',
                value: {
                    rgb: null, // use null to reset text color
                },
            },
        };

        return commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    },
};

export const SetBackgroundColorCommand: ICommand<ISetColorCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-background-color',
    handler: (accessor, params) => {
        if (!params || !params.value) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleCommandParams<IColorStyle> = {
            style: {
                type: 'bg',
                value: {
                    rgb: params.value,
                },
            },
        };

        return commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    },
};

export const ResetBackgroundColorCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.reset-background-color',
    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleCommandParams<IColorStyle> = {
            style: {
                type: 'bg',
                value: {
                    rgb: null, // use null to reset background color
                },
            },
        };

        return commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetVerticalTextAlignCommandParams extends ISetStyleCommonParams {
    value: VerticalAlign;
}

export const SetVerticalTextAlignCommand: ICommand<ISetVerticalTextAlignCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-vertical-text-align',
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleCommandParams<VerticalAlign> = {
            unitId: params.unitId,
            subUnitId: params.subUnitId,
            range: params.range,
            style: {
                type: 'vt',
                value: params.value,
            },
        };

        return commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetHorizontalTextAlignCommandParams extends ISetStyleCommonParams {
    value: HorizontalAlign;
}

export const SetHorizontalTextAlignCommand: ICommand<ISetHorizontalTextAlignCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-horizontal-text-align',
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleCommandParams<HorizontalAlign> = {
            unitId: params.unitId,
            subUnitId: params.subUnitId,
            range: params.range,
            style: {
                type: 'ht',
                value: params.value,
            },
        };

        return commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetTextWrapCommandParams extends ISetStyleCommonParams {
    value: WrapStrategy;
}

export const SetTextWrapCommand: ICommand<ISetTextWrapCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-text-wrap',
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleCommandParams<WrapStrategy> = {
            unitId: params.unitId,
            subUnitId: params.subUnitId,
            range: params.range,
            style: {
                type: 'tb',
                value: params.value,
            },
        };

        return commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    },
};

export interface ISetTextRotationCommandParams extends ISetStyleCommonParams {
    value: number | string;
}

export const SetTextRotationCommand: ICommand<ISetTextRotationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-text-rotation',
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const value = typeof params.value === 'number' ? { a: params.value } : { a: 0, v: BooleanNumber.TRUE };

        const commandService = accessor.get(ICommandService);
        const setStyleParams: ISetStyleCommandParams<ITextRotation> = {
            unitId: params.unitId,
            subUnitId: params.subUnitId,
            range: params.range,
            style: {
                type: 'tr',
                value,
            },
        };

        return commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    },
};
