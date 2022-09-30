import { Observable } from '../Observer';
import { ActionBase, IActionData } from './ActionBase';

/**
 * Command type
 */
export enum CommandType {
    REDO,
    UNDO,
}

/**
 * Command observer props
 */
interface ICommandObserverProps {
    type: CommandType;
    actions: Array<ActionBase<IActionData>>;
}

/**
 * Command observers
 */
export class CommandObservers extends Observable<ICommandObserverProps> {}
