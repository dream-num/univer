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
    DocumentDataModel,
    ICommand, IDocumentBody, IMutationInfo, IStyleBase, ITextDecoration, ITextRun,
    ITextStyle,
    Nullable,
} from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import {
    BaselineOffset, BooleanNumber, CommandType,
    DOC_RANGE_TYPE,
    ICommandService, IUniverInstanceService,
    JSONX, MemoryCursor,
    TextX, TextXActionType,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DocMenuStyleService } from '../../services/doc-menu-style.service';
import { getRichTextEditPath } from '../util';

function handleInlineFormat(
    preCommandId: string,
    params: object | undefined,
    commandService: ICommandService
) {
    // eslint-disable-next-line ts/no-use-before-define
    return commandService.executeCommand(SetInlineFormatCommand.id, {
        preCommandId,
        ...(params ?? {}),
    });
}

export interface ISetInlineFormatCommandParams {
    preCommandId: string;
    value?: string;
}

const SetInlineFormatBoldCommandId = 'doc.command.set-inline-format-bold';
export const SetInlineFormatBoldCommand: ICommand = {
    id: SetInlineFormatBoldCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);

        return handleInlineFormat(
            SetInlineFormatBoldCommandId,
            params,
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

        return handleInlineFormat(
            SetInlineFormatItalicCommandId,
            params,
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

        return handleInlineFormat(
            SetInlineFormatUnderlineCommandId,
            params,
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

        return handleInlineFormat(
            SetInlineFormatStrikethroughCommandId,
            params,
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

        return handleInlineFormat(
            SetInlineFormatSubscriptCommandId,
            params,
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

        return handleInlineFormat(
            SetInlineFormatSuperscriptCommandId,
            params,
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

        return handleInlineFormat(
            SetInlineFormatFontSizeCommandId,
            params,
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

        return handleInlineFormat(
            SetInlineFormatFontFamilyCommandId,
            params,
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

        return handleInlineFormat(
            SetInlineFormatTextColorCommandId,
            params,
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

        return handleInlineFormat(
            SetInlineFormatTextBackgroundColorCommandId,
            params,
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

        return handleInlineFormat(
            ResetInlineFormatTextBackgroundColorCommandId,
            params,
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
    // eslint-disable-next-line max-lines-per-function, complexity
    handler: async (accessor, params: ISetInlineFormatCommandParams) => {
        const { value, preCommandId } = params;
        const commandService = accessor.get(ICommandService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docMenuStyleService = accessor.get(DocMenuStyleService);

        const docRanges = docSelectionManagerService.getDocRanges();

        if (docRanges.length === 0) {
            return false;
        }

        const { segmentId } = docRanges[0];

        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (docDataModel == null) {
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
                    docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()!.textRuns!,
                    preCommandId,
                    docRanges
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
                textRanges: docRanges,
            },
        };

        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        const memoryCursor = new MemoryCursor();
        memoryCursor.reset();

        for (const range of docRanges) {
            let { startOffset, endOffset, rangeType } = range;

            if (startOffset == null || endOffset == null) {
                continue;
            }

            // Use to fix https://github.com/dream-num/univer-pro/issues/3101
            if (rangeType === DOC_RANGE_TYPE.RECT) {
                startOffset = startOffset - 1;
            }

            if (startOffset === endOffset) {
                // Cache the menu style for next input.
                const cacheStyle = docMenuStyleService.getStyleCache();
                const key = COMMAND_ID_TO_FORMAT_KEY_MAP[preCommandId];

                docMenuStyleService.setStyleCache(
                    {
                        [key]: cacheStyle?.[key] !== undefined
                            ? getReverseFormatValue(
                                cacheStyle,
                                key,
                                preCommandId
                            )
                            : formatValue,
                    }
                );
                continue;
            }

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
                });
            }

            textX.push({
                t: TextXActionType.RETAIN,
                body,
                len: endOffset - startOffset,
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

function getReverseFormatValue(ts: Nullable<ITextStyle>, key: keyof IStyleBase, preCommandId: string) {
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
}

/**
 * When clicking on a Bold menu item, you should un-bold if there is bold in the selections,
 * or bold if there is no bold text. This method is used to get the reverse style value calculated
 * from textRuns in the selection
 */

function getReverseFormatValueInSelection(
    textRuns: ITextRun[],
    preCommandId: string,
    docRanges: ITextRangeWithStyle[]
): BooleanNumber | ITextDecoration | BaselineOffset {
    let ti = 0;
    let si = 0;
    const key: keyof IStyleBase = COMMAND_ID_TO_FORMAT_KEY_MAP[preCommandId];

    while (ti !== textRuns.length && si !== docRanges.length) {
        const { startOffset, endOffset } = docRanges[si];

        // TODO: @jocs handle sid in textRun
        const { st, ed, ts } = textRuns[ti];

        if (endOffset! <= st) {
            si++;
        } else if (ed <= startOffset!) {
            ti++;
        } else {
            const reverseValue = getReverseFormatValue(ts, key, preCommandId);

            if (reverseValue !== undefined) {
                return reverseValue;
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
