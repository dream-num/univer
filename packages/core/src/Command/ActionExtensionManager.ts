import { IActionData } from './ActionBase';
import { BaseActionExtensionFactory } from './ActionExtensionFactory';
import { ActionExtensionRegister } from './ActionExtensionRegister';
import { CommandBase } from './CommandBase';

export class ActionExtensionManager {
    private _actionExtensionFactoryList: Array<
        BaseActionExtensionFactory<IActionData>
    >;

    /**
     * inject all actions
     * @param command
     */
    inject(command: CommandBase) {
        // get the sorted list
        // get the dynamically added list
        this._actionExtensionFactoryList =
            ActionExtensionManager.register.actionExtensionFactoryList;
        this._checkExtension(command);
    }

    /**
     * Execute when the action is matched
     * @param command
     * @returns
     */
    private _checkExtension(command: CommandBase) {
        if (!this._actionExtensionFactoryList) return false;

        const actions = command.getInjector().getActions();
        actions.forEach((action) => {
            this._actionExtensionFactoryList.forEach((actionExtensionFactory) => {
                const extension = actionExtensionFactory.check(
                    action.getDoActionData()
                );
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
