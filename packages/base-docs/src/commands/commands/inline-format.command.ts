import type { TextRange } from '@univerjs/base-render';
import type { ICommand, IDocumentBody, IMutationInfo, IStyleBase, ITextDecoration, ITextRun } from '@univerjs/core';
import {
    BooleanNumber,
    CommandType,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    MemoryCursor,
} from '@univerjs/core';

import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';

export interface ISetInlineFormatCommandParams {
    segmentId: string;
    preCommandId: string;
    value?: string;
}

export const SetInlineFormatBoldCommand: ICommand = {
    id: 'doc.command.set-inline-format-bold',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const SetInlineFormatItalicCommand: ICommand = {
    id: 'doc.command.set-inline-format-italic',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const SetInlineFormatUnderlineCommand: ICommand = {
    id: 'doc.command.set-inline-format-underline',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const SetInlineFormatStrikethroughCommand: ICommand = {
    id: 'doc.command.set-inline-format-strikethrough',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const SetInlineFormatFontSizeCommand: ICommand = {
    id: 'doc.command.set-inline-format-fontsize',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const SetInlineFormatFontFamilyCommand: ICommand = {
    id: 'doc.command.set-inline-format-font-family',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const SetInlineFormatTextColorCommand: ICommand = {
    id: 'doc.command.set-inline-format-text-color',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const SetInlineFormatCommand: ICommand<ISetInlineFormatCommandParams> = {
    id: 'doc.command.set-inline-format',
    type: CommandType.COMMAND,
    handler: async (accessor, params: ISetInlineFormatCommandParams) => {
        const { segmentId, value, preCommandId } = params;
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const currentUniverService = accessor.get(IUniverInstanceService);

        const selections = textSelectionManagerService.getSelections();

        if (!Array.isArray(selections) || selections.length === 0) {
            return false;
        }

        let docsModel = currentUniverService.getCurrentUniverDocInstance();
        let unitId = docsModel.getUnitId();

        // When setting the formula bar style, the effect will be displayed in the cell editor,
        // and the formula bar only displays plain text.
        if (unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
            docsModel = currentUniverService.getUniverDocInstance(DOCS_NORMAL_EDITOR_UNIT_ID_KEY)!;
            unitId = docsModel.getUnitId();
        }

        let formatValue;

        const COMMAND_ID_TO_FORMAT_KEY_MAP: Record<string, keyof IStyleBase> = {
            [SetInlineFormatBoldCommand.id]: 'bl',
            [SetInlineFormatItalicCommand.id]: 'it',
            [SetInlineFormatUnderlineCommand.id]: 'ul',
            [SetInlineFormatStrikethroughCommand.id]: 'st',
            [SetInlineFormatFontSizeCommand.id]: 'fs',
            [SetInlineFormatFontFamilyCommand.id]: 'ff',
            [SetInlineFormatTextColorCommand.id]: 'cl',
        };

        switch (preCommandId) {
            case SetInlineFormatBoldCommand.id: // fallthrough
            case SetInlineFormatItalicCommand.id: // fallthrough
            case SetInlineFormatUnderlineCommand.id: // fallthrough
            case SetInlineFormatStrikethroughCommand.id: {
                formatValue = getReverseFormatValueInSelection(
                    docsModel.body!.textRuns!,
                    COMMAND_ID_TO_FORMAT_KEY_MAP[preCommandId],
                    selections
                );

                break;
            }

            case SetInlineFormatFontSizeCommand.id:
            case SetInlineFormatFontFamilyCommand.id: {
                formatValue = value;
                break;
            }

            case SetInlineFormatTextColorCommand.id: {
                formatValue = {
                    rgb: value,
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
                mutations: [],
            },
        };

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
                doMutation.params!.mutations.push({
                    t: 'r',
                    len,
                    segmentId,
                });
            }

            doMutation.params!.mutations.push({
                t: 'r',
                body,
                len: endOffset - startOffset,
                segmentId,
            });

            memoryCursor.reset();
            memoryCursor.moveCursor(endOffset);
        }

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        const REFRESH_SELECTION_COMMAND_LIST = [
            SetInlineFormatBoldCommand.id,
            SetInlineFormatFontSizeCommand.id,
            SetInlineFormatFontFamilyCommand.id,
        ];

        /**
         * refresh selection.
         */
        if (REFRESH_SELECTION_COMMAND_LIST.includes(preCommandId)) {
            textSelectionManagerService.refreshSelection();
        }

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: RichTextEditingMutation.id, params: result }],
                redoMutations: [{ id: RichTextEditingMutation.id, params: doMutation.params }],
                undo() {
                    commandService.syncExecuteCommand(RichTextEditingMutation.id, result);
                    if (REFRESH_SELECTION_COMMAND_LIST.includes(preCommandId)) {
                        textSelectionManagerService.refreshSelection();
                    }

                    return true;
                },
                redo() {
                    commandService.syncExecuteCommand(RichTextEditingMutation.id, doMutation.params);
                    if (REFRESH_SELECTION_COMMAND_LIST.includes(preCommandId)) {
                        textSelectionManagerService.refreshSelection();
                    }

                    return true;
                },
            });

            return true;
        }

        return false;
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
    key: keyof IStyleBase,
    selections: TextRange[]
): BooleanNumber | ITextDecoration {
    let ti = 0;
    let si = 0;

    while (ti !== textRuns.length && si !== selections.length) {
        const { startOffset, endOffset } = selections[si];

        // TODO: @jocs handle sid in textRun
        const { st, ed, ts } = textRuns[ti];

        if (endOffset! <= st) {
            si++;
        } else if (ed <= startOffset!) {
            ti++;
        } else {
            if (ts?.[key] == null) {
                return /bl|it/.test(key)
                    ? BooleanNumber.TRUE
                    : {
                          s: BooleanNumber.TRUE,
                      };
            }

            if (ts[key] === BooleanNumber.FALSE) {
                return BooleanNumber.TRUE;
            }

            if (isTextDecoration(ts[key]) && (ts[key] as ITextDecoration).s === BooleanNumber.FALSE) {
                return {
                    s: BooleanNumber.TRUE,
                };
            }

            ti++;
        }
    }

    return /bl|it/.test(key)
        ? BooleanNumber.FALSE
        : {
              s: BooleanNumber.FALSE,
          };
}
