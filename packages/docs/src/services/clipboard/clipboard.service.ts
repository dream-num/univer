/**
 * Copyright 2023 DreamNum Inc.
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

import type { IDocumentBody } from '@univerjs/core';
import { Disposable, IUniverInstanceService, toDisposable } from '@univerjs/core';
import { HTML_CLIPBOARD_MIME_TYPE, IClipboardInterfaceService, PLAIN_TEXT_CLIPBOARD_MIME_TYPE } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';

import { copyContentCache, extractId, genId } from './copy-content-cache';
import { HtmlToUDMService } from './html-to-udm/converter';
import PastePluginLark from './html-to-udm/paste-plugins/plugin-lark';
import PastePluginWord from './html-to-udm/paste-plugins/plugin-word';
import { UDMToHtmlService } from './udm-to-html/convertor';

HtmlToUDMService.use(PastePluginWord);
HtmlToUDMService.use(PastePluginLark);

export interface IClipboardPropertyItem {}

export interface IDocClipboardHook {
    onCopyProperty?(start: number, end: number): IClipboardPropertyItem;
    onCopyContent?(start: number, end: number): string;
}

export interface IDocClipboardService {
    queryClipboardData(): Promise<IDocumentBody>;

    setClipboardData(documentBodyList: IDocumentBody[]): Promise<void>;

    addClipboardHook(hook: IDocClipboardHook): IDisposable;
}

export const IDocClipboardService = createIdentifier<IDocClipboardService>('doc.clipboard-service');

export class DocClipboardService extends Disposable implements IDocClipboardService {
    private _clipboardHooks: IDocClipboardHook[] = [];
    private _htmlToUDM = new HtmlToUDMService();
    private _umdToHtml = new UDMToHtmlService();

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IClipboardInterfaceService private readonly _clipboardInterfaceService: IClipboardInterfaceService
    ) {
        super();
    }

    async queryClipboardData(): Promise<IDocumentBody> {
        const clipboardItems = await this._clipboardInterfaceService.read();

        if (clipboardItems.length === 0) {
            return Promise.reject();
        }
        const clipboardItem = clipboardItems[0];
        const text = await clipboardItem.getType(PLAIN_TEXT_CLIPBOARD_MIME_TYPE).then((blob) => blob && blob.text());
        const html = await clipboardItem.getType(HTML_CLIPBOARD_MIME_TYPE).then((blob) => blob && blob.text());

        if (!html) {
            // TODO: @JOCS, Parsing paragraphs and sections
            return {
                dataStream: text,
            };
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

    async setClipboardData(documentBodyList: IDocumentBody[]): Promise<void> {
        const copyId = genId();
        const text =
            documentBodyList.length > 1
                ? documentBodyList.map((body) => body.dataStream).join('\n')
                : documentBodyList[0].dataStream;
        let html = this._umdToHtml.convert(documentBodyList);

        // Only cache copy content when the range is 1.
        if (documentBodyList.length === 1) {
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
}
