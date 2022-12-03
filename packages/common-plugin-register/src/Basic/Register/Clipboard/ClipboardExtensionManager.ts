import { IClipboardData } from '../../Interfaces/IClipboardData';
import { PasteType } from '../../Interfaces/PasteType';
import { BaseClipboardExtension, BaseClipboardExtensionFactory } from './ClipboardExtensionFactory';
import { ClipboardExtensionRegister } from './ClipboardExtensionRegister';
import { Clipboard } from '../../Shared/Clipboard';

export class ClipboardExtensionManager {
    private _clipboardExtensionFactoryList: Array<BaseClipboardExtensionFactory>;

    // mounted on the instance
    private _register: ClipboardExtensionRegister;

    getRegister(): ClipboardExtensionRegister {
        return this._register;
    }

    constructor() {
        this._register = new ClipboardExtensionRegister();
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

        const extension = this._checkExtension(data);
        if (extension) {
            extension.execute();
        }
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

    pasteResolver(e?: ClipboardEvent) {
        return new Promise((resolve: (value: IClipboardData) => void, reject) => {
            Clipboard.read(e).then((file: Array<PasteType | null> | null) => {
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
}
