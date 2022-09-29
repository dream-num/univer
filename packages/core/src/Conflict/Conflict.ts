import { ActionBase, IActionData } from '../Command/ActionBase';

export abstract class Conflict {
    abstract comparison(
        ...action: Array<ActionBase<IActionData>>
    ): Array<ActionBase<IActionData>> | boolean;
}
