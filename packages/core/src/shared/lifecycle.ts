/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { SubscriptionLike } from 'rxjs';
import type { IDisposable } from '../common/di';
import { Subject, Subscription } from 'rxjs';

type DisposableLike = IDisposable | SubscriptionLike | (() => void);

// eslint-disable-next-line ts/no-explicit-any
function isSubscriptionLike(value: any): value is SubscriptionLike {
    return value instanceof Subscription || value instanceof Subject ||
    (value && 'closed' in value && typeof value.unsubscribe !== 'undefined');
}

export function toDisposable(disposable: IDisposable): IDisposable;
export function toDisposable(subscription: SubscriptionLike): IDisposable;
export function toDisposable(callback: () => void): IDisposable;
export function toDisposable(v: DisposableLike): IDisposable;
export function toDisposable(v: DisposableLike): IDisposable {
    let disposed = false;

    if (!v) {
        return toDisposable(() => {
            // empty
        });
    }

    if (isSubscriptionLike(v)) {
        return {
            dispose: () => v.unsubscribe(),
        };
    }

    if (typeof v === 'function') {
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

    return v as IDisposable;
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

    add(disposable: DisposableLike): { dispose: (notDisposeSelf?: boolean) => void } {
        const d = toDisposable(disposable);
        this._disposables.add(d);

        return {
            dispose: (notDisposeSelf: boolean = false) => {
                if (!notDisposeSelf) {
                    d.dispose();
                }

                this._disposables.delete(d);
            },
        };
    }

    dispose(): void {
        this._disposables.forEach((item) => {
            item.dispose();
        });

        this._disposables.clear();
    }
}

export class Disposable implements IDisposable {
    protected _disposed = false;
    private readonly _collection = new DisposableCollection();

    public disposeWithMe(disposable: DisposableLike): IDisposable {
        return this._collection.add(disposable);
    }

    protected ensureNotDisposed(): void {
        if (this._disposed) {
            throw new Error('[Disposable]: object is disposed!');
        }
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

export class RCDisposable extends Disposable {
    private _ref = 0;

    constructor(private readonly _rootDisposable: IDisposable) {
        super();
    }

    inc(): void {
        if (this._disposed) {
            throw new Error('[RCDisposable]: should not ref to a disposed.');
        }
        this._ref += 1;
    }

    dec(): void {
        this._ref -= 1;

        if (this._ref === 0) {
            this._rootDisposable.dispose();
            this.dispose();
        }
    }
}
