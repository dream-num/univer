import { ITextSelectionRangeWithStyle, ITextSelectionRenderManager } from '@univerjs/base-render';
import {
    BooleanNumber,
    Disposable,
    getTextIndexByCursor,
    ICommandInfo,
    ICommandService,
    IDocumentBody,
    IStyleBase,
    ITextDecoration,
    ITextRun,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import MemoryCursor from '../Basics/memoryCursor';
import {
    SetInlineFormatBoldCommand,
    SetInlineFormatCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatUnderlineCommand,
} from '../commands/commands/inline-format.command';
import { IRichTextEditingMutationParams, RichTextEditingMutation } from '../commands/mutations/core-editing.mutation';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

/**
 * Used to manage the addition and removal of inline styles,
 * and to assemble the command parameters here,
 * some of the logic may be moved to the command, as the command is testable.
 */
@OnLifecycle(LifecycleStages.Rendered, InlineFormatController)
export class InlineFormatController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        const updateCommandList = [
            SetInlineFormatBoldCommand.id,
            SetInlineFormatItalicCommand.id,
            SetInlineFormatUnderlineCommand.id,
            SetInlineFormatStrikethroughCommand.id,
        ];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                this.handleInlineFormat(command);
            })
        );
    }

    private handleInlineFormat(command: ICommandInfo) {
        const segmentId = this._textSelectionRenderManager.getActiveRange()?.segmentId;
        const selections = this._textSelectionManagerService.getSelections();

        if (segmentId == null || !Array.isArray(selections) || selections.length === 0) {
            return;
        }

        const docsModel = this._currentUniverService.getCurrentUniverDocInstance();
        const unitId = docsModel.getUnitId();

        let formatValue;

        const COMMAND_ID_TO_FORMAT_KEY_MAP: Record<string, keyof IStyleBase> = {
            [SetInlineFormatBoldCommand.id]: 'bl',
            [SetInlineFormatItalicCommand.id]: 'it',
            [SetInlineFormatUnderlineCommand.id]: 'ul',
            [SetInlineFormatStrikethroughCommand.id]: 'st',
        };

        switch (command.id) {
            case SetInlineFormatBoldCommand.id: // fallthrough
            case SetInlineFormatItalicCommand.id: // fallthrough
            case SetInlineFormatUnderlineCommand.id: // fallthrough
            case SetInlineFormatStrikethroughCommand.id: {
                formatValue = getReverseFormatValueInSelection(
                    docsModel.body!.textRuns!,
                    COMMAND_ID_TO_FORMAT_KEY_MAP[command.id],
                    selections
                );

                break;
            }

            default: {
                throw new Error(`Unknown command: ${command.id} in handleInlineFormat`);
            }
        }

        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        const memoryCursor = new MemoryCursor();

        memoryCursor.reset();

        for (const selection of selections) {
            const { cursorStart, cursorEnd, isStartBack, isEndBack } = selection;
            const textStart = getTextIndexByCursor(cursorStart, isStartBack);
            const textEnd = getTextIndexByCursor(cursorEnd, isEndBack);

            const body: IDocumentBody = {
                dataStream: '',
                textRuns: [
                    {
                        st: 0,
                        ed: textEnd - textStart,
                        ts: {
                            [COMMAND_ID_TO_FORMAT_KEY_MAP[command.id]]: formatValue,
                        },
                    },
                ],
            };

            const len = textStart + 1 - memoryCursor.cursor;
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
                len: textEnd - textStart,
                segmentId,
            });

            memoryCursor.reset();
            memoryCursor.moveCursor(textEnd + 1);
        }

        this._commandService.executeCommand(SetInlineFormatCommand.id, {
            unitId,
            doMutation,
        });

        const REFRESH_SELECTION_COMMAND_LIST = [SetInlineFormatBoldCommand.id];

        if (REFRESH_SELECTION_COMMAND_LIST.includes(command.id)) {
            this._textSelectionManagerService.refreshSelection();
        }
    }
}

function isTextDecoration(value: unknown | ITextDecoration): value is ITextDecoration {
    return value !== null && typeof value === 'object';
}

/**
 * When clicking on a Bold menu item, you should un-bold if there is bold in the selections,
 * or bold if there is no bold text. This method is used to get the style value calculated
 * from textRuns in the selection
 */
function getReverseFormatValueInSelection(
    textRuns: ITextRun[],
    key: keyof IStyleBase,
    selections: ITextSelectionRangeWithStyle[]
): BooleanNumber | ITextDecoration {
    let ti = 0;
    let si = 0;

    while (ti !== textRuns.length && si !== selections.length) {
        const { cursorStart, cursorEnd, isStartBack, isEndBack } = selections[si];

        const textStart = getTextIndexByCursor(cursorStart, isStartBack) + 1;
        const textEnd = getTextIndexByCursor(cursorEnd, isEndBack) + 1;

        // TODO: @jocs handle sid in textRun
        const { st, ed, ts } = textRuns[ti];

        if (textEnd <= st) {
            si++;
        } else if (ed <= textStart) {
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
