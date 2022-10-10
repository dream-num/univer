import { Observable } from '../Observer';
import { ActionBase, IActionData } from './ActionBase';
import { ActionType } from './ActionObservers';

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
