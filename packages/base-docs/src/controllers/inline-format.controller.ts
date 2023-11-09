import { ITextSelectionRenderManager } from '@univerjs/base-render';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import {
    SetInlineFormatBoldCommand,
    SetInlineFormatCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from '../commands/commands/inline-format.command';
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
            SetInlineFormatFontSizeCommand.id,
            SetInlineFormatFontFamilyCommand.id,
            SetInlineFormatTextColorCommand.id,
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
        const { segmentId } = this._textSelectionRenderManager.getActiveRange() ?? {};

        if (segmentId == null) {
            return;
        }

        this._commandService.executeCommand(SetInlineFormatCommand.id, {
            segmentId,
            preCommandId: command.id,
            ...(command.params ?? {}),
        });

        const REFRESH_SELECTION_COMMAND_LIST = [
            SetInlineFormatBoldCommand.id,
            SetInlineFormatFontSizeCommand.id,
            SetInlineFormatFontFamilyCommand.id,
        ];

        /**
         * refresh selection.
         */
        if (REFRESH_SELECTION_COMMAND_LIST.includes(command.id)) {
            this._textSelectionManagerService.refreshSelection();
        }
    }
}
