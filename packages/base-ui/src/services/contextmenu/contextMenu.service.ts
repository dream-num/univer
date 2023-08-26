import { createIdentifier } from '@wendellhu/redi';

export interface IContextMenuItem {
    setContextMenuSchema(): void;
}

export interface IContextMenuService {}

export const IContextMenuService = createIdentifier<IContextMenuService>('univer.context-menu-service');
