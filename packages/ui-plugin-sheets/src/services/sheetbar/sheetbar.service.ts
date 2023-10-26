import { IMouseEvent, IPointerEvent } from '@univerjs/base-render';
import { Disposable, toDisposable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ISheetBarMenuHandler {
    handleSheetBarMenu(event: IPointerEvent | IMouseEvent, menuType: string): void;
}

export interface ISheetBarService {
    renameId$: Observable<string>;
    setRenameId(id: string): void;
    triggerSheetBarMenu(event: IPointerEvent | IMouseEvent, menuType: string): void;
    registerSheetBarMenuHandler(handler: ISheetBarMenuHandler): IDisposable;
}

export const ISheetBarService = createIdentifier<ISheetBarService>('univer.sheetbar-service');

export class SheetBarService extends Disposable implements ISheetBarService {
    readonly renameId$: Observable<string>;

    private readonly _renameId$: BehaviorSubject<string>;

    private _currentHandler: ISheetBarMenuHandler | null = null;

    constructor() {
        super();

        this._renameId$ = new BehaviorSubject('');
        this.renameId$ = this._renameId$.asObservable();
    }

    setRenameId(renameId: string): void {
        this._renameId$.next(renameId);
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
