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

import type { LocaleKey } from '../../locale/types';
import { createIdentifier, Disposable, ILogService, Inject, LocaleService, Optional } from '@univerjs/core';
import { sanitizeParsedHtml } from '../../utils/html';
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

const DROP_CONTENT_TAGS = new Set([
    'base',
    'button',
    'embed',
    'form',
    'frame',
    'frameset',
    'head',
    'iframe',
    'input',
    'link',
    'meta',
    'object',
    'script',
    'select',
    'style',
    'template',
    'textarea',
]);

const ALLOWED_HTML_TAGS = new Set([
    'a',
    'b',
    'blockquote',
    'br',
    'caption',
    'code',
    'col',
    'colgroup',
    'dd',
    'div',
    'dl',
    'dt',
    'em',
    'font',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'li',
    'ol',
    'p',
    'pre',
    's',
    'span',
    'strike',
    'strong',
    'sub',
    'sup',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'u',
    'ul',
]);

const ALLOWED_HTML_ATTRIBUTES = new Set([
    'align',
    'alt',
    'aria-colindex',
    'aria-colspan',
    'aria-label',
    'aria-labelledby',
    'aria-rowindex',
    'aria-rowspan',
    'bgcolor',
    'border',
    'cellpadding',
    'cellspacing',
    'class',
    'colspan',
    'color',
    'dir',
    'face',
    'headers',
    'height',
    'href',
    'lang',
    'rel',
    'role',
    'rowspan',
    'size',
    'src',
    'style',
    'target',
    'title',
    'valign',
    'width',
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
    write(text: string, html: string, customData?: Record<string, string>): Promise<void>;

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

    async write(text: string, html: string, customData?: Record<string, string>): Promise<void> {
        if (!this.supportClipboard) {
            return this._legacyCopyHtml(text, html);
        }

        try {
            // write both pure text content and html content to the clipboard
            return await navigator.clipboard.write([
                new ClipboardItem({
                    [PLAIN_TEXT_CLIPBOARD_MIME_TYPE]: new Blob([text], { type: PLAIN_TEXT_CLIPBOARD_MIME_TYPE }),
                    [HTML_CLIPBOARD_MIME_TYPE]: new Blob([html], { type: HTML_CLIPBOARD_MIME_TYPE }),
                    ...Object.fromEntries(Object.entries(customData ?? {}).map(([type, value]) => [type, new Blob([value], { type })])),
                }),
            ]);
        } catch (error) {
            if (customData && Object.keys(customData).length) {
                try {
                    return await navigator.clipboard.write([
                        new ClipboardItem({
                            [PLAIN_TEXT_CLIPBOARD_MIME_TYPE]: new Blob([text], { type: PLAIN_TEXT_CLIPBOARD_MIME_TYPE }),
                            [HTML_CLIPBOARD_MIME_TYPE]: new Blob([html], { type: HTML_CLIPBOARD_MIME_TYPE }),
                        }),
                    ]);
                } catch (fallbackError) {
                    this._logService.error('[BrowserClipboardService]', fallbackError);
                    this._showClipboardAuthenticationNotification();
                    return;
                }
            }
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

    private _legacyCopyHtml(text: string, html: string): void {
        const activeElement = document.activeElement;
        const sanitizedHtml = serializeSanitizedHtmlForClipboard(html);
        let handledByClipboardEvent = false;

        const onCopy = (event: ClipboardEvent) => {
            if (!event.clipboardData) {
                return;
            }

            event.preventDefault();
            event.clipboardData.setData(PLAIN_TEXT_CLIPBOARD_MIME_TYPE, text);
            event.clipboardData.setData(HTML_CLIPBOARD_MIME_TYPE, sanitizedHtml);
            handledByClipboardEvent = true;
        };

        document.addEventListener('copy', onCopy);

        try {
            document.execCommand('copy');

            if (!handledByClipboardEvent) {
                const container = createCopyHtmlContainer();
                document.body.appendChild(container);
                container.innerHTML = sanitizedHtml;

                try {
                    select(container);
                    document.execCommand('copy');
                } finally {
                    document.body.removeChild(container);
                }
            }
        } finally {
            document.removeEventListener('copy', onCopy);

            if (activeElement instanceof HTMLElement) {
                activeElement.focus();
            }
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
            title: this._localeService.t<LocaleKey>('ui.clipboard.authentication.title'),
            content: this._localeService.t<LocaleKey>('ui.clipboard.authentication.content'),
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

function sanitizeHtmlForClipboard(html: string): DocumentFragment {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, HTML_CLIPBOARD_MIME_TYPE);
    sanitizeParsedHtml(doc, {
        strippedSelector: 'script, iframe, object, embed',
    });
    const fragment = document.createDocumentFragment();

    Array.from(doc.body.childNodes).forEach((node) => {
        const sanitizedNode = sanitizeHtmlNode(node);

        if (sanitizedNode) {
            fragment.appendChild(sanitizedNode);
        }
    });

    return fragment;
}

function serializeSanitizedHtmlForClipboard(html: string): string {
    const container = document.createElement('div');
    container.appendChild(sanitizeHtmlForClipboard(html));
    return container.innerHTML;
}

function sanitizeHtmlNode(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
        return document.createTextNode(node.textContent ?? '');
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }

    const sourceElement = node as HTMLElement;
    const tagName = sourceElement.tagName.toLowerCase();

    if (DROP_CONTENT_TAGS.has(tagName)) {
        return null;
    }

    if (!ALLOWED_HTML_TAGS.has(tagName)) {
        const fragment = document.createDocumentFragment();

        Array.from(sourceElement.childNodes).forEach((childNode) => {
            const sanitizedChildNode = sanitizeHtmlNode(childNode);

            if (sanitizedChildNode) {
                fragment.appendChild(sanitizedChildNode);
            }
        });

        return fragment;
    }

    const sanitizedElement = document.createElement(tagName);
    copySanitizedAttributes(sourceElement, sanitizedElement);

    Array.from(sourceElement.childNodes).forEach((childNode) => {
        const sanitizedChildNode = sanitizeHtmlNode(childNode);

        if (sanitizedChildNode) {
            sanitizedElement.appendChild(sanitizedChildNode);
        }
    });

    return sanitizedElement;
}

function copySanitizedAttributes(sourceElement: HTMLElement, targetElement: HTMLElement) {
    Array.from(sourceElement.attributes).forEach((attribute) => {
        const attributeName = attribute.name.toLowerCase();

        if (attributeName.startsWith('on')) {
            return;
        }

        if (attributeName.startsWith('data-') || attributeName.startsWith('aria-')) {
            targetElement.setAttribute(attribute.name, attribute.value);
            return;
        }

        if (!ALLOWED_HTML_ATTRIBUTES.has(attributeName)) {
            return;
        }

        if (attributeName === 'href' || attributeName === 'src') {
            const sanitizedUrl = sanitizeHtmlUrl(attribute.value, attributeName === 'src');

            if (sanitizedUrl) {
                targetElement.setAttribute(attribute.name, sanitizedUrl);
            }

            return;
        }

        if (attributeName === 'style') {
            const sanitizedStyle = sanitizeInlineStyle(attribute.value);

            if (sanitizedStyle) {
                targetElement.setAttribute(attribute.name, sanitizedStyle);
            }

            return;
        }

        targetElement.setAttribute(attribute.name, attribute.value);
    });
}

function sanitizeHtmlUrl(value: string, allowDataImage: boolean): string | null {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return null;
    }

    if (trimmedValue.startsWith('#')) {
        return trimmedValue;
    }

    if (/^(?:https?:|mailto:|tel:)/i.test(trimmedValue)) {
        return trimmedValue;
    }

    if (allowDataImage && /^data:image\/[a-z0-9.+-]+;base64,/i.test(trimmedValue)) {
        return trimmedValue;
    }

    if (/^(?:\/|\.\/|\.\.\/)/.test(trimmedValue)) {
        return trimmedValue;
    }

    return null;
}

function sanitizeInlineStyle(styleText: string): string {
    const probe = document.createElement('div');
    probe.style.cssText = styleText;

    const sanitizedDeclarations: string[] = [];

    Array.from(probe.style).forEach((propertyName) => {
        const propertyValue = probe.style.getPropertyValue(propertyName).trim();

        if (!propertyValue || isUnsafeStyleValue(propertyValue)) {
            return;
        }

        sanitizedDeclarations.push(`${propertyName}: ${propertyValue}`);
    });

    return sanitizedDeclarations.join('; ');
}

function isUnsafeStyleValue(styleValue: string): boolean {
    return /(expression\s*\(|url\s*\(|javascript:|vbscript:|mocha:|-moz-binding|behavior\s*:|@import)/i.test(styleValue);
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
