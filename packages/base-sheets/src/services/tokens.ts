import { createIdentifier } from '@wendellhu/redi';

import { CanvasView } from '../View';

/** @deprecated temporary solution, we should inject SelectionManager directly. And it should be renamed to `ISelectionService`. */
// export const ISelectionManager = createIdentifier<SelectionManager>('deprecated.univer.sheet.selection-manager');

export const ICanvasView = createIdentifier<CanvasView>('univer.sheet.canvas-view');
