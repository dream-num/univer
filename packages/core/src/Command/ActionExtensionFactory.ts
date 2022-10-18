import { ACTION_NAMES } from '../Const';
import { IActionData } from './ActionBase';

export class BaseActionExtension<T extends IActionData = IActionData> {
    constructor(protected actionData: T) {}

    getActionData(): T {
        return this.actionData;
    }

    setValue() {}

    execute() {}
}

export class BaseActionExtensionFactory<T extends IActionData> {
    get zIndex() {
        return 0;
    }

    get actionName(): ACTION_NAMES {
        return ACTION_NAMES.CLEAR_RANGE_ACTION;
    }

    create(actionData: T): BaseActionExtension<T> {
        return new BaseActionExtension(actionData);
    }

    check(actionData: IActionData): false | BaseActionExtension<T> {
        return false;
    }
}
