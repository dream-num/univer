import { sortRules } from '@univerjs/core';
import { BasePasteExtensionFactory } from './PasteExtensionFactory';

export class PasteExtensionRegister {
    private _pasteExtensionFactoryList: BasePasteExtensionFactory[] = [];

    get pasteExtensionFactoryList(): BasePasteExtensionFactory[] {
        return this._pasteExtensionFactoryList;
    }

    add(...extensionFactoryList: BasePasteExtensionFactory[]) {
        this._pasteExtensionFactoryList.push(...extensionFactoryList);
        this._pasteExtensionFactoryList.sort(sortRules);
    }

    delete(extensionFactory: BasePasteExtensionFactory) {
        const index = this._pasteExtensionFactoryList.indexOf(extensionFactory);
        this._pasteExtensionFactoryList.splice(index, 1);
    }
}
