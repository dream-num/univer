import { Disposable, toDisposable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface IMenuItemState<T = any> {
    disabled: boolean;
    hidden: boolean;
    checked: boolean;

    data?: T;
}

export interface IMenuItem {
    id: string;
    title: string;
    description: string;

    handler: () => void;
    onItemStateChange: (itemState: IMenuItemState) => void;
}

export const IMenuService = createIdentifier<IMenuService>('univer.menu-service');

export interface IMenuService {
    addMenuItem(item: IMenuItem): IDisposable;
    getMenuItem(id: string): IMenuItem | null;
}

export class DesktopMenuService extends Disposable implements IMenuService {
    private readonly _menuItemMap = new Map<string, IMenuItem>();

    override dispose(): void {
        this._menuItemMap.clear();
    }

    addMenuItem(item: IMenuItem): IDisposable {
        if (this._menuItemMap.has(item.id)) {
            throw new Error(`Menu item with the same id ${item.id} has already been added!`);
        }

        this._menuItemMap.set(item.id, item);
        return toDisposable(() => this._menuItemMap.delete(item.id));
    }

    getMenuItem(id: string): IMenuItem | null {
        if (this._menuItemMap.has(id)) {
            return this._menuItemMap.get(id)!;
        }

        return null;
    }
}