import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

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
     * Read plain text from clipboard. Use read() to read both plain text and html.
     * @returns plain text
     */
    readText(): Promise<string>;

    /**
     * Write both plain text and html into clipboard.
     * @param text
     * @param html
     */
    write(text: string, html: string): Promise<void>;

    /**
     * Read both plain text and html from clipboard.
     */
    read(): Promise<{ text: string; html: string }>;

    // NOTE: maybe we should add an interface to support image copy
}

export const IClipboardInterfaceService = createIdentifier<IClipboardInterfaceService>('univer.clipboard-interface-service');

export class BrowserClipboardService extends Disposable implements IClipboardInterfaceService {
    write(text: string, html: string): Promise<void> {}

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

    read(): Promise<{ text: string; html: string }> {}

    async readText(): Promise<string> {
        try {
            return await navigator.clipboard.readText();
        } catch (e) {
            console.error(e);

            return '';
        }

        // TODO: fallback to traditional way
    }
}

function createCopyPasteContainer() {
    const textArea = document.createElement('textarea');
    textArea.style.position = 'absolute';
    textArea.style.height = '1px';
    textArea.style.width = '1px';
    return textArea;
}
