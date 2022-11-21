import { IActionData } from './ActionBase';
import { BaseActionExtensionFactory } from './ActionExtensionFactory';
import { ActionExtensionRegister } from './ActionExtensionRegister';

export class ActionExtensionManager {
    private _actionExtensionFactoryList: Array<
        BaseActionExtensionFactory<IActionData>
    >;

    /**
     * inject all actions
     * @param command
     */
    handle(actions: IActionData[]) {
        const actionExtensionFactoryList = ActionExtensionManager?.register?.actionExtensionFactoryList
        if (!actionExtensionFactoryList) return
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
                // TODO 可能只需执行一次
                if (extension !== false) {
                    extension.execute();
                }
            });
        });
    }

    static register: ActionExtensionRegister;

    static create(): ActionExtensionRegister {
        if (!this.register) {
            this.register = new ActionExtensionRegister();
            this.register.initialize();
        }

        return this.register;
    }
}
