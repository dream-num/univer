import { ITextSelectionRenderManager } from '@univerjs/base-render';
import { Disposable, ICommandInfo, ICommandService, ILogService, IUniverInstanceService } from '@univerjs/core';

import {
    DocCopyCommand,
    DocCutCommand,
    DocPasteCommand,
    InnerPasteCommand,
} from '../commands/commands/clipboard.command';
import { IDocClipboardService } from '../services/clipboard/clipboard.service';

export class DocClipboardController extends Disposable {
    constructor(
        @ILogService private readonly _logService: ILogService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IDocClipboardService private readonly _docClipboardService: IDocClipboardService,
        @ITextSelectionRenderManager private _textSelectionRenderManager: ITextSelectionRenderManager
    ) {
        super();
        this.commandExecutedListener();
    }

    initialize() {
        [DocCopyCommand, DocCutCommand, DocPasteCommand].forEach((command) =>
            this.disposeWithMe(this._commandService.registerAsMultipleCommand(command))
        );
        [InnerPasteCommand].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private commandExecutedListener() {
        const updateCommandList = [DocPasteCommand.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                this.handlePaste();
            })
        );
    }

    private async handlePaste() {
        const { _docClipboardService: docClipboardService } = this;
        const { segmentId } = this._textSelectionRenderManager.getActiveRange() ?? {};

        if (!segmentId) {
            this._logService.error('[DocClipboardController] segmentId is not existed');
        }

        try {
            const body = await docClipboardService.queryClipboardData();

            this._commandService.executeCommand(InnerPasteCommand.id, { body, segmentId });

            // TODO: @jocs, reset selections.
        } catch (_e) {
            this._logService.error('[DocClipboardController] clipboard is empty');
        }
    }
}
