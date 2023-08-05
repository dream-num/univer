import { createIdentifier } from '@wendellhu/redi';
import { SheetContext } from '@univerjs/core';

import { SheetPlugin } from '../SheetPlugin';
import { SelectionManager } from '../Controller';
import { CanvasView } from '../View';

/** @deprecated this is a temp solution */
export const ISheetContext = createIdentifier<SheetContext>('univer.sheet.context');

/** @deprecated temp solution */
export const ISheetPlugin = createIdentifier<SheetPlugin>('deprecated.univer.sheet.plugin');

/** @deprecated temporary solution, we should inject SelectionManager directly */
export const ISelectionManager = createIdentifier<SelectionManager>('deprecated.univer.sheet.selection-manager');

export const ICanvasView = createIdentifier<CanvasView>('univer.sheet.canvas-view');
