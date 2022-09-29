import { Nullable } from '../Shared';
import { ObservableHooks } from './ObservableHooks';

/**
 * Observer hook
 */
export class PathObservableHooks<T = any> {
    namespace: string;

    name: string;

    observableHooks: ObservableHooks<T>;

    constructor(name: string, hooks: ObservableHooks<T>) {
        this.name = name;
        this.observableHooks = hooks;
    }
}

/**
 * Manage a set of observer hooks, add and get hooks
 */
export class HooksManager {
    private _observableHooksArray: PathObservableHooks[];

    constructor() {
        this._observableHooksArray = new Array<PathObservableHooks>();
    }

    addHooks<T>(name: string, hooks: ObservableHooks<T>): void {
        this._observableHooksArray.push(new PathObservableHooks<T>(name, hooks));
    }

    getHooks<T>(name: string): Nullable<ObservableHooks<T>> {
        const item = this._observableHooksArray.find((hook) => hook.name === name);
        return item ? item.observableHooks : null;
    }
}
