import { ITextSelectionRenderManager } from '@univerjs/base-render';
import {
    BooleanNumber,
    Disposable,
    getTextIndexByCursor,
    ICommandInfo,
    ICommandService,
    IDocumentBody,
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

        // console.log(command, docsModel);

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
                            bl: BooleanNumber.TRUE,
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
