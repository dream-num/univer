import { Observable } from '../Observer';
import { Class, Nullable } from '../Shared';
import { ActionBase, IActionData } from './ActionBase';

export interface CommandInjector {
    injectAction(action: ActionBase<IActionData>): void;

    include<T>(action: Class<T>): Nullable<T>;

    getActions(): Array<ActionBase<IActionData>>;
}

export class CommandInjectorObservers extends Observable<CommandInjector> {}
