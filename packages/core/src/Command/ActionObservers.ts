import { Observable } from '../Observer';
import { IActionData, ActionBase } from './index';

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
 * WorkBookObserver for action base
 *
 * @beta
 */
export class ActionObservers extends Observable<IActionObserverProps> {}
