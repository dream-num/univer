import { createIdentifier } from '@wendellhu/redi';

import { SelectionManager } from '../Controller';
import { CanvasView } from '../View';

/** @deprecated temporary solution, we should inject SelectionManager directly */
export const ISelectionManager = createIdentifier<SelectionManager>('deprecated.univer.sheet.selection-manager');

export const ICanvasView = createIdentifier<CanvasView>('univer.sheet.canvas-view');
