import { createIdentifier } from '@wendellhu/redi';

export interface IToolbarItem {}

export interface IToolbarService {}

export const IToolbarService = createIdentifier<IToolbarService>('univer.toolbar-service');

export class DesktopToolbarService implements IToolbarService {}
