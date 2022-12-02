import { sortRules } from '@univer/core';
import { IClipboardData } from '../../Interfaces/IClipboardData';
import { BaseClipboardExtensionFactory } from './ClipboardExtensionFactory';

export class ClipboardExtensionRegister {
    private _clipboardExtensionFactoryList: Array<BaseClipboardExtensionFactory> = [];

    get clipboardExtensionFactoryList(): Array<BaseClipboardExtensionFactory> {
        return this._clipboardExtensionFactoryList;
    }

    add(...extensionFactoryList: Array<BaseClipboardExtensionFactory>) {
        this._clipboardExtensionFactoryList.push(...extensionFactoryList);
        this._clipboardExtensionFactoryList.sort(sortRules);
    }

    delete(extensionFactory: BaseClipboardExtensionFactory) {
        const index = this._clipboardExtensionFactoryList.indexOf(extensionFactory);
        this._clipboardExtensionFactoryList.splice(index, 1);
    }
}
