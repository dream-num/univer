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
import { HyperLinkModel } from '@univerjs/sheets-hyper-link';
import { SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject, Subject } from 'rxjs';
import { Disposable } from '@univerjs/core';
import { CellLinkPopup } from '../views/CellLinkPopup';

interface IHyperLinkPopup {
    unitId: string;
    subUnitId: string;
    id: string;
    disposable?: IDisposable;
    row: number;
    col: number;
}

interface IHyperLinkEditing {
    unitId: string;
    subUnitId: string;
    row: number;
    column: number;
}

const isEqualLink = (a: ISheetLocationBase, b: ISheetLocationBase) => {
    return a.unitId === b.unitId && a.subUnitId === b.subUnitId && a.row === b.row && a.col === b.col;
};

export class SheetsHyperLinkPopupService extends Disposable {
    private _currentPopup: IHyperLinkPopup | null = null;
    private _currentPopup$ = new Subject<IHyperLinkPopup | null>();
    currentPopup$ = this._currentPopup$.asObservable();

    private _currentEditing$ = new BehaviorSubject<IHyperLinkEditing | null>(null);
    currentEditing$ = this._currentEditing$.asObservable();

    get currentPopup() {
        return this._currentPopup;
    }

    get currentEditing() {
        return this._currentEditing$.getValue();
    }

    constructor(
        @Inject(HyperLinkModel) private readonly _hyperLinkModel: HyperLinkModel,
        @Inject(SheetCanvasPopManagerService) private readonly _sheetCanvasPopManagerService: SheetCanvasPopManagerService
    ) {
        super();

        this.disposeWithMe(() => {
            this.hideCurrentPopup();
            this.endEditing();

            this._currentEditing$.complete();
            this._currentPopup$.complete();
        });
    }

    showPopup(location: ISheetLocationBase) {
        if (this._currentPopup && isEqualLink(location, this._currentPopup)) {
            return;
        }

        this.hideCurrentPopup();
        const { unitId, subUnitId, row, col } = location;

        const link = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, col);
        if (!link) {
            return;
        }

        const disposable = this._sheetCanvasPopManagerService.attachPopupToCell(row, col, {
            componentKey: CellLinkPopup.componentKey,
            direction: 'bottom',
            closeOnSelfTarget: true,
        });
        if (disposable) {
            this._currentPopup = {
                unitId,
                subUnitId,
                id: link.id,
                disposable,
                row,
                col,
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
        this._currentEditing$.next(link);
    }

    endEditing() {
        this._currentEditing$.next(null);
    }
}
