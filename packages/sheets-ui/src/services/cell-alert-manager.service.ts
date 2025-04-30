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
import { Disposable, Inject } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { CELL_ALERT_KEY } from '../views/cell-alert';
import { SheetCanvasPopManagerService } from './canvas-pop-manager.service';
import { CellPopupManagerService } from './cell-popup-manager.service';

export enum CellAlertType {
    INFO,
    WARNING,
    ERROR,
}

export interface ICellAlert {
    type: CellAlertType;
    title: React.ReactNode;
    message: React.ReactNode;
    location: ISheetLocationBase;
    width: number;
    height: number;
    key: string;
}

export class CellAlertManagerService extends Disposable {
    private _currentAlert$ = new Subject<[string, { alert: ICellAlert; dispose: IDisposable }][]>();
    private _currentAlert: Map<string, { alert: ICellAlert; dispose: IDisposable }> = new Map();

    get currentAlert() {
        return this._currentAlert;
    }

    currentAlert$ = this._currentAlert$.asObservable();

    constructor(
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetCanvasPopManagerService) private readonly _canvasPopManagerService: SheetCanvasPopManagerService,
        @Inject(CellPopupManagerService) private readonly _cellPopupManagerService: CellPopupManagerService
    ) {
        super();

        this.disposeWithMe(() => {
            this._currentAlert$.complete();
        });
    }

    showAlert(alert: ICellAlert) {
        let lastPopup = this._currentAlert.get(alert.key);
        if (lastPopup) {
            lastPopup.dispose.dispose();
        };
        if (lastPopup) {
            lastPopup.dispose.dispose();
        } else {
            lastPopup = {
                alert,
                dispose: {
                    dispose() {
                        // empty
                    },
                },
            };
            this._currentAlert.set(alert.key, lastPopup);
        }

        const { location } = alert;
        const { row, col, unitId, subUnitId } = location;

        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender) {
            return;
        }

        const disposable = this._cellPopupManagerService.showPopup(
            {
                unitId,
                subUnitId,
                row,
                col,
            },
            {
                componentKey: CELL_ALERT_KEY,
                direction: 'horizontal',
                extraProps: {
                    alert,
                },
                priority: 1,
            }
        );
        if (disposable) {
            lastPopup.dispose = disposable;
        }

        this._currentAlert$.next(Array.from(this._currentAlert.entries()));
    }

    removeAlert(key: string) {
        const lastPopup = this._currentAlert.get(key);
        if (lastPopup) {
            this._currentAlert.delete(key);
            lastPopup?.dispose.dispose();
            this._currentAlert$.next(Array.from(this._currentAlert.entries()));
        }
    }

    clearAlert() {
        this._currentAlert.forEach((alert) => {
            alert.dispose.dispose();
        });

        this._currentAlert.clear();
        this._currentAlert$.next(Array.from(this._currentAlert.entries()));
    }
}
