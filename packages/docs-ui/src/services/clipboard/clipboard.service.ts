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

import type { DocumentDataModel, ICustomRange, IDocumentBody, IParagraph } from '@univerjs/core';
import { CustomRangeType, DataStreamTreeTokenType, Disposable, ICommandService, ILogService, IUniverInstanceService, normalizeBody, SliceBodyType, toDisposable, Tools, UniverInstanceType } from '@univerjs/core';
import { HTML_CLIPBOARD_MIME_TYPE, IClipboardInterfaceService, PLAIN_TEXT_CLIPBOARD_MIME_TYPE } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier, Inject } from '@wendellhu/redi';

import { CutContentCommand, DocCustomRangeService, getDeleteSelection, InnerPasteCommand, TextSelectionManagerService } from '@univerjs/docs';
import { copyContentCache, extractId, genId } from './copy-content-cache';
import { HtmlToUDMService } from './html-to-udm/converter';
import PastePluginLark from './html-to-udm/paste-plugins/plugin-lark';
import PastePluginWord from './html-to-udm/paste-plugins/plugin-word';
import PastePluginUniver from './html-to-udm/paste-plugins/plugin-univer';
import { UDMToHtmlService } from './udm-to-html/convertor';

HtmlToUDMService.use(PastePluginWord);
HtmlToUDMService.use(PastePluginLark);
HtmlToUDMService.use(PastePluginUniver);

export interface IClipboardPropertyItem { }

export interface IDocClipboardHook {
    onCopyProperty?(start: number, end: number): IClipboardPropertyItem;
    onCopyContent?(start: number, end: number): string;
    onBeforePaste?: (body: IDocumentBody) => IDocumentBody;
}

export interface IDocClipboardService {
    copy(sliceType?: SliceBodyType): Promise<boolean>;
    cut(): Promise<boolean>;
    paste(items: ClipboardItem[]): Promise<boolean>;
    legacyPaste(html?: string, text?: string): Promise<boolean>;
    addClipboardHook(hook: IDocClipboardHook): IDisposable;
}

export const IDocClipboardService = createIdentifier<IDocClipboardService>('doc.clipboard-service');

export class DocClipboardService extends Disposable implements IDocClipboardService {
    private _clipboardHooks: IDocClipboardHook[] = [];

