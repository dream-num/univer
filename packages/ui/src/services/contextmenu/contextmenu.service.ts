import { IMouseEvent, IPointerEvent } from '@univerjs/engine-render';
import { Disposable, toDisposable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';

export interface IContextMenuHandler {
    /** A callback to open context menu with given position and menu type. */
    handleContextMenu(event: IPointerEvent | IMouseEvent, menuType: string): void;
}

export interface IContextMenuService {
    triggerContextMenu(event: IPointerEvent | IMouseEvent, menuType: string): void;
    registerContextMenuHandler(handler: IContextMenuHandler): IDisposable;
}

export const IContextMenuService = createIdentifier<IContextMenuService>('univer.context-menu-service');

export class DesktopContextMenuService extends Disposable implements IContextMenuService {
    private _currentHandler: IContextMenuHandler | null = null;

    triggerContextMenu(event: IPointerEvent | IMouseEvent, menuType: string): void {
        event.stopPropagation();
        this._currentHandler?.handleContextMenu(event, menuType);
    }

    registerContextMenuHandler(handler: IContextMenuHandler): IDisposable {
        if (this._currentHandler) {
            throw new Error('There is already a context menu handler!');
        }

        this._currentHandler = handler;

        return toDisposable(() => {
            this._currentHandler = null;
        });
    }
}
