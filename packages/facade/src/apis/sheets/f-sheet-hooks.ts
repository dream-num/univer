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

import type { IHoverCellPosition } from '@univerjs/sheets-ui';
import { HoverManagerService } from '@univerjs/sheets-ui';

export class FSheetHooks {
    constructor(
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService
    ) { }

    /**
     * Subscribe to the location information of the currently hovered cell
     * @returns
     */
    onCellPointerMove(callback: (cellPos: Nullable<IHoverCellPosition>) => void): IDisposable {
        return toDisposable(this._hoverManagerService.currentCell$.subscribe(callback));
    }
}