    private _htmlToUDM = new HtmlToUDMService();
    private _umdToHtml = new UDMToHtmlService();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ILogService private readonly _logService: ILogService,
        @ICommandService private readonly _commandService: ICommandService,
        @IClipboardInterfaceService private readonly _clipboardInterfaceService: IClipboardInterfaceService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @Inject(DocCustomRangeService) private readonly _docCustomRangeService: DocCustomRangeService
    ) {
        super();
    }

    async copy(sliceType: SliceBodyType = SliceBodyType.copy): Promise<boolean> {
        const documentBodyList = this._getDocumentBodyInRanges(sliceType);

        if (documentBodyList.length === 0) {
            return false;
        }

        try {
            const activeRange = this._textSelectionManagerService.getActiveRange();
            const isCopyInHeaderFooter = !!activeRange?.segmentId;
            this._setClipboardData(documentBodyList, !isCopyInHeaderFooter);
        } catch (e) {
            this._logService.error('[DocClipboardService] copy failed', e);
            return false;
        }

        return true;
    }

    async cut(): Promise<boolean> {
        return this._cut();
    }

    async paste(items: ClipboardItem[]): Promise<boolean> {
        const body = await this._generateBodyFromClipboardItems(items);

        return this._paste(body);
    }

    async legacyPaste(html?: string, text?: string): Promise<boolean> {
        const body = this._generateBodyFromHtmlAndText(html, text);

        return this._paste(body);
    }

    private async _cut(): Promise<boolean> {
        const {
            segmentId,
            endOffset: activeEndOffset,
            style,
        } = this._textSelectionManagerService.getActiveRange() ?? {};
        const ranges = this._textSelectionManagerService.getCurrentSelections();

        if (segmentId == null) {
            this._logService.error('[DocClipboardController] segmentId is not existed');
        }

        if (activeEndOffset == null || ranges == null) {
            return false;
        }

        // Set content to clipboard.
        this.copy(SliceBodyType.cut);

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

            return this._commandService.executeCommand(CutContentCommand.id, { segmentId, textRanges });
        } catch (e) {
            this._logService.error('[DocClipboardController] cut content failed');
            return false;
        }
    }

    private async _paste(_body: IDocumentBody): Promise<boolean> {
        let body = normalizeBody(_body);

        this._clipboardHooks.forEach((hook) => {
            if (hook.onBeforePaste) {
                body = hook.onBeforePaste(body);
            }
        });
        const activeRange = this._textSelectionManagerService.getActiveRange();
        const { segmentId, endOffset: activeEndOffset, style } = activeRange || {};
        const ranges = this._textSelectionManagerService.getCurrentSelections();

        if (segmentId == null) {
            this._logService.error('[DocClipboardController] segmentId does not exist!');
        }

        if (activeEndOffset == null || ranges == null) {
            return false;
        }

        try {
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

            return this._commandService.executeCommand(InnerPasteCommand.id, { body, segmentId, textRanges });
        } catch (_e) {
            this._logService.error('[DocClipboardController]', 'clipboard is empty.');
            return false;
        }
    }

    private async _setClipboardData(documentBodyList: IDocumentBody[], needCache = true): Promise<void> {
        const copyId = genId();
        const text =
            documentBodyList.length > 1
                ? documentBodyList.map((body) => body.dataStream).join('\n')
                : documentBodyList[0].dataStream;
        let html = this._umdToHtml.convert(documentBodyList);

            // Only cache copy content when the range is 1.
        if (documentBodyList.length === 1 && needCache) {
            html = html.replace(/(<[a-z]+)/, (_p0, p1) => `${p1} data-copy-id="${copyId}"`);
            copyContentCache.set(copyId, documentBodyList[0]);
        }

        return this._clipboardInterfaceService.write(text, html);
    }

    addClipboardHook(hook: IDocClipboardHook): IDisposable {
        this._clipboardHooks.push(hook);

        return toDisposable(() => {
            const index = this._clipboardHooks.indexOf(hook);

            if (index > -1) {
                this._clipboardHooks.splice(index, 1);
            }
        });
    }

    private _getDocumentBodyInRanges(sliceType: SliceBodyType): IDocumentBody[] {
        const ranges = this._textSelectionManagerService.getCurrentSelections();
        const activeRange = this._textSelectionManagerService.getActiveRange();
        const docDataModel = this._univerInstanceService.getCurrentUniverDocInstance();
        const results: IDocumentBody[] = [];
        const body = docDataModel?.getBody();

        if (ranges == null || docDataModel == null || body == null) {
            return results;
        }

        if (activeRange == null) {
            return results;
        }

        const { segmentId } = activeRange;

        for (const range of ranges) {
            const { startOffset, endOffset, collapsed } = range;

            if (collapsed) {
                continue;
            }

            if (startOffset == null || endOffset == null) {
                continue;
            }
            const deleteRange = getDeleteSelection({ startOffset, endOffset, collapsed }, body);

            const docBody = docDataModel.getSelfOrHeaderFooterModel(segmentId).sliceBody(deleteRange.startOffset, deleteRange.endOffset, sliceType);
            if (docBody == null) {
                continue;
            }

            if (docBody.customRanges) {
                const deleteRange: ICustomRange[] = [];
                docBody.customRanges.forEach((range) => {
                    // should be delete
                    if (range.startIndex === range.endIndex) {
                        deleteRange.push(range);
                    }
                });
                docBody.customRanges = docBody.customRanges.filter((range) => deleteRange.indexOf(range) === -1);
                let text = '';
                let cursor = 0;
                deleteRange.forEach((range) => {
                    text += docBody.dataStream.slice(cursor, range.endIndex);
                    cursor = range.endIndex + 1;
                });
                text += docBody.dataStream.slice(cursor, docBody.dataStream.length);
                docBody.dataStream = text;
            }

            results.push(docBody);
        }

        return results;
    }

    private async _generateBodyFromClipboardItems(items: ClipboardItem[]): Promise<IDocumentBody> {
        try {
            // TODO: support paste image.

            let html = '';
            let text = '';

            for (const clipboardItem of items) {
                for (const type of clipboardItem.types) {
                    if (type === PLAIN_TEXT_CLIPBOARD_MIME_TYPE) {
                        text = await clipboardItem.getType(type).then((blob) => blob && blob.text());
                    } else if (type === HTML_CLIPBOARD_MIME_TYPE) {
                        html = await clipboardItem.getType(type).then((blob) => blob && blob.text());
                    }
                }
            }

            return this._generateBodyFromHtmlAndText(html, text);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    private _generateBody(text: string): IDocumentBody {
        // Convert all \n to \r, because we use \r to indicate paragraph break.
        const dataStream = text.replace(/\n/g, '\r');

        if (!text.includes('\r') && Tools.isLegalUrl(text)) {
            const id = Tools.generateRandomId();
            const docDataModel = this._univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)!;
            const range = this._docCustomRangeService.copyCustomRange(
                docDataModel.getUnitId(),
                {
                    startIndex: 0,
                    endIndex: dataStream.length - 1,
                    rangeId: id,
                    rangeType: CustomRangeType.HYPERLINK,
                    data: text,
                }
            );

            return {
                dataStream: `${DataStreamTreeTokenType.CUSTOM_RANGE_START}${dataStream}${DataStreamTreeTokenType.CUSTOM_RANGE_END}`,
                customRanges: [range],
            };
        }

        const paragraphs: IParagraph[] = [];

        for (let i = 0; i < dataStream.length; i++) {
            if (dataStream[i] === '\r') {
                paragraphs.push({ startIndex: i });
            }
        }

        return {
            dataStream,
            paragraphs,
        };
    }

    private _generateBodyFromHtmlAndText(html?: string, text?: string): IDocumentBody {
        if (!html) {
            if (text) {
                return this._generateBody(text);
            } else {
                throw new Error('[DocClipboardService] html and text cannot be both empty!');
            }
        }

        const copyId = extractId(html);
        if (copyId) {
            const copyCache = copyContentCache.get(copyId);
            if (copyCache) {
                return copyCache;
            }
        }

        return this._htmlToUDM.convert(html);
    }
}
