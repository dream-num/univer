import { Observable } from '../Observer';
import { Class, Nullable } from '../Shared';
import { ActionBase, IActionData } from './index';

/**
 * Command injector, after the core triggers the Command, the plug-in receives the Command WorkBookObserver message, inserts its own Action, and combines it into one Command, which is convenient for undo/redo to be executed as a command.
 *
 * @privateRemarks
 * zh: Command injector, 核心触发的Command后，插件接受到Command Observer消息之后，插入自己的Action，组合为一个Command，方便撤销重做作为一个指令执行。
 */
export interface CommandInjector {
    injectAction(action: ActionBase<IActionData>): void;

    include<T>(action: Class<T>): Nullable<T>;

    getActions(): Array<ActionBase<IActionData>>;
}

export class CommandInjectorObservers extends Observable<CommandInjector> {}
