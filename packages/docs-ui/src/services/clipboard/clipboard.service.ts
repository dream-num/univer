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

import type { DocumentDataModel, ICustomRange, IDisposable, IDocumentBody, IDocumentData, IParagraph } from '@univerjs/core';
import { createIdentifier, CustomRangeType, DataStreamTreeTokenType, Disposable, getBodySlice, ICommandService, ILogService, Inject, IUniverInstanceService, normalizeBody, SliceBodyType, toDisposable, Tools, UniverInstanceType } from '@univerjs/core';
import { HTML_CLIPBOARD_MIME_TYPE, IClipboardInterfaceService, PLAIN_TEXT_CLIPBOARD_MIME_TYPE } from '@univerjs/ui';

import { CutContentCommand, DocCustomRangeService, getCursorWhenDelete, getDeleteSelection, InnerPasteCommand, TextSelectionManagerService } from '@univerjs/docs';
import type { RectRange, TextRange } from '@univerjs/engine-render';
import { DOC_RANGE_TYPE } from '@univerjs/engine-render';
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

function getTableSlice(body: IDocumentBody, start: number, end: number): IDocumentBody {
    const bodySlice = getBodySlice(body, start, end + 2); // +2 for '\r\n in last cell'

    const dataStream = DataStreamTreeTokenType.TABLE_START +
        DataStreamTreeTokenType.TABLE_ROW_START +
        DataStreamTreeTokenType.TABLE_CELL_START +
        bodySlice.dataStream +
        DataStreamTreeTokenType.TABLE_CELL_END +
        DataStreamTreeTokenType.TABLE_ROW_END +
        DataStreamTreeTokenType.TABLE_END;

    bodySlice.dataStream = dataStream;
    bodySlice.textRuns?.forEach((textRun) => {
        const { st, ed } = textRun;
        textRun.st = st + 3;
        textRun.ed = ed + 3;
    });

    bodySlice.tables?.forEach((table) => {
        const { startIndex, endIndex } = table;
        table.startIndex = startIndex + 3;
        table.endIndex = endIndex + 3;
    });

    bodySlice.paragraphs?.forEach((paragraph) => {
        const { startIndex } = paragraph;
        paragraph.startIndex = startIndex + 3;
    });

    return bodySlice;
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
        const { bodyList, needCache } = this._getDocumentBodyInRanges(sliceType);

        if (bodyList.length === 0) {
            return false;
        }

        try {
            const activeRange = this._textSelectionManagerService.getActiveTextRangeWithStyle();
            const isCopyInHeaderFooter = !!activeRange?.segmentId;

            this._setClipboardData(bodyList, !isCopyInHeaderFooter && needCache);
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
        const partDocData = await this._genDocDataFromClipboardItems(items);

        return this._paste(partDocData);
    }

    async legacyPaste(html?: string, text?: string): Promise<boolean> {
        const partDocData = this._genDocDataFromHtmlAndText(html, text);

        return this._paste(partDocData);
    }

    private async _cut(): Promise<boolean> {
        const {
            segmentId,
            endOffset: activeEndOffset,
            style,
        } = this._textSelectionManagerService.getActiveTextRangeWithStyle() ?? {};
        const textRanges = this._textSelectionManagerService.getCurrentTextRanges() ?? [];
        const rectRanges = this._textSelectionManagerService.getCurrentRectRanges() ?? [];

        if (segmentId == null) {
            this._logService.error('[DocClipboardController] segmentId is not existed');
        }

        if (textRanges.length === 0 && rectRanges.length === 0) {
            return false;
        }

        // Set content to clipboard.
        this.copy(SliceBodyType.cut);

        try {
            let cursor = 0;

            if (rectRanges.length > 0) {
                cursor = getCursorWhenDelete(textRanges as Readonly<TextRange[]>, rectRanges);
            } else if (activeEndOffset != null) {
                for (const range of textRanges) {
                    const { startOffset, endOffset } = range;

                    if (startOffset == null || endOffset == null) {
                        continue;
                    }

                    if (endOffset <= activeEndOffset) {
                        cursor -= endOffset - startOffset;
                    }
                }
            }

            const newTextRanges = [
                {
                    startOffset: cursor,
                    endOffset: cursor,
                    style,
                },
            ];

            return this._commandService.executeCommand(CutContentCommand.id, { segmentId, textRanges: newTextRanges });
        } catch (e) {
            this._logService.error('[DocClipboardController] cut content failed');
            return false;
        }
    }

    private async _paste(docData: Partial<IDocumentData>): Promise<boolean> {
        const { body: _body } = docData;

        if (_body == null) {
            return false;
        }

        let body = normalizeBody(_body);

        const unitId = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC)?.getUnitId();
        if (!unitId) {
            return false;
        }

        this._clipboardHooks.forEach((hook) => {
            if (hook.onBeforePaste) {
                body = hook.onBeforePaste(body);
            }
        });
        body.customRanges = body.customRanges?.map((range) => this._docCustomRangeService.copyCustomRange(unitId, range));

        const activeRange = this._textSelectionManagerService.getActiveTextRangeWithStyle();
        const { segmentId, endOffset: activeEndOffset, style } = activeRange || {};
        const ranges = this._textSelectionManagerService.getCurrentTextRanges();

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

            return this._commandService.executeCommand(InnerPasteCommand.id, {
                doc: {
                    ...docData,
                    body,
                }, segmentId, textRanges,
            });
        } catch (_) {
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
            copyContentCache.set(copyId, { body: documentBodyList[0] });
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

    // eslint-disable-next-line max-lines-per-function
    private _getDocumentBodyInRanges(sliceType: SliceBodyType): {
        bodyList: IDocumentBody[];
        needCache: boolean;
    } {
        const docDataModel = this._univerInstanceService.getCurrentUniverDocInstance();
        const allRanges = this._textSelectionManagerService.getDocRanges();

        const results: IDocumentBody[] = [];
        let needCache = true;

        if (docDataModel == null || allRanges.length === 0) {
            return {
                bodyList: results,
                needCache,
            };
        }

        const segmentId = allRanges[0].segmentId;

        const body = docDataModel?.getSelfOrHeaderFooterModel(segmentId)?.getBody();

        if (body == null) {
            return {
                bodyList: results,
                needCache,
            };
        }

        for (const range of allRanges) {
            const { startOffset, endOffset, collapsed, rangeType } = range;

            if (collapsed || startOffset == null || endOffset == null) {
                continue;
            }

            if (rangeType === DOC_RANGE_TYPE.RECT) {
                needCache = false;

                const { spanEntireRow } = range as unknown as RectRange;
                let bodySlice: IDocumentBody;
                if (!spanEntireRow) {
                    bodySlice = getTableSlice(body, startOffset, endOffset);
                } else {
                    bodySlice = getTableSlice(body, startOffset, endOffset);
                }

                results.push(bodySlice);

                continue;
            }

            const deleteRange = getDeleteSelection({ startOffset, endOffset, collapsed }, body);

            const docBody = docDataModel.getSelfOrHeaderFooterModel(segmentId).sliceBody(deleteRange.startOffset, deleteRange.endOffset, sliceType);
            if (docBody == null) {
                continue;
            }

            // TODO: @zhangwei, should be delete?
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

        return {
            bodyList: results,
            needCache,
        };
    }

    private async _genDocDataFromClipboardItems(items: ClipboardItem[]): Promise<Partial<IDocumentData>> {
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

            return this._genDocDataFromHtmlAndText(html, text);
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
            const urlText = `${DataStreamTreeTokenType.CUSTOM_RANGE_START}${dataStream}${DataStreamTreeTokenType.CUSTOM_RANGE_END}`;
            const range = this._docCustomRangeService.copyCustomRange(
                docDataModel.getUnitId(),
                {
                    startIndex: 0,
                    endIndex: urlText.length - 1,
                    rangeId: id,
                    rangeType: CustomRangeType.HYPERLINK,
                    data: text,
                }
            );

            return {
                dataStream: urlText,
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

    private _genDocDataFromHtmlAndText(html?: string, text?: string): Partial<IDocumentData> {
        if (!html) {
            if (text) {
                const body = this._generateBody(text);

                return { body };
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

        const doc = this._htmlToUDM.convert(html);

        return doc;
    }
}
