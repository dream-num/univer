import { Observable } from '../Observer';
import { ActionBase, IActionData, ActionType } from './index';

/**
 * Command observer props
 */
interface ICommandObserverProps {
    type: ActionType;
    actions: Array<ActionBase<IActionData>>;
}

/**
 * Command observers
 */
export class CommandObservers extends Observable<ICommandObserverProps> {}
