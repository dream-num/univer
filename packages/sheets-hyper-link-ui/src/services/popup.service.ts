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
import type { ICanvasPopup } from '@univerjs/sheets-ui';
import { getCustomRangePosition, getEditingCustomRangePosition, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import type { ICustomRange, IDisposable, INeedCheckDisposable, Nullable } from '@univerjs/core';
import { Disposable, Inject, Injector } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';
import type { IBoundRectNoAngle } from '@univerjs/engine-render';
import { CellLinkPopup } from '../views/CellLinkPopup';
import { CellLinkEdit } from '../views/CellLinkEdit';
import { HyperLinkEditSourceType } from '../types/enums/edit-source';

export interface IHyperLinkPopup {
    unitId: string;
    subUnitId: string;
    disposable: INeedCheckDisposable;
    row: number;
    col: number;
    editPermission?: boolean;
    copyPermission?: boolean;
    customRange: ICustomRange;
    type: HyperLinkEditSourceType;
}

interface IHyperLinkEditing {
    unitId: string;
    subUnitId: string;
    row: number;
    col: number;
    customRangeId: string;
    type: HyperLinkEditSourceType;
}

const isEqualLink = (a: IHyperLinkPopupOptions, b: Omit<IHyperLinkPopup, 'disposable' | 'editPermission'>) => {
    return (
        a.unitId === b.unitId
        && a.subUnitId === b.subUnitId
        && a.row === b.row
        && a.col === b.col
        && a.customRange?.rangeId === b.customRange?.rangeId
        && a.type === b.type
    );
};

interface IHyperLinkPopupOptions extends ISheetLocationBase {
    editPermission?: boolean;
    copyPermission?: boolean;
    customRange?: Nullable<ICustomRange>;
    customRangeRect?: Nullable<IBoundRectNoAngle>;
    type: HyperLinkEditSourceType;
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

        this.hideCurrentPopup(undefined, true);
        const currentEditing = this._currentEditing$.getValue();
        if (currentEditing && isEqualLink(location, currentEditing)) {
            return;
        }

        const { unitId, subUnitId, row, col, customRangeRect, customRange } = location;
        if (!customRangeRect || !customRange) {
            return;
        }
        let disposable;
        const popup: ICanvasPopup = {
            componentKey: CellLinkPopup.componentKey,
            direction: 'bottom',
            closeOnSelfTarget: true,
            onClickOutside: () => {
                this.hideCurrentPopup();
            },
        };
        if (location.type === HyperLinkEditSourceType.EDITING) {
            disposable = this._sheetCanvasPopManagerService.attachPopupToAbsolutePosition(
                customRangeRect,
                popup
            );
        } else {
            disposable = this._sheetCanvasPopManagerService.attachPopupByPosition(
                customRangeRect,
                popup
            );
        }

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
                type: location.type,
            };
            this._currentPopup$.next(this._currentPopup);
        }
    }

    hideCurrentPopup(type?: HyperLinkEditSourceType, force?: boolean) {
        if (!this._currentPopup) {
            return;
        }

        if (((!type || type === this._currentPopup.type) && this._currentPopup.disposable.canDispose()) || force) {
            this._currentPopup?.disposable?.dispose();
            this._currentPopup = null;
            this._currentPopup$.next(null);
        }
    }

    startEditing(link: IHyperLinkEditing) {
        this._currentEditingPopup?.dispose();
        this.hideCurrentPopup(undefined, true);

        let customRangeInfo;
        if (link.type === HyperLinkEditSourceType.EDITING) {
            customRangeInfo = getEditingCustomRangePosition(this._injector, link.unitId, link.subUnitId, link.row, link.col, link.customRangeId);
        } else {
            customRangeInfo = getCustomRangePosition(this._injector, link.unitId, link.subUnitId, link.row, link.col, link.customRangeId);
        }
        if (!customRangeInfo) {
            return;
        }

        const { unitId, subUnitId } = link;
        const { rects, customRange, label } = customRangeInfo;
        if (rects?.length) {
            const popup: ICanvasPopup = {
                componentKey: CellLinkEdit.componentKey,
                direction: 'bottom',
                closeOnSelfTarget: true,
                onClickOutside: () => {
                    this.hideCurrentPopup();
                },
            };
            if (link.type === HyperLinkEditSourceType.EDITING) {
                this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupToAbsolutePosition(
                    rects.pop()!,
                    popup,
                    unitId,
                    subUnitId
                );
            } else {
                this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupByPosition(
                    rects.pop()!,
                    popup,
                    unitId,
                    subUnitId
                );
            }
            this._currentEditing$.next({
                ...link,
                customRange,
                label,
            });
        }
    }

    endEditing(type?: HyperLinkEditSourceType) {
        const current = this._currentEditing$.getValue();
        if (current && (!type || type === current.type)) {
            this._currentEditingPopup?.dispose();
            this._currentEditing$.next(null);
        }
    }
}
