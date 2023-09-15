import { sortRules } from '@univerjs/core';

import { BaseCellInputExtensionFactory } from './CellInputExtensionFactory';
import { REGISTRY_CELL_INPUT_FACTORY } from './RegistryFactory';

export class CellInputExtensionRegister {
    private _cellInputExtensionFactoryList: BaseCellInputExtensionFactory[] = [];

    get cellInputExtensionFactoryList(): BaseCellInputExtensionFactory[] {
        return this._cellInputExtensionFactoryList;
    }

    initialize() {
        this._initExtensions();
    }

    add(...extensionFactoryList: BaseCellInputExtensionFactory[]) {
        this._cellInputExtensionFactoryList.push(...extensionFactoryList);
        this._cellInputExtensionFactoryList.sort(sortRules);
    }

    delete(extensionFactory: BaseCellInputExtensionFactory) {
        const index = this._cellInputExtensionFactoryList.indexOf(extensionFactory);
        this._cellInputExtensionFactoryList.splice(index, 1);
    }

    private _initExtensions() {
        this._cellInputExtensionFactoryList.push(...REGISTRY_CELL_INPUT_FACTORY.getData().sort(sortRules));
    }
}
