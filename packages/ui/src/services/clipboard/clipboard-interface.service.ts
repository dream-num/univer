import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

export const PLAIN_TEXT_CLIPBOARD_MIME_TYPE = 'text/plain';
export const HTML_CLIPBOARD_MIME_TYPE = 'text/html';

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

    // NOTE: maybe we should add an interface to support image copy
}

export const IClipboardInterfaceService = createIdentifier<IClipboardInterfaceService>(
    'univer.clipboard-interface-service'
);

export class BrowserClipboardService extends Disposable implements IClipboardInterfaceService {
    async write(text: string, html: string): Promise<void> {
        try {
            // write both pure text content and html content to the clipboard
            return await navigator.clipboard.write([
                new ClipboardItem({
                    [PLAIN_TEXT_CLIPBOARD_MIME_TYPE]: new Blob([text], { type: PLAIN_TEXT_CLIPBOARD_MIME_TYPE }),
                    [HTML_CLIPBOARD_MIME_TYPE]: new Blob([html], { type: HTML_CLIPBOARD_MIME_TYPE }),
                }),
            ]);
        } catch (error) {
            console.error(error);
        }
    }

    async writeText(text: string): Promise<void> {
        // use new Clipboard API first
        try {
            return await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error(error);
        }

        // fallback to traditional way
        const activeElement = document.activeElement;
        const container = createCopyPasteContainer();
        container.value = text;
        container.focus();
        container.select();
        document.body.appendChild(container);

        document.execCommand('copy');

        if (activeElement instanceof HTMLElement) {
            activeElement.focus();
        }

        document.removeChild(container);
    }

    async read(): Promise<ClipboardItem[]> {
        return navigator.clipboard.read();
    }

    async readText(): Promise<string> {
        try {
            return await navigator.clipboard.readText();
        } catch (e) {
            console.error(e);

            return '';
        }
    }
}

function createCopyPasteContainer() {
    const textArea = document.createElement('textarea');
    textArea.style.position = 'absolute';
    textArea.style.height = '1px';
    textArea.style.width = '1px';
    return textArea;
}
