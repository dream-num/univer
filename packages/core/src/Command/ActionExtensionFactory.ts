import type { IActionData } from './ActionBase';

/**
 * Manipulate the list of actions in a command
 */
export class BaseActionExtension {
    constructor(protected actionDataList: IActionData[]) {}

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
export class BaseActionExtensionFactory {
    get zIndex() {
        return 0;
    }

    /**
     * Generate Action Extension
     * @param actionDataList
     * @returns
     */
    create(actionDataList: IActionData[]): BaseActionExtension {
        return new BaseActionExtension(actionDataList);
    }

    /**
     * Intercept actionDataList
     * @returns
     */
    check(actionDataList: IActionData[]): false | BaseActionExtension {
        return this.create(actionDataList);
    }
}
