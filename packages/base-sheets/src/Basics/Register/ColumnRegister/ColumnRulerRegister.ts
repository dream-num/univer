import { sortRules } from '@univerjs/core';
import { BaseColumnRulerFactory } from './ColumnRulerFactory';
import { REGISTRY_COLUMN_RULER_FACTORY } from './RegistryFactory';

export class ColumnRulerRegister {
    private _columnRulerFactoryList: BaseColumnRulerFactory[] = [];

    get columnRulerFactoryList(): BaseColumnRulerFactory[] {
        return this._columnRulerFactoryList;
    }

    initialize() {
        this._initExtensions();
    }

    add(...extensionFactoryList: BaseColumnRulerFactory[]) {
        this._columnRulerFactoryList.push(...extensionFactoryList);
        this._columnRulerFactoryList.sort(sortRules);
    }

    delete(extensionFactory: BaseColumnRulerFactory) {
        const index = this._columnRulerFactoryList.indexOf(extensionFactory);
        this._columnRulerFactoryList.splice(index, 1);
    }

    private _initExtensions() {
        this._columnRulerFactoryList.push(...REGISTRY_COLUMN_RULER_FACTORY.getData().sort(sortRules));
    }
}
