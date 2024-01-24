/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IDisposable } from '@wendellhu/redi';
import type { Subscription, SubscriptionLike } from 'rxjs';
import { Subject } from 'rxjs';
import { isSubscription } from 'rxjs/internal/Subscription';

import type { Nullable } from '../common/type-utils';
import type { Observer } from '../observer/observable';
import { isObserver } from '../observer/observable';

export function toDisposable(observer: Nullable<Observer<any>>): IDisposable;
export function toDisposable(subscription: SubscriptionLike): IDisposable;
export function toDisposable(callback: () => void): IDisposable;
export function toDisposable(v: SubscriptionLike | (() => void) | Nullable<Observer<any>>): IDisposable {
    let disposed = false;

    if (isSubscription(v)) {
        return {
            dispose: () => {
                if (disposed) {
                    return;
                }

                disposed = true;
                v.unsubscribe();
            },
        };
    }

    /**
     * Represent an WorkBookObserver registered to a given Observable object.
     * The current implementation of the rendering layer is still in use.
     *
     * @deprecated use rxjs instead
     */
    if (isObserver(v)) {
        return {
            dispose: () => {
                if (disposed) {
                    return;
                }

                disposed = true;
                (v as Observer).dispose();
            },
        };
    }

    return {
        dispose: () => {
            if (disposed) {
                return;
            }

            disposed = true;
            (v as () => void)();
        },
    };
}

/**
 * @deprecated use toDisposable instead
 */
export function fromObservable(subscription: Subscription) {
    return toDisposable(() => {
        subscription.unsubscribe();
    });
}

export class DisposableCollection implements IDisposable {
    private readonly _disposables = new Set<IDisposable>();

    add(disposable: IDisposable): IDisposable {
        this._disposables.add(disposable);
        return {
            dispose: () => {
                disposable.dispose();
                this._disposables.delete(disposable);
            },
        };
    }

    dispose(): void {
        this._disposables.forEach((item) => {
            item.dispose();
            this._disposables.delete(item);
        });
    }
}

export class Disposable implements IDisposable {
    protected _disposed = false;
    private readonly _collection = new DisposableCollection();

    protected disposeWithMe(disposable: IDisposable | SubscriptionLike): IDisposable {
        const d = isSubscription(disposable) ? toDisposable(disposable) : (disposable as IDisposable);
        return this._collection.add(d);
    }

    dispose(): void {
        if (this._disposed) {
            return;
        }

        this._disposed = true;
        this._collection.dispose();
    }
}

export class RxDisposable extends Disposable implements IDisposable {
    protected dispose$ = new Subject<void>();

    override dispose(): void {
        super.dispose();
        this.dispose$.next();
        this.dispose$.complete();
    }
}
