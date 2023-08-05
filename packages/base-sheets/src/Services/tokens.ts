import { createIdentifier } from '@wendellhu/redi';

import { SheetPlugin } from '../SheetPlugin';
import { SelectionManager } from '../Controller';
import { CanvasView } from '../View';

/** @deprecated Temp solution. Remove this in august. */
export const ISheetPlugin = createIdentifier<SheetPlugin>('deprecated.univer.sheet.plugin');

/** @deprecated temporary solution, we should inject SelectionManager directly */
export const ISelectionManager = createIdentifier<SelectionManager>('deprecated.univer.sheet.selection-manager');

export const ICanvasView = createIdentifier<CanvasView>('univer.sheet.canvas-view');
