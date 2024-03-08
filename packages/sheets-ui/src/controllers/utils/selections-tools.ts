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

import type { IRange } from '@univerjs/core';
import { SelectionManagerService } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

export function rangesIsOverLapping(range1: IRange, range2: IRange): boolean {
    const rowsOverlap = !(range1.endRow < range2.startRow || range1.startRow > range2.endRow);
    const columnsOverlap = !(range1.endColumn < range2.startColumn || range1.startColumn > range2.endColumn);
    return rowsOverlap && columnsOverlap;
}

export function getSheetSelectionsDisabled$(accessor: IAccessor) {
    return new Observable<boolean>((subscriber) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        selectionManagerService.selectionMoveEnd$.subscribe((param) => {
            if (param == null) {
                return;
            }
            if (param.length < 2) {
                subscriber.next(false);
            } else {
                for (let i = 0; i < param.length; i++) {
                    for (let j = i + 1; j < param.length; j++) {
                        if (rangesIsOverLapping(param[i].range, param[j].range)) {
                            subscriber.next(true);
                            return;
                        }
                    }
                }
                subscriber.next(false);
            }
        });
    });
}
