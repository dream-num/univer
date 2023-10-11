import { IDisposable } from '@wendellhu/redi';
import { Subject, Subscription, SubscriptionLike } from 'rxjs';
import { isSubscription } from 'rxjs/internal/Subscription';

export function toDisposable(subscription: SubscriptionLike): IDisposable;
export function toDisposable(callback: () => void): IDisposable;
export function toDisposable(v: SubscriptionLike | (() => void)): IDisposable {
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

    dispose(): void {}
}

export class Disposable implements IDisposable {
    private readonly _collection = new DisposableCollection();

    disposeWithMe(disposable: IDisposable): IDisposable {
        return this._collection.add(disposable);
    }

    dispose(): void {
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
