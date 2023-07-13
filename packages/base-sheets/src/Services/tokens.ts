import { createIdentifier, Context, SheetContext } from '@univerjs/core';

import { Engine } from '@univerjs/base-render';

import { SheetPlugin } from '../SheetPlugin';
import { SelectionManager } from '../Controller';
import { CanvasView } from '../View';

export const IGlobalContext = createIdentifier<Context>('univer.global.context');

export const ISheetContext = createIdentifier<SheetContext>('univer.sheet.context');

export const IRenderingEngine = createIdentifier<Engine>('univer.render-engine');

/** @deprecated temp solution */
export const ISheetPlugin = createIdentifier<SheetPlugin>('deprecated.univer.sheet.plugin');

/** @deprecated temporary solution, we should inject SelectionManager directly */
export const ISelectionManager = createIdentifier<SelectionManager>('deprecated.univer.sheet.selection-manager');

export const ICanvasView = createIdentifier<CanvasView>('univer.sheet.canvas-view');
