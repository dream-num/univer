import { Disposable } from '@univerjs/core';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

export class ShortcutPanelService extends Disposable {
    private _open$ = new BehaviorSubject<boolean>(false);
    open$ = this._open$.pipe(distinctUntilChanged());
    get isOpen(): boolean {
        return this._open$.getValue();
    }

    override dispose(): void {
        this._open$.next(false);
        this._open$.complete();
    }

    open(): void {
        this._open$.next(true);
    }

    close(): void {
        this._open$.next(false);
    }
}
