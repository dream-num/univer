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

import { Rectangle } from '@univerjs/core';
import { SelectionManagerService } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';
import { filter, map } from 'rxjs';

export function getSheetSelectionsDisabled$(accessor: IAccessor) {
    const selectionManagerService = accessor.get(SelectionManagerService);

    return selectionManagerService.selectionMoveEnd$.pipe(
        filter((param) => param != null && param.length >= 2),
        map((param) => {
            if (!param) return false;
            for (let i = 0; i < param.length; i++) {
                for (let j = i + 1; j < param.length; j++) {
                    if (Rectangle.intersects(param[i].range, param[j].range)) {
                        return true;
                    }
                }
            }
            return false;
        })
    );
}
