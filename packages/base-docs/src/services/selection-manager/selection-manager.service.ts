import { createIdentifier } from '@wendellhu/redi';

export interface ISelectionManagerService {}

export const ISelectionManagerService = createIdentifier<ISelectionManagerService>('doc.selection-manager-service');

export class SelectionManagerService implements ISelectionManagerService {}
