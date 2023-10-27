import { IMouseEvent, IPointerEvent } from '@univerjs/base-render';
import { Disposable, toDisposable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { IScrollState } from '../../View/SheetBar/SheetBarTabs/utils/slide-tab-bar';

export interface ISheetBarMenuHandler {
    handleSheetBarMenu(event: IPointerEvent | IMouseEvent, menuType: string): void;
}

export interface ISheetBarService {
    renameId$: Observable<string>;
    scroll$: Observable<IScrollState>;
    scrollX$: Observable<number>;
    setRenameId(id: string): void;
    setScroll(state: IScrollState): void;
    setScrollX(x: number): void;
    triggerSheetBarMenu(event: IPointerEvent | IMouseEvent, menuType: string): void;
    registerSheetBarMenuHandler(handler: ISheetBarMenuHandler): IDisposable;
}

export const ISheetBarService = createIdentifier<ISheetBarService>('univer.sheetbar-service');

export class SheetBarService extends Disposable implements ISheetBarService {
    readonly renameId$: Observable<string>;
    readonly scroll$: Observable<IScrollState>;
    readonly scrollX$: Observable<number>;

    private readonly _renameId$: BehaviorSubject<string>;
    private readonly _scroll$: Subject<IScrollState>;
    private readonly _scrollX$: Subject<number>;

    private _currentHandler: ISheetBarMenuHandler | null = null;

    constructor() {
        super();

        this._renameId$ = new BehaviorSubject('');
        this.renameId$ = this._renameId$.asObservable();

        this._scroll$ = new Subject();
        this.scroll$ = this._scroll$.asObservable();

        this._scrollX$ = new Subject();
        this.scrollX$ = this._scrollX$.asObservable();
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

    triggerSheetBarMenu(event: IPointerEvent | IMouseEvent, menuType: string): void {
        this._currentHandler?.handleSheetBarMenu(event, menuType);
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
