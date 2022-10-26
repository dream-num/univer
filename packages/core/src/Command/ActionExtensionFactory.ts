import { ACTION_NAMES } from '../Const';
import { IActionData } from './ActionBase';

/**
 * Manipulate the list of actions in a command
 */
export class BaseActionExtension<T extends IActionData = IActionData> {
    constructor(protected actionData: T, protected actionDataList: IActionData[]) {}

    getActionData(): T {
        return this.actionData;
    }

    getActionDataList(): IActionData[] {
        return this.actionDataList;
    }

    /**
     * Must use internal method to add action
     * @param actionData
     */
    push(actionData: IActionData) {
        this.actionDataList.push(actionData);
    }

    /**
     * Modify the data of action
     */
    setValue() {}

    /**
     * Execute the core logic after the check is successful
     */
    execute() {}
}

/**
 * Determine whether to intercept and create BaseActionExtension
 */
export class BaseActionExtensionFactory<T extends IActionData> {
    get zIndex() {
        return 0;
    }

    get actionName(): ACTION_NAMES {
        return ACTION_NAMES.CLEAR_RANGE_ACTION;
    }

    /**
     * Generate Action Extension
     * @param actionData
     * @param actionDataList
     * @returns
     */
    create(actionData: T, actionDataList: IActionData[]): BaseActionExtension<T> {
        return new BaseActionExtension(actionData, actionDataList);
    }

    /**
     * Check if this action needs to be intercepted currently
     * @param actionData
     * @param actionDataList
     * @returns
     */
    check(
        actionData: T,
        actionDataList: IActionData[]
    ): false | BaseActionExtension<T> {
        if (actionData.actionName !== this.actionName) {
            return false;
        }

        return this.create(actionData, actionDataList);
    }
}
