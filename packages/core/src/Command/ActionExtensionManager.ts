import { IActionData } from './ActionBase';
import { BaseActionExtensionFactory } from './ActionExtensionFactory';
import { ActionExtensionRegister } from './ActionExtensionRegister';

export class ActionExtensionManager {
    private _actionExtensionFactoryList: BaseActionExtensionFactory[];

    // mounted on the instance
    private _register: ActionExtensionRegister;

    constructor() {
        this._register = new ActionExtensionRegister();
        this._register.initialize();
    }

    getRegister(): ActionExtensionRegister {
        return this._register;
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

        if (actions.length === 0) return;

        this._checkExtension(actions);
    }

    /**
     * Execute when the action is matched
     * @param command
     * @returns
     */
    private _checkExtension(actions: IActionData[]) {
        if (!this._actionExtensionFactoryList) return false;

        this._actionExtensionFactoryList.forEach((actionExtensionFactory) => {
            const extension = actionExtensionFactory.check(actions);
            // Both formula and formatting need to execute
            if (extension !== false) {
                extension.execute();
            }
        });
    }
}
