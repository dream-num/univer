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
import { CellPopupManagerService, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { IZenZoneService } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import { SHEETS_THREAD_COMMENT_MODAL } from '../types/const';

export interface IThreadCommentPopup extends ISheetLocationBase {
    commentId?: string;
    // when triggered by hover, temp is set to be `true`
    temp?: boolean;
    trigger?: string;
}

export class SheetsThreadCommentPopupService extends Disposable {
    private _lastPopup: Nullable<IDisposable> = null;
    private _activePopup: Nullable<IThreadCommentPopup>;
    private _activePopup$ = new BehaviorSubject<Nullable<IThreadCommentPopup>>(null);

    activePopup$ = this._activePopup$.asObservable();

    get activePopup() {
        return this._activePopup;
    }

    constructor(
        @Inject(SheetCanvasPopManagerService) private readonly _canvasPopupManagerService: SheetCanvasPopManagerService,
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

    showPopup(location: IThreadCommentPopup, onHide?: () => void) {
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
                row,
                col,
                unitId,
                subUnitId,
            },
            {
                componentKey: SHEETS_THREAD_COMMENT_MODAL,
                onClickOutside: () => {
                    this.hidePopup();
                },
                direction: 'horizontal',
                excludeOutside: [
                    ...Array.from(document.querySelectorAll('.univer-thread-comment')),
                    document.getElementById('thread-comment-add'),
                ].filter(Boolean) as HTMLElement[],
                priority: 2,
            }
        );

        if (!popupDisposable) {
            throw new Error('[SheetsThreadCommentPopupService]: cannot show popup!');
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

    hidePopup() {
        if (!this._activePopup) {
            return;
        }
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
