import { sortRules } from '@univerjs/core';

import { BaseCopyExtensionFactory } from './CopyExtensionFactory';

export class CopyExtensionRegister {
    private _copyExtensionFactoryList: BaseCopyExtensionFactory[] = [];

    get copyExtensionFactoryList(): BaseCopyExtensionFactory[] {
        return this._copyExtensionFactoryList;
    }

    add(...extensionFactoryList: BaseCopyExtensionFactory[]) {
        this._copyExtensionFactoryList.push(...extensionFactoryList);
        this._copyExtensionFactoryList.sort(sortRules);
    }

    delete(extensionFactory: BaseCopyExtensionFactory) {
        const index = this._copyExtensionFactoryList.indexOf(extensionFactory);
        this._copyExtensionFactoryList.splice(index, 1);
    }
}
