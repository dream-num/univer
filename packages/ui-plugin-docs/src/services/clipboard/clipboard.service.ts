import {
    HTML_CLIPBOARD_MIME_TYPE,
    IClipboardInterfaceService,
    PLAIN_TEXT_CLIPBOARD_MIME_TYPE,
} from '@univerjs/base-ui';
import { Disposable, IUniverInstanceService, toDisposable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';

export interface IClipboardPropertyItem {}

export interface IDocClipboardHook {
    onCopyProperty?(start: number, end: number): IClipboardPropertyItem;
    onCopyContent?(start: number, end: number): string;
}

export interface IDocClipboardService {
    copy(): Promise<boolean>;
    cut(): Promise<boolean>;
    paste(item: ClipboardItem): Promise<boolean>;

    addClipboardHook(hook: IDocClipboardHook): IDisposable;
}

export const IDocClipboardService = createIdentifier<IDocClipboardService>('doc.clipboard-service');

export class DocClipboardService extends Disposable implements IDocClipboardService {
    private _clipboardHooks: IDocClipboardHook[] = [];

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IClipboardInterfaceService private readonly _clipboardInterfaceService: IClipboardInterfaceService
    ) {
        super();
    }

    copy(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    cut(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async paste(item: ClipboardItem): Promise<boolean> {
        const text = await item.getType(PLAIN_TEXT_CLIPBOARD_MIME_TYPE).then((blob) => blob && blob.text());
        const html = await item.getType(HTML_CLIPBOARD_MIME_TYPE).then((blob) => blob && blob.text());

        console.log(text);
        console.log(html);

        //  this._logService.error('[SheetClipboardService]', 'No valid data on clipboard');
        throw new Error('Method not implemented.');
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
