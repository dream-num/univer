/**
 * Copyright 2023-present DreamNum Inc.
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
    ICommand, IDocumentBody, IMutationInfo, IStyleBase, ITextDecoration, ITextRun,
} from '@univerjs/core';
import {
    BaselineOffset,
    BooleanNumber,
    CommandType,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    MemoryCursor,
    TextX,
    TextXActionType,
} from '@univerjs/core';
import type { TextRange } from '@univerjs/engine-render';
import { serializeTextRange, TextSelectionManagerService } from '../../services/text-selection-manager.service';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';
import { getRichTextEditPath } from '../util';

function handleInlineFormat(
    preCommandId: string,
    params: object | undefined,
    textSelectionManagerService: TextSelectionManagerService,
    commandService: ICommandService
) {
    const { segmentId } = textSelectionManagerService.getActiveRange() ?? {};

    if (segmentId == null) {
        return false;
    }

    // eslint-disable-next-line ts/no-use-before-define
    return commandService.executeCommand(SetInlineFormatCommand.id, {
        segmentId,
        preCommandId,
        ...(params ?? {}),
    });
}

export interface ISetInlineFormatCommandParams {
    segmentId: string;
    preCommandId: string;
    value?: string;
}

const SetInlineFormatBoldCommandId = 'doc.command.set-inline-format-bold';
export const SetInlineFormatBoldCommand: ICommand = {
    id: SetInlineFormatBoldCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        return handleInlineFormat(
            SetInlineFormatBoldCommandId,
            params,
            textSelectionManagerService,
            commandService
        );
    },
};

const SetInlineFormatItalicCommandId = 'doc.command.set-inline-format-italic';
export const SetInlineFormatItalicCommand: ICommand = {
    id: SetInlineFormatItalicCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        return handleInlineFormat(
            SetInlineFormatItalicCommandId,
            params,
            textSelectionManagerService,
            commandService
        );
    },
};

const SetInlineFormatUnderlineCommandId = 'doc.command.set-inline-format-underline';
export const SetInlineFormatUnderlineCommand: ICommand = {
    id: SetInlineFormatUnderlineCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        return handleInlineFormat(
            SetInlineFormatUnderlineCommandId,
            params,
            textSelectionManagerService,
            commandService
        );
    },
};

const SetInlineFormatStrikethroughCommandId = 'doc.command.set-inline-format-strikethrough';
export const SetInlineFormatStrikethroughCommand: ICommand = {
    id: SetInlineFormatStrikethroughCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        return handleInlineFormat(
            SetInlineFormatStrikethroughCommandId,
            params,
            textSelectionManagerService,
            commandService
        );
    },
};

const SetInlineFormatSubscriptCommandId = 'doc.command.set-inline-format-subscript';
export const SetInlineFormatSubscriptCommand: ICommand = {
    id: SetInlineFormatSubscriptCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        return handleInlineFormat(
            SetInlineFormatSubscriptCommandId,
            params,
            textSelectionManagerService,
            commandService
        );
    },
};

const SetInlineFormatSuperscriptCommandId = 'doc.command.set-inline-format-superscript';
export const SetInlineFormatSuperscriptCommand: ICommand = {
    id: SetInlineFormatSuperscriptCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        return handleInlineFormat(
            SetInlineFormatSuperscriptCommandId,
            params,
            textSelectionManagerService,
            commandService
        );
    },
};

const SetInlineFormatFontSizeCommandId = 'doc.command.set-inline-format-fontsize';
export const SetInlineFormatFontSizeCommand: ICommand = {
    id: SetInlineFormatFontSizeCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        return handleInlineFormat(
            SetInlineFormatFontSizeCommandId,
            params,
            textSelectionManagerService,
            commandService
        );
    },
};

const SetInlineFormatFontFamilyCommandId = 'doc.command.set-inline-format-font-family';
export const SetInlineFormatFontFamilyCommand: ICommand = {
    id: SetInlineFormatFontFamilyCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        return handleInlineFormat(
            SetInlineFormatFontFamilyCommandId,
            params,
            textSelectionManagerService,
            commandService
        );
    },
};

const SetInlineFormatTextColorCommandId = 'doc.command.set-inline-format-text-color';
export const SetInlineFormatTextColorCommand: ICommand = {
    id: SetInlineFormatTextColorCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        return handleInlineFormat(
            SetInlineFormatTextColorCommandId,
            params,
            textSelectionManagerService,
            commandService
        );
    },
};

const SetInlineFormatTextBackgroundColorCommandId = 'doc.command.set-inline-format-text-background-color';
export const SetInlineFormatTextBackgroundColorCommand: ICommand = {
    id: SetInlineFormatTextBackgroundColorCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        return handleInlineFormat(
            SetInlineFormatTextBackgroundColorCommandId,
            params,
            textSelectionManagerService,
            commandService
        );
    },
};

const ResetInlineFormatTextBackgroundColorCommandId = 'doc.command.reset-inline-format-text-background-color';
export const ResetInlineFormatTextBackgroundColorCommand: ICommand = {
    id: ResetInlineFormatTextBackgroundColorCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        return handleInlineFormat(
            ResetInlineFormatTextBackgroundColorCommandId,
            params,
            textSelectionManagerService,
            commandService
        );
    },
};

const COMMAND_ID_TO_FORMAT_KEY_MAP: Record<string, keyof IStyleBase> = {
    [SetInlineFormatBoldCommand.id]: 'bl',
    [SetInlineFormatItalicCommand.id]: 'it',
    [SetInlineFormatUnderlineCommand.id]: 'ul',
    [SetInlineFormatStrikethroughCommand.id]: 'st',
    [SetInlineFormatFontSizeCommand.id]: 'fs',
    [SetInlineFormatFontFamilyCommand.id]: 'ff',
    [SetInlineFormatTextColorCommand.id]: 'cl',
    [SetInlineFormatTextBackgroundColorCommand.id]: 'bg',
    [ResetInlineFormatTextBackgroundColorCommand.id]: 'bg',
    [SetInlineFormatSubscriptCommand.id]: 'va',
    [SetInlineFormatSuperscriptCommand.id]: 'va',
};

export const SetInlineFormatCommand: ICommand<ISetInlineFormatCommandParams> = {
    id: 'doc.command.set-inline-format',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor, params: ISetInlineFormatCommandParams) => {
        const { segmentId, value, preCommandId } = params;
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const selections = textSelectionManagerService.getSelections();

        if (!Array.isArray(selections) || selections.length === 0) {
            return false;
        }

        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (!docDataModel) {
            return false;
        }

        const unitId = docDataModel.getUnitId();

        let formatValue;

        switch (preCommandId) {
            case SetInlineFormatBoldCommand.id: // fallthrough
            case SetInlineFormatItalicCommand.id: // fallthrough
            case SetInlineFormatUnderlineCommand.id: // fallthrough
            case SetInlineFormatStrikethroughCommand.id: // fallthrough
            case SetInlineFormatSubscriptCommand.id: // fallthrough
            case SetInlineFormatSuperscriptCommand.id: {
                formatValue = getReverseFormatValueInSelection(
                    docDataModel.getBody()!.textRuns!,
                    preCommandId,
                    selections
                );

                break;
            }

            case SetInlineFormatFontSizeCommand.id:
            case SetInlineFormatFontFamilyCommand.id: {
                formatValue = value;
                break;
            }

            case SetInlineFormatTextColorCommand.id:
            case SetInlineFormatTextBackgroundColorCommand.id: {
                formatValue = {
                    rgb: value,
                };
                break;
            }

            case ResetInlineFormatTextBackgroundColorCommand.id: {
                formatValue = {
                    rgb: null,
                };
                break;
            }

            default: {
                throw new Error(`Unknown command: ${preCommandId} in handleInlineFormat`);
            }
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: selections.map(serializeTextRange),
            },
        };

        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        const memoryCursor = new MemoryCursor();
        memoryCursor.reset();

        for (const selection of selections) {
            const { startOffset, endOffset } = selection;

            const body: IDocumentBody = {
                dataStream: '',
                textRuns: [
                    {
                        st: 0,
                        ed: endOffset - startOffset,
                        ts: {
                            [COMMAND_ID_TO_FORMAT_KEY_MAP[preCommandId]]: formatValue,
                        },
                    },
                ],
            };

            const len = startOffset - memoryCursor.cursor;

            if (len !== 0) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len,
                    segmentId,
                });
            }

            textX.push({
                t: TextXActionType.RETAIN,
                body,
                len: endOffset - startOffset,
                segmentId,
            });

            memoryCursor.reset();
            memoryCursor.moveCursor(endOffset);
        }

        const path = getRichTextEditPath(docDataModel, segmentId);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

function isTextDecoration(value: unknown | ITextDecoration): value is ITextDecoration {
    return value !== null && typeof value === 'object';
}

/**
 * When clicking on a Bold menu item, you should un-bold if there is bold in the selections,
 * or bold if there is no bold text. This method is used to get the reverse style value calculated
 * from textRuns in the selection
 */
