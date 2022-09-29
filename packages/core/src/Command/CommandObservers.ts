import { Observable } from '../Observer';
import { ActionBase, IActionData } from './ActionBase';

export enum CommandType {
    REDO,
    UNDO,
}

interface ICommandObserverProps {
    type: CommandType;
    actions: Array<ActionBase<IActionData>>;
}

export class CommandObservers extends Observable<ICommandObserverProps> {}
