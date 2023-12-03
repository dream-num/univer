import type { ICommandInfo, IDocumentBody, IParagraph, ITextRun } from '@univerjs/core';
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
    Tools,
} from '@univerjs/core';
import { ITextSelectionRenderManager } from '@univerjs/engine-render';

import { DocCopyCommand, DocCutCommand, DocPasteCommand } from '../commands/commands/clipboard.command';
import { CutContentCommand, InnerPasteCommand } from '../commands/commands/clipboard.inner.command';
import { IDocClipboardService } from '../services/clipboard/clipboard.service';

@OnLifecycle(LifecycleStages.Rendered, DocClipboardController)
export class DocClipboardController extends Disposable {
    constructor(
        @ILogService private readonly _logService: ILogService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IDocClipboardService private readonly _docClipboardService: IDocClipboardService,
        @ITextSelectionRenderManager private _textSelectionRenderManager: ITextSelectionRenderManager,
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
                    collapsed: true,
                    style,
                },
            ];

            this._commandService.executeCommand(InnerPasteCommand.id, { body, segmentId, textRanges });
        } catch (_e) {
            this._logService.error('[DocClipboardController] clipboard is empty');
        }
    }

    private _getDocumentBodyInRanges(): IDocumentBody[] {
        const ranges = this._textSelectionRenderManager.getAllTextRanges();
        const docDataModel = this._currentUniverService.getCurrentUniverDocInstance();

        const { dataStream, textRuns = [], paragraphs = [] } = docDataModel.getBody()!;

        const results: IDocumentBody[] = [];

        for (const range of ranges) {
            const { startOffset, endOffset, collapsed } = range;

            if (collapsed) {
                continue;
            }

            if (startOffset == null || endOffset == null) {
                continue;
            }

            const docBody: IDocumentBody = {
                dataStream: dataStream.slice(startOffset, endOffset),
            };

            const newTextRuns: ITextRun[] = [];

            for (const textRun of textRuns) {
                const clonedTextRun = Tools.deepClone(textRun);
                const { st, ed } = clonedTextRun;
                if (Tools.hasIntersectionBetweenTwoRanges(st, ed, startOffset, endOffset)) {
                    if (startOffset >= st && startOffset <= ed) {
                        newTextRuns.push({
                            ...clonedTextRun,
                            st: startOffset,
                            ed: Math.min(endOffset, ed),
                        });
                    } else if (endOffset >= st && endOffset <= ed) {
                        newTextRuns.push({
                            ...clonedTextRun,
                            st: Math.max(startOffset, st),
                            ed: endOffset,
                        });
                    } else {
                        newTextRuns.push(clonedTextRun);
                    }
                }
            }

            if (newTextRuns.length) {
                docBody.textRuns = newTextRuns.map((tr) => {
                    const { st, ed } = tr;
                    return {
                        ...tr,
                        st: st - startOffset,
                        ed: ed - startOffset,
                    };
                });
            }

            const newParagraphs: IParagraph[] = [];

            for (const paragraph of paragraphs) {
                const { startIndex } = paragraph;
                if (startIndex >= startOffset && startIndex <= endOffset) {
                    newParagraphs.push(Tools.deepClone(paragraph));
                }
            }

            if (newParagraphs.length) {
                docBody.paragraphs = newParagraphs.map((p) => ({
                    ...p,
                    startIndex: p.startIndex - startOffset,
                }));
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
        } = this._textSelectionRenderManager.getActiveRange() ?? {};
        const ranges = this._textSelectionRenderManager.getAllTextRanges();

        if (segmentId == null) {
            this._logService.error('[DocClipboardController] segmentId is not existed');
        }

        if (activeEndOffset == null) {
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
                    collapsed: true,
                    style,
                },
            ];

            this._commandService.executeCommand(CutContentCommand.id, { segmentId, textRanges });
        } catch (e) {
            this._logService.error('[DocClipboardController] cut content failed');
        }
    }
}
