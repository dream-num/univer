import { Observable } from '../Observer';
import { IActionData, ActionBase, CommonParameter } from './index';

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
    commonParameter?: CommonParameter;
}

/**
 * WorkBookObserver for action base
 *
 * @beta
 */
export class ActionObservers extends Observable<IActionObserverProps> {}
