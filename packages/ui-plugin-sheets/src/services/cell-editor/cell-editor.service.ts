import { createIdentifier } from '@wendellhu/redi';

// On mobile platforms cell editor maybe implemented with a very different tech
// stack. So cell editor service must be an abstract dependency.

export interface ICellEditorService {
    initialize(): void;
    enterEditing(): void;
    quitEditing(): void;
}

export const ICellEditorService = createIdentifier<ICellEditorService>('univer.cell-editor-service');
