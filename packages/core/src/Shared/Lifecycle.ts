import { IDisposable } from '@wendellhu/redi';

export function toDisposable(callback: () => void): IDisposable {
    return {
        dispose: callback,
    };
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
