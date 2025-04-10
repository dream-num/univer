/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IDisposable, IDocumentBody, IDocumentData } from '@univerjs/core';
import type { IDocImage } from '@univerjs/docs-drawing';
import type { IRectRangeWithStyle, ITextRangeWithStyle } from '@univerjs/engine-render';

import { BuildTextUtils, createIdentifier, DataStreamTreeTokenType, Disposable, DOC_RANGE_TYPE, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DrawingTypeEnum, generateRandomId, getBodySlice, ICommandService, ILogService, Inject, IUniverInstanceService, normalizeBody, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType, SliceBodyType, toDisposable, Tools, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { ImageSourceType } from '@univerjs/drawing';
import {
    FILE__BMP_CLIPBOARD_MIME_TYPE,
    FILE__JPEG_CLIPBOARD_MIME_TYPE,
    FILE__WEBP_CLIPBOARD_MIME_TYPE,
    FILE_PNG_CLIPBOARD_MIME_TYPE,
    HTML_CLIPBOARD_MIME_TYPE,
    IClipboardInterfaceService,
    PLAIN_TEXT_CLIPBOARD_MIME_TYPE,
} from '@univerjs/ui';
import { CutContentCommand, InnerPasteCommand } from '../../commands/commands/clipboard.inner.command';
import { getCursorWhenDelete } from '../../commands/commands/doc-delete.command';
import { copyContentCache, extractId, genId } from './copy-content-cache';
import { HtmlToUDMService } from './html-to-udm/converter';
import PastePluginLark from './html-to-udm/paste-plugins/plugin-lark';
import PastePluginUniver from './html-to-udm/paste-plugins/plugin-univer';
import PastePluginWord from './html-to-udm/paste-plugins/plugin-word';
import { UDMToHtmlService } from './udm-to-html/convertor';

HtmlToUDMService.use(PastePluginWord);
HtmlToUDMService.use(PastePluginLark);
HtmlToUDMService.use(PastePluginUniver);

export interface IClipboardPropertyItem { }

export interface IDocClipboardHook {
    onCopyProperty?(start: number, end: number): IClipboardPropertyItem;
    onCopyContent?(start: number, end: number): string;
    onBeforePaste?: (body: IDocumentBody) => IDocumentBody;
    onBeforePasteImage?: (file: File) => Promise<{ source: string; imageSourceType: ImageSourceType } | null>;
}

export interface IDocClipboardService {
    copy(sliceType?: SliceBodyType, ranges?: ITextRangeWithStyle[]): Promise<boolean>;
    cut(ranges?: ITextRangeWithStyle[]): Promise<boolean>;
    paste(items: ClipboardItem[]): Promise<boolean>;
    legacyPaste(options: { html?: string; text?: string; files: File[] }): Promise<boolean>;
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
        @Inject(DocSelectionManagerService) private readonly _docSelectionManagerService: DocSelectionManagerService
    ) {
        super();
    }

    async copy(sliceType: SliceBodyType = SliceBodyType.copy, ranges?: ITextRangeWithStyle[]): Promise<boolean> {
        const { newSnapshotList = [], needCache = false, snapshot, ranges: allRanges } = this._getDocumentBodyInRanges(sliceType, ranges) ?? {};

        if (newSnapshotList.length === 0 || snapshot == null) {
            return false;
        }

        try {
            const isCopyInHeaderFooter = !!allRanges?.[0]?.segmentId;

            this._setClipboardData(newSnapshotList, !isCopyInHeaderFooter && needCache);
        } catch (e) {
            this._logService.error('[DocClipboardService] copy failed', e);
            return false;
        }

        return true;
    }

    async cut(ranges?: ITextRangeWithStyle[]): Promise<boolean> {
        return this._cut(ranges);
    }

    async paste(items: ClipboardItem[]): Promise<boolean> {
        const partDocData = await this._genDocDataFromClipboardItems(items);

        return this._paste(partDocData);
    }

    async legacyPaste(options: {
        html?: string;
        text?: string;
        files: File[];
    }): Promise<boolean> {
        let { html, text, files } = options;
        const currentDocInstance = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC);
        const docUnitId = currentDocInstance?.getUnitId() || '';
        if (!html && !text && files.length) {
            html = await this._createImagePasteHtml(files);
        }
        const partDocData = this._genDocDataFromHtmlAndText(html, text, docUnitId);
        // Paste in sheet editing mode without paste style, so we give textRuns empty array;
        if (docUnitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
            if (text) {
                const textDocData = BuildTextUtils.transform.fromPlainText(text);
                return this._paste({ body: textDocData });
            } else {
                partDocData.body!.textRuns = [];
            }
        }
        return this._paste(partDocData);
    }

    private async _cut(ranges?: ITextRangeWithStyle[]): Promise<boolean> {
        const textRanges = ranges?.filter((range) => range.rangeType === DOC_RANGE_TYPE.TEXT) ?? this._docSelectionManagerService.getTextRanges() ?? [];
        const rectRanges = ranges?.filter((range) => range.rangeType === DOC_RANGE_TYPE.RECT) as IRectRangeWithStyle[] ?? this._docSelectionManagerService.getRectRanges() ?? [];
        const {
            segmentId,
            endOffset: activeEndOffset,
            style,
        } = textRanges[0] ?? {};
        if (segmentId == null) {
            this._logService.error('[DocClipboardController] segmentId is not existed');
        }

        if (textRanges.length === 0 && rectRanges.length === 0) {
            return false;
        }

        // Set content to clipboard.
        this.copy(SliceBodyType.cut, ranges);

        try {
            let cursor = 0;

            if (rectRanges.length > 0) {
                cursor = getCursorWhenDelete(textRanges as Readonly<ITextRangeWithStyle[]>, rectRanges);
            } else if (activeEndOffset != null) {
                cursor = activeEndOffset;
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

            return this._commandService.executeCommand(CutContentCommand.id, {
                segmentId,
                textRanges: newTextRanges,
                rectRanges,
                selections: textRanges,
            });
            // eslint-disable-next-line unused-imports/no-unused-vars
        } catch (_e) {
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

        // copy custom ranges
        body.customRanges = body.customRanges?.map(BuildTextUtils.customRange.copyCustomRange);

        body.paragraphs?.forEach((copy) => {
            if (copy.paragraphStyle?.headingId) {
                copy.paragraphStyle.headingId = generateRandomId(6);
            }
        });

        const activeRange = this._docSelectionManagerService.getActiveTextRange();
        const { segmentId, endOffset: activeEndOffset, style } = activeRange || {};
        const ranges = this._docSelectionManagerService.getTextRanges();

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
                },
                segmentId,
                textRanges,
            });
        } catch (_) {
            this._logService.error('[DocClipboardController]', 'clipboard is empty.');
            return false;
        }
    }

    private async _setClipboardData(documentList: IDocumentData[], needCache = true): Promise<void> {
        const copyId = genId();
        const text =
            (documentList.length > 1
                ? documentList.map((doc) => doc.body?.dataStream || '').join('\n')
                : documentList[0].body?.dataStream || '')
                .replaceAll(DataStreamTreeTokenType.TABLE_START, '')
                .replaceAll(DataStreamTreeTokenType.TABLE_END, '')
                .replaceAll(DataStreamTreeTokenType.TABLE_ROW_START, '')
                .replaceAll(DataStreamTreeTokenType.TABLE_ROW_END, '')
                .replaceAll(DataStreamTreeTokenType.TABLE_CELL_START, '')
                .replaceAll(DataStreamTreeTokenType.TABLE_CELL_END, '')
                // Replace `\r\n` in table cell to white space.
                .replaceAll('\r\n', ' ');

        let html = this._umdToHtml.convert(documentList);

        // Only cache copy content when the range is 1.
        if (documentList.length === 1 && needCache) {
            html = html.replace(/(<[a-z]+)/, (_p0, p1) => `${p1} data-copy-id="${copyId}"`);
            const doc = documentList[0];
            const cache: Partial<IDocumentData> = { body: doc.body };

            if (doc.body?.customBlocks?.length) {
                cache.drawings = {};

                for (const block of doc.body.customBlocks) {
                    const { blockId } = block;
                    const drawing = doc.drawings?.[blockId];

                    if (drawing) {
                        const id = Tools.generateRandomId(6);

                        block.blockId = id;

                        cache.drawings[id] = {
                            ...Tools.deepClone(drawing),
                            drawingId: id,
                        };
                    }
                }
            }

            copyContentCache.set(copyId, cache);
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

    private _getDocumentBodyInRanges(sliceType: SliceBodyType, ranges?: ITextRangeWithStyle[]) {
        const docDataModel = this._univerInstanceService.getCurrentUniverDocInstance();
        const allRanges = ranges ?? this._docSelectionManagerService.getDocRanges();

        const results: IDocumentData['body'][] = [];
        let needCache = true;

        if (docDataModel == null || allRanges.length === 0) {
            return;
        }

        const segmentId = allRanges[0].segmentId;

        const body = docDataModel?.getSelfOrHeaderFooterModel(segmentId)?.getBody();

        const snapshot = docDataModel.getSnapshot();

        if (body == null) {
            return;
        }

        for (const range of allRanges) {
            const { startOffset, endOffset, collapsed, rangeType } = range;

            if (collapsed || startOffset == null || endOffset == null) {
                continue;
            }

            if (rangeType === DOC_RANGE_TYPE.RECT) {
                needCache = false;

                const { spanEntireRow } = range as IRectRangeWithStyle;
                let bodySlice: IDocumentBody;

                if (!spanEntireRow) {
                    bodySlice = getTableSlice(body, startOffset, endOffset);
                } else {
                    bodySlice = getTableSlice(body, startOffset, endOffset);
                }

                results.push(bodySlice);

                continue;
            }

            const deleteRange = { startOffset, endOffset, collapsed };

            const docBody = docDataModel.getSelfOrHeaderFooterModel(segmentId).sliceBody(deleteRange.startOffset, deleteRange.endOffset, sliceType);
            if (docBody == null) {
                continue;
            }

            results.push(docBody);
        }
        return {
            newSnapshotList: results.map((e) => ({ ...snapshot, body: e })),
            needCache,
            snapshot,
            ranges: allRanges,
        };
    }

    private async _genDocDataFromClipboardItems(items: ClipboardItem[]): Promise<Partial<IDocumentData>> {
        try {
            let html = '';
            let text = '';
            const files: File[] = [];
            for (const clipboardItem of items) {
                for (const type of clipboardItem.types) {
                    switch (type) {
                        case PLAIN_TEXT_CLIPBOARD_MIME_TYPE: {
                            text = await clipboardItem.getType(type).then((blob) => blob && blob.text());
                            break;
                        }
                        case HTML_CLIPBOARD_MIME_TYPE: {
                            html = await clipboardItem.getType(type).then((blob) => blob && blob.text());
                            break;
                        }
                        case FILE__BMP_CLIPBOARD_MIME_TYPE:
                        case FILE__JPEG_CLIPBOARD_MIME_TYPE:
                        case FILE__WEBP_CLIPBOARD_MIME_TYPE:
                        case FILE_PNG_CLIPBOARD_MIME_TYPE: {
                            const blob = await clipboardItem.getType(type);
                            const file = new File([blob], `pasted_image.${type.split('/')[1]}`, { type });
                            files.push(file);
                            break;
                        }
                    }
                }
            }
            if (!html && !text && files.length) {
                html = await this._createImagePasteHtml(files);
            }

            return this._genDocDataFromHtmlAndText(html, text);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    private _genDocDataFromHtmlAndText(html?: string, text?: string, _unitId?: string): Partial<IDocumentData> {
        if (!html) {
            if (text) {
                const body = BuildTextUtils.transform.fromPlainText(text);

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

        if (!_unitId) {
            const currentDocInstance = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC);
            const docUnitId = currentDocInstance?.getUnitId() || '';
            _unitId = docUnitId;
        }

        const doc = this._htmlToUDM.convert(html, { unitId: _unitId });

        if (copyId) {
            copyContentCache.set(copyId, doc);
        }
        return doc;
    }

    private async _createImagePasteHtml(files: File[]) {
        const doc: IDocumentData = {
            id: '',
            documentStyle: {},
            body: {
                dataStream: '',
                customBlocks: [],
            },
            drawings: {},
        };
        const fileToBase64 = async (file: File): Promise<{ source: string; imageSourceType: ImageSourceType }> => {
            const reader = new FileReader();
            return new Promise((res) => {
                reader.onloadend = function () {
                    res({
                        source: reader.result as string,
                        imageSourceType: ImageSourceType.BASE64,
                    });
                };
                reader.readAsDataURL(file);
            });
        };
        const getImageSize = (base64: string | File): Promise<{ width: number; height: number }> => {
            const img = new Image();
            const maxWidth = 500;
            return new Promise((resolve) => {
                img.src = typeof base64 === 'string' ? base64 : URL.createObjectURL(base64);
                img.onload = () => {
                    const width = Math.min(maxWidth, img.naturalWidth);
                    const scale = img.naturalHeight / img.naturalWidth;
                    resolve({ width, height: width * scale });
                };
            });
        };
        // clipboardHooks 应该被重新设计,用来处理多个 hook 处理同一个节点的能力
        // 参考 interceptor
        const onBeforePasteImage = (this._clipboardHooks.find((e) => e.onBeforePasteImage)?.onBeforePasteImage!) ?? fileToBase64;

        await Promise.all(files.map(async (file, index) => {
            const image = await onBeforePasteImage(file);
            if (!image) {
                return Promise.resolve();
            }
            const { width = 100, height = 100 } = await getImageSize(file);
            const itemId = `paste_image_id_${index}`;
            const body = doc.body!;
            const drawings = doc.drawings!;
            body.dataStream += '\b';
            body.customBlocks?.push({ startIndex: index, blockId: itemId });
            drawings[itemId] = {
                drawingId: itemId,
                unitId: '',
                subUnitId: '',
                imageSourceType: image.imageSourceType,
                title: '',
                source: image.source,
                description: '',
                layoutType: PositionedObjectLayoutType.INLINE,
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                transform: {
                    width,
                    height,
                    angle: 0,
                },
                docTransform: {
                    angle: 0,
                    size: { width, height },
                    positionH: { relativeFrom: ObjectRelativeFromH.CHARACTER, posOffset: 0 },
                    positionV: { relativeFrom: ObjectRelativeFromV.LINE, posOffset: 0 },
                },
            } as IDocImage;
        }));
        const html = this._umdToHtml.convert([doc]);
        return html;
    }
}
