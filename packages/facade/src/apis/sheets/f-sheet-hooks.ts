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

import { type Nullable, toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';

import type { IDragCellPosition, IHoverCellPosition } from '@univerjs/sheets-ui';
import { DragManagerService, HoverManagerService } from '@univerjs/sheets-ui';

export class FSheetHooks {
    constructor(
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(DragManagerService) private readonly _dragManagerService: DragManagerService
    ) {
        // empty
    }

    /**
     * The onCellPointerMove event is fired when a pointer changes coordinates.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onCellPointerMove(callback: (cellPos: Nullable<IHoverCellPosition>) => void): IDisposable {
        return toDisposable(this._hoverManagerService.currentPosition$.subscribe(callback));
    }

    /**
     * The onCellPointerOver event is fired when a pointer is moved into a cell's hit test boundaries.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onCellPointerOver(callback: (cellPos: Nullable<IHoverCellPosition>) => void): IDisposable {
        return toDisposable(this._hoverManagerService.currentCell$.subscribe(callback));
    }

    /**
     * The onCellDragOver event is fired when an element or text selection is being dragged into a cell's hit test boundaries.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onCellDragOver(callback: (cellPos: Nullable<IDragCellPosition>) => void): IDisposable {
        return toDisposable(this._dragManagerService.currentCell$.subscribe(callback));
    }

    /**
     * The onCellDrop event is fired when an element or text selection is being dropped on the cell.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onCellDrop(callback: (cellPos: Nullable<IDragCellPosition>) => void): IDisposable {
        return toDisposable(this._dragManagerService.endCell$.subscribe(callback));
    }
}
