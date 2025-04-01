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
import { Disposable, IContextService, Inject } from '@univerjs/core';
import { SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { ComponentManager, IDialogService } from '@univerjs/ui';
import { distinctUntilChanged, startWith } from 'rxjs';
import { SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, UNIVER_SHEET_TABLE_FILTER_PANEL_ID } from '../const';
import { SheetTableFilterPanel } from '../views/components/SheetTableFilterPanel';

interface ITableFilterPanelInfo {
    unitId: string;
    subUnitId: string;
    tableId: string;
    column: number;
    row: number;
}
export class SheetsTableComponentController extends Disposable {
    private _popupDisposable?: Nullable<IDisposable>;
    private _currentTableFilterInfo: Nullable<ITableFilterPanelInfo> = null;
    constructor(

        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IContextService private readonly _contextService: IContextService,
        @Inject(SheetCanvasPopManagerService) private _sheetCanvasPopupService: SheetCanvasPopManagerService,
        @Inject(IDialogService) private readonly _dialogService: IDialogService

    ) {
        super();
        this._initComponents();
        this._initUIPopup();
    }

    public setCurrentTableFilterInfo(info: ITableFilterPanelInfo): void {
        this._currentTableFilterInfo = info;
    }

    public clearCurrentTableFilterInfo(): void {
        this._currentTableFilterInfo = null;
    }

    public getCurrentTableFilterInfo(): Nullable<ITableFilterPanelInfo> {
        return this._currentTableFilterInfo;
    }

    private _initComponents() {
        ([
            [SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, SheetTableFilterPanel],
        ] as const).forEach(([key, component]) => {
            this.disposeWithMe(this._componentManager.register(key, component));
        });
    }

    private _initUIPopup() {
        this.disposeWithMe(this._contextService.subscribeContextValue$(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY)

            .pipe(startWith(undefined), distinctUntilChanged())
            .subscribe((open) => {
                if (open) {
                    this._openFilterPopup();
                } else if (open === false) {
                    this._closeFilterPopup();
                }
            }));
    }

    public closeFilterPanel(): void {
        this._contextService.setContextValue(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, false);
    }

    private _openFilterPopup(): void {
        const currentFilterModel = this._currentTableFilterInfo;
        if (!currentFilterModel) {
            throw new Error('[SheetsFilterUIController]: no filter model when opening filter popup!');
        }

        const { row: startRow, column: col } = currentFilterModel;
        this._popupDisposable = this._sheetCanvasPopupService.attachPopupToCell(startRow, col, {
            componentKey: SHEETS_TABLE_FILTER_PANEL_OPENED_KEY,
            direction: 'horizontal',
            onClickOutside: () => {
                this._dialogService.close(UNIVER_SHEET_TABLE_FILTER_PANEL_ID);
                this._contextService.setContextValue(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, false);
            },
            offset: [5, 0],
        });
    }

    private _closeFilterPopup(): void {
        this._popupDisposable?.dispose();
        this._popupDisposable = null;
        this.clearCurrentTableFilterInfo();
    }
}
