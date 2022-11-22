import { IActionData } from './ActionBase';
import { BaseActionExtensionFactory } from './ActionExtensionFactory';
import { ActionExtensionRegister } from './ActionExtensionRegister';

export class ActionExtensionManager {
    private _actionExtensionFactoryList: Array<
        BaseActionExtensionFactory<IActionData>
    >;

    // 挂载到实例上
    private _register: ActionExtensionRegister;

    getRegister(): ActionExtensionRegister {
        return this._register;
    }

    constructor() {
        this._register = new ActionExtensionRegister();
        this._register.initialize();
    }

    /**
     * inject all actions
     * @param command
     */
    handle(actions: IActionData[]) {
        const actionExtensionFactoryList =
            this._register?.actionExtensionFactoryList;
        if (!actionExtensionFactoryList) return;
        // get the sorted list
        // get the dynamically added list
        this._actionExtensionFactoryList = actionExtensionFactoryList;
        this._checkExtension(actions);
    }

    /**
     * Execute when the action is matched
     * @param command
     * @returns
     */
    private _checkExtension(actions: IActionData[]) {
        if (!this._actionExtensionFactoryList) return false;

        actions.forEach((action) => {
            this._actionExtensionFactoryList.forEach((actionExtensionFactory) => {
                const extension = actionExtensionFactory.check(action, actions);
                // Both formula and formatting need to execute
                if (extension !== false) {
                    extension.execute();
                }
            });
        });
    }
}
