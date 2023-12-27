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

import type { ICommandInfo, IDocumentBody } from '@univerjs/core';
import {
    Disposable,
    FOCUSING_DOC,
    FOCUSING_EDITOR,
    ICommandService,
    IContextService,
    ILogService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { DocCopyCommand, DocCutCommand, DocPasteCommand } from '../commands/commands/clipboard.command';
import { CutContentCommand, InnerPasteCommand } from '../commands/commands/clipboard.inner.command';
import { IDocClipboardService } from '../services/clipboard/clipboard.service';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

@OnLifecycle(LifecycleStages.Rendered, DocClipboardController)
export class DocClipboardController extends Disposable {
    constructor(
        @ILogService private readonly _logService: ILogService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IDocClipboardService private readonly _docClipboardService: IDocClipboardService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @IContextService private readonly _contextService: IContextService
    ) {
        super();
        this._commandExecutedListener();
        this.initialize();
    }

    initialize() {
        [DocCopyCommand, DocCutCommand, DocPasteCommand].forEach((command) =>
            this.disposeWithMe(this._commandService.registerAsMultipleCommand(command))
        );
        [InnerPasteCommand, CutContentCommand].forEach((command) =>
            this.disposeWithMe(this._commandService.registerCommand(command))
        );
    }

    private _commandExecutedListener() {
        const updateCommandList = [DocCutCommand.id, DocCopyCommand.id, DocPasteCommand.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                if (
                    !this._contextService.getContextValue(FOCUSING_DOC) &&
                    !this._contextService.getContextValue(FOCUSING_EDITOR)
                ) {
                    return;
                }

                switch (command.id) {
                    case DocPasteCommand.id: {
                        this._handlePaste();
                        break;
                    }

                    case DocCopyCommand.id: {
                        this._handleCopy();
                        break;
                    }

                    case DocCutCommand.id: {
                        this._handleCut();
                        break;
                    }

                    default:
                        throw new Error(`Unhandled command ${command.id}`);
                }
            })
        );
    }

    private async _handlePaste() {
        const { _docClipboardService: clipboard } = this;
        const {
            segmentId,
            endOffset: activeEndOffset,
            style,
        } = this._textSelectionManagerService.getActiveRange() ?? {};
        const ranges = this._textSelectionManagerService.getSelections();

        if (segmentId == null) {
            this._logService.error('[DocClipboardController] segmentId is not existed');
        }

        if (activeEndOffset == null || ranges == null) {
            return;
        }

        try {
            const body = await clipboard.queryClipboardData();

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

            const textRanges = [
                {
                    startOffset: cursor,
                    endOffset: cursor,
                    style,
                },
            ];

            this._commandService.executeCommand(InnerPasteCommand.id, { body, segmentId, textRanges });
        } catch (_e) {
            this._logService.error('[DocClipboardController] clipboard is empty');
        }
    }

    private _getDocumentBodyInRanges(): IDocumentBody[] {
        const ranges = this._textSelectionManagerService.getSelections();
        const docDataModel = this._currentUniverService.getCurrentUniverDocInstance();

        const results: IDocumentBody[] = [];

        if (ranges == null) {
            return results;
        }

        for (const range of ranges) {
            const { startOffset, endOffset, collapsed } = range;

            if (collapsed) {
                continue;
            }

            if (startOffset == null || endOffset == null) {
                continue;
            }

            const docBody = docDataModel.sliceBody(startOffset, endOffset);

            if (docBody == null) {
                continue;
            }

            results.push(docBody);
        }

        return results;
    }

    private async _handleCopy() {
        const { _docClipboardService: clipboard } = this;
        const documentBodyList = this._getDocumentBodyInRanges();

        try {
            clipboard.setClipboardData(documentBodyList);
        } catch (_e) {
            this._logService.error('[DocClipboardController] set clipboard failed');
        }
    }

    private async _handleCut() {
        const {
            segmentId,
            endOffset: activeEndOffset,
            style,
        } = this._textSelectionManagerService.getActiveRange() ?? {};
        const ranges = this._textSelectionManagerService.getSelections();

        if (segmentId == null) {
            this._logService.error('[DocClipboardController] segmentId is not existed');
        }

        if (activeEndOffset == null || ranges == null) {
            return;
        }

        // Set content to clipboard.
        this._handleCopy();

        try {
            let cursor = activeEndOffset;
            for (const range of ranges) {
                const { startOffset, endOffset } = range;

                if (startOffset == null || endOffset == null) {
                    continue;
                }

                if (endOffset <= activeEndOffset) {
                    cursor -= endOffset - startOffset;
                }
            }

            const textRanges = [
                {
                    startOffset: cursor,
                    endOffset: cursor,
                    style,
                },
            ];

            this._commandService.executeCommand(CutContentCommand.id, { segmentId, textRanges });
        } catch (e) {
            this._logService.error('[DocClipboardController] cut content failed');
        }
    }
}
