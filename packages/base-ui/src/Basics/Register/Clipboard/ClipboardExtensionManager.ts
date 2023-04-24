import { IClipboardData } from '../../Interfaces';
import { PasteType } from '../../Interfaces/PasteType';
import { BaseClipboardExtension, BaseClipboardExtensionFactory } from './ClipboardExtensionFactory';
import { ClipboardExtensionRegister } from './ClipboardExtensionRegister';
import { Clipboard } from '../../Shared/Clipboard';

export class ClipboardExtensionManager {
    private _clipboardExtensionFactoryList: BaseClipboardExtensionFactory[];

    // mounted on the instance
    private _register: ClipboardExtensionRegister;

    constructor() {
        this._register = new ClipboardExtensionRegister();
    }

    getRegister(): ClipboardExtensionRegister {
        return this._register;
    }

    /**
     * inject all actions
     * @param command
     */
    handle(data: IClipboardData) {
        const clipboardExtensionFactoryList = this._register?.clipboardExtensionFactoryList;
        if (!clipboardExtensionFactoryList) return;
        // get the sorted list
        // get the dynamically added list
        this._clipboardExtensionFactoryList = clipboardExtensionFactoryList;

        // TODO：搜集action执行

        const extension = this._checkExtension(data);
        if (extension) {
            extension.execute();
        }
    }

    pasteResolver(evt?: ClipboardEvent) {
        return new Promise((resolve: (value: IClipboardData) => void, reject) => {
            Clipboard.read(evt).then((file: Array<PasteType | null> | null) => {
                if (!file) return [];
                const HtmlIndex = file.findIndex((item: PasteType | null, index: number) => item && item.type === 'text/html');
                const PlainIndex = file.findIndex((item: PasteType | null, index: number) => item && item.type === 'text/plain');

                const data: IClipboardData = {};
                if (HtmlIndex > -1) {
                    const html = file[HtmlIndex]?.result as string;
                    data.html = html;
                }
                if (PlainIndex > -1) {
                    const plain = file[PlainIndex]?.result as string;
                    data.plain = plain;
                }

                resolve(data);
            });
        });
    }

    /**
     * Execute when the action is matched
     * @param command
     * @returns
     */
    private _checkExtension(data: IClipboardData) {
        if (!this._clipboardExtensionFactoryList) return false;

        let extension: BaseClipboardExtension | false = false;
        for (let index = 0; index < this._clipboardExtensionFactoryList.length; index++) {
            const extensionFactory = this._clipboardExtensionFactoryList[index];
            extension = extensionFactory.check(data);
            if (extension !== false) {
                break;
            }
        }
        return extension;
    }
}
