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

import { createIdentifier, Disposable, ILogService, Inject, LocaleService, Optional } from '@univerjs/core';

import { INotificationService } from '../notification/notification.service';
import { supportClipboardAPI } from './clipboard-utils';

export const PLAIN_TEXT_CLIPBOARD_MIME_TYPE = 'text/plain';
export const HTML_CLIPBOARD_MIME_TYPE = 'text/html';
export const FILE_PNG_CLIPBOARD_MIME_TYPE = 'image/png';
export const FILE__JPEG_CLIPBOARD_MIME_TYPE = 'image/jpeg';
export const FILE__BMP_CLIPBOARD_MIME_TYPE = 'image/bmp';
export const FILE__WEBP_CLIPBOARD_MIME_TYPE = 'image/webp';
export const FILE_SVG_XML_CLIPBOARD_MIME_TYPE = 'image/svg+xml';

export const imageMimeTypeSet = new Set([
    FILE__BMP_CLIPBOARD_MIME_TYPE,
    FILE__JPEG_CLIPBOARD_MIME_TYPE,
    FILE__WEBP_CLIPBOARD_MIME_TYPE,
    FILE_PNG_CLIPBOARD_MIME_TYPE,
]);

/**
 * This interface provides an interface to access system's clipboard.
 */
export interface IClipboardInterfaceService {
    /**
     * Write plain text into clipboard. Use write() to write both plain text and html.
     * @param text
     */
    writeText(text: string): Promise<void>;

    /**
     * Write both plain text and html into clipboard.
     * @param text
     * @param html
     */
    write(text: string, html: string): Promise<void>;

    /**
     * Read plain text from clipboard. Use read() to read both plain text and html.
     * @returns plain text
     */
    readText(): Promise<string>;

    /**
     * Read `ClipboardItem[]` from clipboard.
     */
    read(): Promise<ClipboardItem[]>;

    /**
     * This property tells if the platform supports reading data directly from the clipboard.
     */
    readonly supportClipboard: boolean;
}

export const IClipboardInterfaceService = createIdentifier<IClipboardInterfaceService>(
    'univer.clipboard-interface-service'
);

export class BrowserClipboardService extends Disposable implements IClipboardInterfaceService {
    get supportClipboard(): boolean {
        return supportClipboardAPI();
    }

    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ILogService private readonly _logService: ILogService,
        @Optional(INotificationService) private readonly _notificationService?: INotificationService
    ) {
        super();
    }

    async write(text: string, html: string): Promise<void> {
        if (!this.supportClipboard) {
            return this._legacyCopyHtml(html);
        }

        try {
            // write both pure text content and html content to the clipboard
            return await navigator.clipboard.write([
                new ClipboardItem({
                    [PLAIN_TEXT_CLIPBOARD_MIME_TYPE]: new Blob([text], { type: PLAIN_TEXT_CLIPBOARD_MIME_TYPE }),
                    [HTML_CLIPBOARD_MIME_TYPE]: new Blob([html], { type: HTML_CLIPBOARD_MIME_TYPE }),
                }),
            ]);
        } catch (error) {
            this._logService.error('[BrowserClipboardService]', error);
            this._showClipboardAuthenticationNotification();
        }
    }

    async writeText(text: string): Promise<void> {
        if (!this.supportClipboard) {
            return this._legacyCopyText(text);
        }

        // use new Clipboard API first
        try {
            return await navigator.clipboard.writeText(text);
        } catch (error) {
            this._logService.error('[BrowserClipboardService]', error);
            this._showClipboardAuthenticationNotification();
        }
    }

    async read(): Promise<ClipboardItem[]> {
        if (!this.supportClipboard) {
            throw new Error('[BrowserClipboardService] read() is not supported on this platform.');
        }

        try {
            return navigator.clipboard.read();
        } catch (e) {
            this._logService.error('[BrowserClipboardService]', e);
            this._showClipboardAuthenticationNotification();
            return [];
        }
    }

    async readText(): Promise<string> {
        if (!this.supportClipboard) {
            throw new Error('[BrowserClipboardService] read() is not supported on this platform.');
        }

        try {
            return await navigator.clipboard.readText();
        } catch (e) {
            this._logService.error('[BrowserClipboardService]', e);
            this._showClipboardAuthenticationNotification();
            return '';
        }
    }

    private _legacyCopyHtml(html: string): void {
        const activeElement = document.activeElement;
        const container = createCopyHtmlContainer();
        document.body.appendChild(container);
        container.innerHTML = html; // TODO: wzhudev: sanitize html

        try {
            select(container);
            document.execCommand('copy');
        } finally {
            if (activeElement instanceof HTMLElement) {
                activeElement.focus();
            }

            document.body.removeChild(container);
        }
    }

    private _legacyCopyText(text: string): void {
        const activeElement = document.activeElement;
        const container = createCopyTextContainer();
        document.body.appendChild(container);
        container.value = text;

        try {
            select(container);
            document.execCommand('copy');
        } finally {
            // reset previous elements focus state
            if (activeElement instanceof HTMLElement) {
                activeElement.focus();
            }

            document.body.removeChild(container);
        }
    }

    private _showClipboardAuthenticationNotification(): void {
        this._notificationService?.show({
            type: 'warning',
            title: this._localeService.t('clipboard.authentication.title'),
            content: this._localeService.t('clipboard.authentication.content'),
        });
    }
}

function createCopyTextContainer() {
    const textArea = document.createElement('textarea');
    textArea.style.position = 'absolute';
    textArea.style.height = '1px';
    textArea.style.width = '1px';
    textArea.style.opacity = '0';
    textArea.readOnly = true;
    return textArea;
}

function createCopyHtmlContainer() {
    const div = document.createElement('div');
    div.contentEditable = 'true';
    div.style.position = 'absolute';
    div.style.opacity = '0';
    div.style.height = '1px';
    div.style.width = '1px';
    return div;
}

function select(element: HTMLTextAreaElement | HTMLDivElement): string {
    if (element instanceof HTMLTextAreaElement) {
        const isReadOnly = element.hasAttribute('readonly');

        if (!isReadOnly) {
            element.setAttribute('readonly', '');
        }

        element.select();
        element.setSelectionRange(0, element.value.length);

        if (!isReadOnly) {
            element.removeAttribute('readonly');
        }

        return element.value;
    }

    if (element.hasAttribute('contenteditable')) {
        element.focus();
    }

    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();

    if (!selection) {
        throw new Error();
    }

    selection.removeAllRanges();
    selection.addRange(range);

    return selection.toString();
}
