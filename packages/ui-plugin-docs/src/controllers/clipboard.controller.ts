import { TextSelectionManagerService } from '@univerjs/base-docs';
import { ITextSelectionRenderManager } from '@univerjs/base-render';
import { Disposable, ICommandInfo, ICommandService, ILogService, IUniverInstanceService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

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
        @ITextSelectionRenderManager private _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(TextSelectionManagerService) private _textSelectionManagerService: TextSelectionManagerService
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
        const { _docClipboardService: clipboard } = this;
        const {
            segmentId,
            endOffset: activeEndOffset,
            style,
        } = this._textSelectionRenderManager.getActiveRange() ?? {};
        const ranges = this._textSelectionRenderManager.getAllTextRanges();

        if (segmentId == null) {
            this._logService.error('[DocClipboardController] segmentId is not existed');
        }

        if (activeEndOffset == null) {
            return;
        }

        try {
            const body = await clipboard.queryClipboardData();

            this._commandService.executeCommand(InnerPasteCommand.id, { body, segmentId });

            // When doc has multiple selections, the cursor moves to the last pasted content's end.
            let cursor = activeEndOffset;
            for (const range of ranges) {
                const { startOffset, endOffset } = range;

                if (startOffset == null || endOffset == null) {
                    continue;
                }

                if (endOffset <= activeEndOffset) {
                    cursor += body.dataStream.length - (endOffset - startOffset);
                }
            }

            // move selection
            this._textSelectionManagerService.replace([
                {
                    startOffset: cursor,
                    endOffset: cursor,
                    collapsed: true,
                    style,
                },
            ]);
        } catch (_e) {
            this._logService.error('[DocClipboardController] clipboard is empty');
        }
    }
}
