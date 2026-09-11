/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { ITextRangeParam } from '@univerjs/core';
import { toDisposable } from '@univerjs/core';
import { ContextMenuPosition } from '@univerjs/ui';
import { DocFloatMenuService } from '../float-menu.service';

export class MobileDocFloatMenuService extends DocFloatMenuService {
    protected override _openSelectionMenu(unitId: string, range: ITextRangeParam) {
        const [anchor] = this._docCanvasPopManagerService.getRangeBounds(range, unitId) ?? [];
        if (!anchor) {
            return;
        }
        this._contextMenuService.triggerContextMenu({
            clientX: (anchor.left + anchor.right) / 2,
            clientY: anchor.top,
            stopPropagation() {},
        }, ContextMenuPosition.MAIN_AREA, { unitId, subUnitId: unitId });
        this._floatMenu = {
            disposable: toDisposable(() => this._contextMenuService.hideContextMenu()),
            start: range.startOffset,
            end: range.endOffset,
            segmentId: range.segmentId ?? '',
        };
        return undefined;
    }
}
