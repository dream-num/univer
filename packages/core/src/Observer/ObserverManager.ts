import { Tools } from '../Shared/Tools';
import { Nullable } from '../Shared/Types';
import { Observable } from './Observable';

/**
 * WorkBookObserver for the specified path
 */
export class PathObservable<T = any> {
    namespace: string;

    path: string;

    observable: Observable<T>;

    constructor(path: string, namespace: string, observable: Observable<T>) {
        this.path = path;
        this.namespace = namespace;
        this.observable = observable;
    }
}

/**
 * Manage a set of PathObservables, Get, remove, add WorkBookObserver
 *
 * @deprecated ObserverManager is not necessary. Each service should manage its own observables.
 */
export class ObserverManager {
    private _observableArray: PathObservable[] = [];

    hasObserver(name: string, namespace: string): boolean {
        return this.getObserver(name, namespace) != null;
    }

    getObserver<T = void>(name: string): Nullable<Observable<T>>;
    getObserver<T = void>(name: string, namespace: string): Nullable<Observable<T>>;
    getObserver<T = void>(...parameter: any): Nullable<Observable<T>> {
        if (parameter.length === 1) {
            const name = parameter[0];

            const item = this._observableArray.find((obs) => obs.path === name);
            return item ? item.observable : null;
        }
        if (parameter.length === 2) {
            const name = parameter[0];
            const namespace = parameter[1];

            const item = this._observableArray.find((obs) => obs.path === name && obs.namespace === namespace);
            return item ? item.observable : null;
        }
    }

    requiredObserver<T = void>(name: string): Observable<T>;
    requiredObserver<T = void>(name: string, namespace: string): Observable<T>;
    requiredObserver<T = void>(...parameter: any): Observable<T> {
        if (Tools.hasLength(parameter, 1)) {
            const name = parameter[0];
            const observable = this.getObserver<T>(name);
            if (observable == null) {
                throw new Error(`not found observable ${name}`);
            }
            return observable;
        }
        if (Tools.hasLength(parameter, 2)) {
            const name = parameter[0];
            const namespace = parameter[1];
            const observable = this.getObserver<T>(name, namespace);
            if (observable == null) {
                throw new Error(`not found observable ${name}`);
            }
            return observable;
        }
        throw new Error(`requiredObserver arguments error`);
    }

    removeObserver<T = void>(name: string): void;
    removeObserver<T = void>(name: string, namespace: string): void;
    removeObserver<T = void>(...parameter: any): void {
        if (Tools.hasLength(parameter, 1)) {
            const name = parameter[0];
            const index = this._observableArray.findIndex((obs) => obs.path === name);
            if (index > -1) {
                this._observableArray.splice(index, 1);
            }
            return;
        }
        if (Tools.hasLength(parameter, 2)) {
            const name = parameter[0];
            const namespace = parameter[1];
            const index = this._observableArray.findIndex((obs) => obs.path === name && obs.namespace === namespace);
            if (index > -1) {
                this._observableArray.splice(index, 1);
            }
        }
    }

    addObserver<T = void>(name: string, observable: Observable<T>): void;
    addObserver<T = void>(name: string, namespace: string, observable: Observable<T>): void;
    addObserver<T = void>(...parameter: any): void {
        if (parameter.length === 1) {
            const name = parameter[0];
            const observable = parameter[1];
            if (this.hasObserver(name, name)) {
                this.removeObserver(name);
            }
            this._observableArray.push(new PathObservable<T>(name, name, observable));
            return;
        }
        if (parameter.length === 3) {
            const name = parameter[0];
            const namespace = parameter[1];
            const observable = parameter[2];
            if (this.hasObserver(name, name)) {
                this.removeObserver(name, namespace);
            }
            this._observableArray.push(new PathObservable<T>(name, namespace, observable));
        }
    }
}
