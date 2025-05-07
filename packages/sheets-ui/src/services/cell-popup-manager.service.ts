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

import type { IDisposable } from '@univerjs/core';
import type { ISheetLocationBase } from '@univerjs/sheets';
import type { ICanvasPopup } from './canvas-pop-manager.service';
import { Disposable, generateRandomId, Inject, ObjectMatrix, toDisposable } from '@univerjs/core';
import { Subject } from 'rxjs';
import { CELL_POPUP_COMPONENT_KEY } from '../views/cell-popup/config';
import { SheetCanvasPopManagerService } from './canvas-pop-manager.service';

export interface ICellPopup extends Omit<ICanvasPopup, 'direction' | 'offset' | 'mask'> {
    direction?: 'horizontal' | 'vertical';
    id?: string;
    priority: number;
}

export interface ICellPopupDirectionCache {
    popups: ICellPopup[];
    disposable: IDisposable;
}

export interface ICellPopupCache {
    horizontal?: ICellPopupDirectionCache;
    vertical?: ICellPopupDirectionCache;
}

export interface ICellPopupChange extends ISheetLocationBase {
    direction: 'horizontal' | 'vertical';
}

export class CellPopupManagerService extends Disposable {
    private readonly _cellPopupMap = new Map<string, Map<string, ObjectMatrix<ICellPopupCache>>>();
    private readonly _change$ = new Subject<ICellPopupChange>();
    readonly change$ = this._change$.asObservable();

    constructor(
        @Inject(SheetCanvasPopManagerService) private readonly _sheetCanvasPopManagerService: SheetCanvasPopManagerService
    ) {
        super();
    }

    private _ensureCellPopupMap(unitId: string, subUnitId: string) {
        let unitMap = this._cellPopupMap.get(unitId);
        if (!unitMap) {
            unitMap = new Map();
            this._cellPopupMap.set(unitId, unitMap);
        }
        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new ObjectMatrix<ICellPopupCache>();
            unitMap.set(subUnitId, subUnitMap);
        }
        return subUnitMap;
    }

    showPopup(location: ISheetLocationBase, popup: ICellPopup) {
        const { direction = 'horizontal' } = popup;
        const { unitId, subUnitId, row, col } = location;
        const subUnitMap = this._ensureCellPopupMap(unitId, subUnitId);
        const directionCache = subUnitMap.getValue(row, col)?.[direction];

        popup.id = popup.id ?? generateRandomId();

        const hidePopup = () => {
            const root = subUnitMap.getValue(row, col);
            if (!root) {
                return;
            }
            const directionCache = root[direction];
            if (!directionCache) {
                return;
            }

            const findIndex = directionCache?.popups.findIndex((p) => p.id === popup.id && p.componentKey === popup.componentKey);
            directionCache?.popups.splice(findIndex, 1);

            if (directionCache.popups.length === 0) {
                directionCache.disposable.dispose();
                root[direction] = undefined;
            }

            this._change$.next({
                ...location,
                direction,
            });
        };

        if (!directionCache) {
            const disposable = this._sheetCanvasPopManagerService.attachPopupToCell(
                row,
                col,
                {
                    ...popup,
                    direction,
                    componentKey: CELL_POPUP_COMPONENT_KEY,
                    extraProps: {
                        ...location,
                        direction,
                    },
                    noPushMinimumGap: true,
                    autoRelayout: false,
                },
                unitId,
                subUnitId
            );

            subUnitMap.setValue(row, col, {
                ...subUnitMap.getValue(row, col),
                [direction]: {
                    disposable,
                    popups: [popup],
                },
            });
        } else {
            directionCache.popups.push(popup);
            directionCache.popups.sort((a, b) => a.priority - b.priority);
        }

        this._change$.next({
            ...location,
            direction,
        });

        return toDisposable(hidePopup);
    }

    getPopups(unitId: string, subUnitId: string, row: number, col: number, direction: 'horizontal' | 'vertical') {
        const subUnitMap = this._ensureCellPopupMap(unitId, subUnitId);
        return subUnitMap.getValue(row, col)?.[direction]?.popups || [];
    }
}
