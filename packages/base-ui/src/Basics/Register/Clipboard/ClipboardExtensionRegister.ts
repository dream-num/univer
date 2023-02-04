import { sortRules } from '@univerjs/core';
import { BaseClipboardExtensionFactory } from './ClipboardExtensionFactory';

export class ClipboardExtensionRegister {
    private _clipboardExtensionFactoryList: BaseClipboardExtensionFactory[] = [];

    get clipboardExtensionFactoryList(): BaseClipboardExtensionFactory[] {
        return this._clipboardExtensionFactoryList;
    }

    add(...extensionFactoryList: BaseClipboardExtensionFactory[]) {
        this._clipboardExtensionFactoryList.push(...extensionFactoryList);
        this._clipboardExtensionFactoryList.sort(sortRules);
    }

    delete(extensionFactory: BaseClipboardExtensionFactory) {
        const index = this._clipboardExtensionFactoryList.indexOf(extensionFactory);
        this._clipboardExtensionFactoryList.splice(index, 1);
    }
}