function getReverseFormatValueInSelection(
    textRuns: ITextRun[],
    preCommandId: string,
    selections: TextRange[]
): BooleanNumber | ITextDecoration | BaselineOffset {
    let ti = 0;
    let si = 0;
    const key: keyof IStyleBase = COMMAND_ID_TO_FORMAT_KEY_MAP[preCommandId];

    while (ti !== textRuns.length && si !== selections.length) {
        const { startOffset, endOffset } = selections[si];

        // TODO: @jocs handle sid in textRun
        const { st, ed, ts } = textRuns[ti];

        if (endOffset! <= st) {
            si++;
        } else if (ed <= startOffset!) {
            ti++;
        } else {
            if (/bl|it/.test(key)) {
                return ts?.[key] === BooleanNumber.TRUE ? BooleanNumber.FALSE : BooleanNumber.TRUE;
            }

            if (/ul|st/.test(key)) {
                return isTextDecoration(ts?.[key]) && (ts?.[key] as ITextDecoration).s === BooleanNumber.TRUE
                    ? {
                        s: BooleanNumber.FALSE,
                    }
                    : {
                        s: BooleanNumber.TRUE,
                    };
            }

            if (/va/.test(key)) {
                if (preCommandId === SetInlineFormatSubscriptCommand.id) {
                    return ts?.[key] === BaselineOffset.SUBSCRIPT
                        ? BaselineOffset.NORMAL
                        : BaselineOffset.SUBSCRIPT;
                } else {
                    return ts?.[key] === BaselineOffset.SUPERSCRIPT
                        ? BaselineOffset.NORMAL
                        : BaselineOffset.SUPERSCRIPT;
                }
            }

            ti++;
        }
    }

    if (/bl|it/.test(key)) {
        return BooleanNumber.TRUE;
    } else if (/ul|st/.test(key)) {
        return {
            s: BooleanNumber.TRUE,
        };
    } else {
        return preCommandId === SetInlineFormatSubscriptCommand.id
            ? BaselineOffset.SUBSCRIPT
            : BaselineOffset.SUPERSCRIPT;
    }
}
