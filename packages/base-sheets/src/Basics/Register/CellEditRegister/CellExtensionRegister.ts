import { sortRules } from '@univer/core';
import { BaseCellExtensionFactory } from './CellExtensionFactory';
import { REGISTRY_CELL_FACTORY } from './RegistryFactory';

export class CellExtensionRegister {
    private _cellExtensionFactoryList: BaseCellExtensionFactory[] = [];

    get cellExtensionFactoryList(): BaseCellExtensionFactory[] {
        return this._cellExtensionFactoryList;
    }

    initialize() {
        this._initExtensions();
    }

    add(...extensionFactoryList: BaseCellExtensionFactory[]) {
        this._cellExtensionFactoryList.push(...extensionFactoryList);
        this._cellExtensionFactoryList.sort(sortRules);
    }

    delete(extensionFactory: BaseCellExtensionFactory) {
        const index = this._cellExtensionFactoryList.indexOf(extensionFactory);
        this._cellExtensionFactoryList.splice(index, 1);
    }

    private _initExtensions() {
        this._cellExtensionFactoryList.push(...REGISTRY_CELL_FACTORY.getData().sort(sortRules));
    }
}
