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

import type { IDisposable, Nullable } from '@univerjs/core';
import type { ISheetLocationBase } from '@univerjs/sheets';
import { Disposable, DisposableCollection, Inject } from '@univerjs/core';
import { CellPopupManagerService } from '@univerjs/sheets-ui';
import { IZenZoneService } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import { SHEET_NOTE_COMPONENT } from '../views/config';

interface INotePopup extends ISheetLocationBase {
    noteId?: string;
    temp?: boolean;
    trigger?: string;
}

export class SheetsNotePopupService extends Disposable {
    private _lastPopup: Nullable<IDisposable> = null;
    private _activePopup: Nullable<INotePopup>;
    private _activePopup$ = new BehaviorSubject<Nullable<INotePopup>>(null);

    activePopup$ = this._activePopup$.asObservable();

    get activePopup() {
        return this._activePopup;
    }

    constructor(
        @IZenZoneService private readonly _zenZoneService: IZenZoneService,
        @Inject(CellPopupManagerService) private readonly _cellPopupManagerService: CellPopupManagerService
    ) {
        super();
        this._initZenVisible();

        this.disposeWithMe(() => {
            this._activePopup$.complete();
        });
    }

    private _initZenVisible() {
        this.disposeWithMe(this._zenZoneService.visible$.subscribe((visible) => {
            if (visible) {
                this.hidePopup();
            }
        }));
    }

    showPopup(location: INotePopup, onHide?: () => void) {
        const { row, col, unitId, subUnitId } = location;
        if (
            this._activePopup &&
            row === this._activePopup.row &&
            col === this._activePopup.col &&
            unitId === this._activePopup.unitId &&
            subUnitId === this.activePopup?.subUnitId
        ) {
            this._activePopup = location;
            this._activePopup$.next(location);
            return;
        }
        if (this._lastPopup) {
            this._lastPopup.dispose();
        };
        if (this._zenZoneService.visible) {
            return;
        }

        this._activePopup = location;
        this._activePopup$.next(location);

        const popupDisposable = this._cellPopupManagerService.showPopup(
            {
                unitId,
                subUnitId,
                row,
                col,
            },
            {
                componentKey: SHEET_NOTE_COMPONENT,
                onClickOutside: () => {
                    this.hidePopup();
                },
                direction: 'horizontal',
                extraProps: {
                    location,
                },
                priority: 3,
            }
        );

        if (!popupDisposable) {
            throw new Error('[SheetsNotePopupService]: cannot show popup!');
        }

        const disposableCollection = new DisposableCollection();
        disposableCollection.add(popupDisposable);
        disposableCollection.add({
            dispose: () => {
                onHide?.();
            },
        });

        this._lastPopup = disposableCollection;
    }

    hidePopup(force?: boolean) {
        if (!this._activePopup) {
            return;
        }
        if (!force && !this._activePopup.temp) return;
        if (this._lastPopup) {
            this._lastPopup.dispose();
        }
        this._lastPopup = null;

        this._activePopup = null;
        this._activePopup$.next(null);
    }

    persistPopup() {
        if (!this._activePopup || !this._activePopup.temp) {
            return;
        }
        this._activePopup = {
            ...this._activePopup,
            temp: false,
        };

        this._activePopup$.next(this._activePopup);
    }
}
