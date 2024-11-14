/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICellCustomRender, IDisposable, Nullable } from '@univerjs/core';
import type { IDragCellPosition, IEditorBridgeServiceVisibleParam, IHoverCellPosition } from '@univerjs/sheets-ui';
import { ICommandService, Inject, Injector, InterceptorEffectEnum, toDisposable } from '@univerjs/core';
import { FSheetHooks, InterceptCellContentPriority, INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { DragManagerService, HoverManagerService, SetCellEditVisibleOperation } from '@univerjs/sheets-ui';

interface IFSheetHooksUIMixin {
        /**
         * The onCellPointerMove event is fired when a pointer changes coordinates.
         * @param callback Callback function that will be called when the event is fired
         * @returns A disposable object that can be used to unsubscribe from the event
         */
    onCellPointerMove(callback: (cellPos: Nullable<IHoverCellPosition>) => void): IDisposable;

    /**
     * The onCellPointerOver event is fired when a pointer is moved into a cell's hit test boundaries.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onCellPointerOver(callback: (cellPos: Nullable<IHoverCellPosition>) => void): IDisposable;

     /**
      * The onCellDragOver event is fired when an element or text selection is being dragged into a cell's hit test boundaries.
      * @param callback Callback function that will be called when the event is fired
      * @returns A disposable object that can be used to unsubscribe from the event
      */
    onCellDragOver(callback: (cellPos: Nullable<IDragCellPosition>) => void): IDisposable;

    /**
     * The onCellDrop event is fired when an element or text selection is being dropped on the cell.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onCellDrop(callback: (cellPos: Nullable<IDragCellPosition>) => void): IDisposable;

     /**
      * The onCellRender event is fired when a cell is rendered.
      * @param customRender Custom render function
      * @param effect The effect of the interceptor
      * @param priority The priority of the interceptor
      * @returns A disposable object that can be used to unsubscribe from the event
      */
    onCellRender(customRender: Nullable<ICellCustomRender[]>, effect?: InterceptorEffectEnum, priority?: number): IDisposable;

      /**
       * The onBeforeCellEdit event is fired before a cell is edited.
       * @param callback Callback function that will be called when the event is fired
       * @returns A disposable object that can be used to unsubscribe from the event
       */
    onBeforeCellEdit(callback: (params: IEditorBridgeServiceVisibleParam) => void): IDisposable;

     /**
      * The onAfterCellEdit event is fired after a cell is edited.
      * @param callback Callback function that will be called when the event is fired
      * @returns A disposable object that can be used to unsubscribe from the event
      */
    onAfterCellEdit(callback: (params: IEditorBridgeServiceVisibleParam) => void): IDisposable;
}

class FSheetHooksUIMixin extends FSheetHooks implements IFSheetHooksUIMixin {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(DragManagerService) private readonly _dragManagerService: DragManagerService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService
    ) {
        super();
    }

    /**
     * The onCellPointerMove event is fired when a pointer changes coordinates.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    override onCellPointerMove(callback: (cellPos: Nullable<IHoverCellPosition>) => void): IDisposable {
        return toDisposable(this._hoverManagerService.currentPosition$.subscribe(callback));
    }

    /**
     * The onCellPointerOver event is fired when a pointer is moved into a cell's hit test boundaries.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    override onCellPointerOver(callback: (cellPos: Nullable<IHoverCellPosition>) => void): IDisposable {
        return toDisposable(this._hoverManagerService.currentCell$.subscribe(callback));
    }

    /**
     * The onCellDragOver event is fired when an element or text selection is being dragged into a cell's hit test boundaries.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    override onCellDragOver(callback: (cellPos: Nullable<IDragCellPosition>) => void): IDisposable {
        return toDisposable(this._dragManagerService.currentCell$.subscribe(callback));
    }

    /**
     * The onCellDrop event is fired when an element or text selection is being dropped on the cell.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    override onCellDrop(callback: (cellPos: Nullable<IDragCellPosition>) => void): IDisposable {
        return toDisposable(this._dragManagerService.endCell$.subscribe(callback));
    }

    /**
     * The onCellRender event is fired when a cell is rendered.
     * @param customRender Custom render function
     * @param effect The effect of the interceptor
     * @param priority The priority of the interceptor
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    override onCellRender(customRender: Nullable<ICellCustomRender[]>, effect: InterceptorEffectEnum = InterceptorEffectEnum.Style, priority: number = InterceptCellContentPriority.DATA_VALIDATION): IDisposable {
        return this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            effect,
            handler: (cell, pos, next) => {
                return next({
                    ...cell,
                    customRender: [
                        ...(cell?.customRender || []),
                        ...(customRender || []),
                    ],
                });
            },
            priority,
        });
    }

    /**
     * The onBeforeCellEdit event is fired before a cell is edited.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    override onBeforeCellEdit(callback: (params: IEditorBridgeServiceVisibleParam) => void): IDisposable {
        return this._injector.get(ICommandService).beforeCommandExecuted((command) => {
            const params = command.params as IEditorBridgeServiceVisibleParam;
            if (command.id === SetCellEditVisibleOperation.id && params.visible) {
                callback(params);
            }
        });
    }

    /**
     * The onAfterCellEdit event is fired after a cell is edited.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    override onAfterCellEdit(callback: (params: IEditorBridgeServiceVisibleParam) => void): IDisposable {
        return this._injector.get(ICommandService).onCommandExecuted((command) => {
            const params = command.params as IEditorBridgeServiceVisibleParam;
            if (command.id === SetCellEditVisibleOperation.id && !params.visible) {
                callback(params);
            }
        });
    }
}

FSheetHooks.extend(FSheetHooksUIMixin);
declare module '@univerjs/sheets' {
    // eslint-disable-next-line ts/naming-convention
    interface FSheetHooks extends IFSheetHooksUIMixin {}
}
