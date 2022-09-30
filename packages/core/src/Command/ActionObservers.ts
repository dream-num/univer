import { Observable } from '../Observer';
import { ActionBase, IActionData } from './ActionBase';

/**
 * Action type
 */
export enum ActionType {
    REDO,
    UNDO,
}

/**
 * Action observer props
 */
export interface IActionObserverProps {
    type: ActionType;
    data: IActionData;
    action: ActionBase<IActionData, IActionData>;
}

/**
 * Observer for action base
 *
 * @beta
 */
export class ActionObservers extends Observable<IActionObserverProps> {}
