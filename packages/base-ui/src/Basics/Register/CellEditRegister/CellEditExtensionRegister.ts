import { sortRules } from '@univerjs/core';
import { BaseCellEditExtensionFactory } from './CellEditExtensionFactory';
import { REGISTRY_CELL_EDIT_FACTORY } from './RegistryFactory';

export class CellEditExtensionRegister {
    private _cellEditExtensionFactoryList: BaseCellEditExtensionFactory[] = [];

    get cellEditExtensionFactoryList(): BaseCellEditExtensionFactory[] {
        return this._cellEditExtensionFactoryList;
    }

    initialize() {
        this._initExtensions();
    }

    add(...extensionFactoryList: BaseCellEditExtensionFactory[]) {
        this._cellEditExtensionFactoryList.push(...extensionFactoryList);
        this._cellEditExtensionFactoryList.sort(sortRules);
    }

    delete(extensionFactory: BaseCellEditExtensionFactory) {
        const index = this._cellEditExtensionFactoryList.indexOf(extensionFactory);
        this._cellEditExtensionFactoryList.splice(index, 1);
    }

    private _initExtensions() {
        this._cellEditExtensionFactoryList.push(...REGISTRY_CELL_EDIT_FACTORY.getData().sort(sortRules));
    }
}
