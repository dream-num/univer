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

import type { ISheetLocationBase } from '@univerjs/sheets';
import { getCustomRangePosition, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import type { ICustomRange, IDisposable, Nullable } from '@univerjs/core';
import { Disposable, Inject, Injector } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';
import type { IBoundRectNoAngle } from '@univerjs/engine-render';
import { CellLinkPopup } from '../views/CellLinkPopup';
import { CellLinkEdit } from '../views/CellLinkEdit';

export interface IHyperLinkPopup {
    unitId: string;
    subUnitId: string;
    disposable?: IDisposable;
    row: number;
    col: number;
    editPermission: boolean;
    copyPermission: boolean;
    customRange: ICustomRange;
}

interface IHyperLinkEditing {
    unitId: string;
    subUnitId: string;
    row: number;
    col: number;
    customRangeId: string;
}

const isEqualLink = (a: IHyperLinkPopupOptions, b: IHyperLinkPopup) => {
    return (
        a.unitId === b.unitId
        && a.subUnitId === b.subUnitId
        && a.row === b.row
        && a.col === b.col
        && a.customRange?.rangeId === b.customRange?.rangeId
    );
};

interface IHyperLinkPopupOptions extends ISheetLocationBase {
    editPermission?: boolean;
    copyPermission?: boolean;
    customRange?: Nullable<ICustomRange>;
    customRangeRect?: Nullable<IBoundRectNoAngle>;
}

export class SheetsHyperLinkPopupService extends Disposable {
    private _currentPopup: IHyperLinkPopup | null = null;
    private _currentPopup$ = new Subject<IHyperLinkPopup | null>();
    currentPopup$ = this._currentPopup$.asObservable();
    private _currentEditingPopup: Nullable<IDisposable> = null;

    private _currentEditing$ = new BehaviorSubject<(IHyperLinkEditing & { customRange: ICustomRange; label: string }) | null>(null);
    currentEditing$ = this._currentEditing$.asObservable();

    get currentPopup() {
        return this._currentPopup;
    }

    get currentEditing() {
        return this._currentEditing$.getValue();
    }

    constructor(
        @Inject(SheetCanvasPopManagerService) private readonly _sheetCanvasPopManagerService: SheetCanvasPopManagerService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this.disposeWithMe(() => {
            this.hideCurrentPopup();
            this.endEditing();

            this._currentEditing$.complete();
            this._currentPopup$.complete();
        });
    }

    showPopup(location: IHyperLinkPopupOptions) {
        if (this._currentPopup && isEqualLink(location, this._currentPopup)) {
            return;
        }

        this.hideCurrentPopup();
        const { unitId, subUnitId, row, col, customRangeRect, customRange } = location;
        if (!customRangeRect || !customRange) {
            return;
        }

        const disposable = this._sheetCanvasPopManagerService.attachPopupByPosition(
            customRangeRect,
            {
                componentKey: CellLinkPopup.componentKey,
                direction: 'bottom',
                closeOnSelfTarget: true,
                onClickOutside: () => {
                    this.hideCurrentPopup();
                },
            });

        if (disposable) {
            this._currentPopup = {
                unitId,
                subUnitId,
                disposable,
                row,
                col,
                editPermission: !!location.editPermission,
                copyPermission: !!location.copyPermission,
                customRange,
            };
            this._currentPopup$.next(this._currentPopup);
        }
    }

    hideCurrentPopup() {
        if (this._currentPopup) {
            this._currentPopup.disposable?.dispose();
            this._currentPopup = null;
            this._currentPopup$.next(null);
        }
    }

    startEditing(link: IHyperLinkEditing) {
        this._currentEditingPopup?.dispose();
        const customRangeInfo = getCustomRangePosition(this._injector, link.unitId, link.subUnitId, link.row, link.col, link.customRangeId);
        if (!customRangeInfo) {
            return;
        }

        const { rects, customRange, label } = customRangeInfo;
        if (rects?.length) {
            this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupByPosition(
                rects.pop()!,
                {
                    componentKey: CellLinkEdit.componentKey,
                    direction: 'bottom',
                    closeOnSelfTarget: true,
                    onClickOutside: () => {
                        this.hideCurrentPopup();
                    },
                }
            );
            this._currentEditing$.next({
                ...link,
                customRange,
                label,
            });
        }
    }

    endEditing() {
        this._currentEditingPopup?.dispose();
        this._currentEditing$.next(null);
    }
}
