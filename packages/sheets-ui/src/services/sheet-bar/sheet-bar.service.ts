import { Disposable, toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import type { IScrollState } from '../../views/sheet-bar/sheet-bar-tabs/utils/slide-tab-bar';

export interface ISheetBarMenuHandler {
    handleSheetBarMenu(): void;
}

export interface ISheetBarService {
    renameId$: Observable<string>;
    scroll$: Observable<IScrollState>;
    scrollX$: Observable<number>;
    addSheet$: Observable<number>;
    setRenameId(id: string): void;
    setScroll(state: IScrollState): void;
    setScrollX(x: number): void;
    setAddSheet(index: number): void;
    triggerSheetBarMenu(): void;
    registerSheetBarMenuHandler(handler: ISheetBarMenuHandler): IDisposable;
}

export const ISheetBarService = createIdentifier<ISheetBarService>('univer.sheetbar-service');

export class SheetBarService extends Disposable implements ISheetBarService {
    readonly renameId$: Observable<string>;
    readonly scroll$: Observable<IScrollState>;
    readonly scrollX$: Observable<number>;
    readonly addSheet$: Observable<number>;

    private readonly _renameId$: Subject<string>;
    private readonly _scroll$: Subject<IScrollState>;
    private readonly _scrollX$: Subject<number>;
    private readonly _addSheet$: Subject<number>;

    private _currentHandler: ISheetBarMenuHandler | null = null;

    constructor() {
        super();

        this._renameId$ = new Subject();
        this.renameId$ = this._renameId$.asObservable();

        this._scroll$ = new Subject();
        this.scroll$ = this._scroll$.asObservable();

        this._scrollX$ = new Subject();
        this.scrollX$ = this._scrollX$.asObservable();

        this._addSheet$ = new Subject();
        this.addSheet$ = this._addSheet$.asObservable();
    }

    setRenameId(renameId: string): void {
        this._renameId$.next(renameId);
    }

    setScroll(state: IScrollState): void {
        this._scroll$.next(state);
    }

    setScrollX(x: number): void {
        this._scrollX$.next(x);
    }

    setAddSheet(index: number): void {
        this._addSheet$.next(index);
    }

    triggerSheetBarMenu(): void {
        this._currentHandler?.handleSheetBarMenu();
    }

    registerSheetBarMenuHandler(handler: ISheetBarMenuHandler): IDisposable {
        if (this._currentHandler) {
            throw new Error('There is already a context menu handler!');
        }

        this._currentHandler = handler;

        return toDisposable(() => {
            this._currentHandler = null;
        });
    }
}
