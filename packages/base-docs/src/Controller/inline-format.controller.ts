import { ITextSelectionRangeWithStyle, ITextSelectionRenderManager } from '@univerjs/base-render';
import {
    BooleanNumber,
    Disposable,
    getTextIndexByCursor,
    ICommandInfo,
    ICommandService,
    IDocumentBody,
    ITextRun,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import CommonParameter from '../Basics/commonParameter';
import { SetInlineFormatBoldCommand, SetInlineFormatCommand } from '../commands/commands/inline-format.command';
import { IRichTextEditingMutationParams, RichTextEditingMutation } from '../commands/mutations/core-editing.mutation';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

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
        const updateCommandList = [SetInlineFormatBoldCommand.id];

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

        switch (command.id) {
            case SetInlineFormatBoldCommand.id: {
                formatValue = getFormatValueInSelection(docsModel.body!.textRuns!, 'bl', selections);
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

        const commonParameter = new CommonParameter();

        commonParameter.reset();

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
                            bl: formatValue,
                        },
                    },
                ],
            };

            const len = textStart + 1 - commonParameter.cursor;
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

            commonParameter.reset();
            commonParameter.moveCursor(textEnd + 1);
        }

        this._commandService.executeCommand(SetInlineFormatCommand.id, {
            unitId,
            doMutation,
        });
    }
}

/**
 * When clicking on a Bold menu item, you should un-bold if there is bold in the selections,
 * or bold if there is no bold text. This method is used to get the style value calculated
 * from textRuns in the selection
 */
function getFormatValueInSelection(
    textRuns: ITextRun[],
    key: 'bl',
    selections: ITextSelectionRangeWithStyle[]
): BooleanNumber {
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
            if (ts?.[key] === BooleanNumber.TRUE) {
                return BooleanNumber.FALSE;
            }

            ti++;
        }
    }

    return BooleanNumber.TRUE;
}
