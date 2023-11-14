import {
    HTML_CLIPBOARD_MIME_TYPE,
    IClipboardInterfaceService,
    PLAIN_TEXT_CLIPBOARD_MIME_TYPE,
} from '@univerjs/base-ui';
import { Disposable, IDocumentBody, IUniverInstanceService, toDisposable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';

import HtmlToUDMService from './html-to-udm/converter';
import PastePluginLark from './html-to-udm/paste-plugins/plugin-lark';
import PastePluginWord from './html-to-udm/paste-plugins/plugin-word';

HtmlToUDMService.use(PastePluginWord);
HtmlToUDMService.use(PastePluginLark);

export interface IClipboardPropertyItem {}

export interface IDocClipboardHook {
    onCopyProperty?(start: number, end: number): IClipboardPropertyItem;
    onCopyContent?(start: number, end: number): string;
}

export interface IDocClipboardService {
    queryClipboardData(): Promise<IDocumentBody>;

    addClipboardHook(hook: IDocClipboardHook): IDisposable;
}

export const IDocClipboardService = createIdentifier<IDocClipboardService>('doc.clipboard-service');

export class DocClipboardService extends Disposable implements IDocClipboardService {
    private _clipboardHooks: IDocClipboardHook[] = [];
    private htmlToUDM = new HtmlToUDMService();

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

        // console.log(text);
        // console.log(html);
        if (!html) {
            // TODO: @JOCS, Parsing paragraphs and sections
            return {
                dataStream: text,
            };
        }

        return this.htmlToUDM.convert(html);
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
