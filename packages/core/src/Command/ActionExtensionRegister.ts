import { sortRules } from '../Shared';
import { BaseActionExtensionFactory } from './ActionExtensionFactory';
import { REGISTRY_ACTION_FACTORY } from './RegistryFactory';

export class ActionExtensionRegister {
    private _actionExtensionFactoryList: BaseActionExtensionFactory[] = [];

    get actionExtensionFactoryList(): BaseActionExtensionFactory[] {
        return this._actionExtensionFactoryList;
    }

    initialize() {
        this._initExtensions();
    }

    add(...extensionFactoryList: BaseActionExtensionFactory[]) {
        this._actionExtensionFactoryList.push(...extensionFactoryList);
        this._actionExtensionFactoryList.sort(sortRules);
    }

    delete(extensionFactory: BaseActionExtensionFactory) {
        const index = this._actionExtensionFactoryList.indexOf(extensionFactory);
        this._actionExtensionFactoryList.splice(index, 1);
    }

    private _initExtensions() {
        this._actionExtensionFactoryList.push(
            ...REGISTRY_ACTION_FACTORY.getData().sort(sortRules)
        );
    }
}
