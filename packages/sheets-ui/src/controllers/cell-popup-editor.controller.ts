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

import type { Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, Inject } from '@univerjs/core';
import { filter } from 'rxjs';
import { CellPopupManagerService } from '../services/cell-popup-manager.service';
import { IEditorBridgeService } from '../services/editor-bridge.service';

/**
 * Controller to hide cell popups when entering edit mode.
 * This ensures that popups don't overlap with the cell editor.
 */
export class CellPopupEditorController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(CellPopupManagerService) private readonly _cellPopupManagerService: CellPopupManagerService
    ) {
        super();
        this._initEditorVisibleListener();
    }

    private _initEditorVisibleListener(): void {
        this.disposeWithMe(
            this._editorBridgeService.visible$.pipe(
                filter((params) => params.visible)
            ).subscribe(() => {
                const editCellState = this._editorBridgeService.getEditLocation();
                if (editCellState) {
                    this._cellPopupManagerService.hidePopup(
                        editCellState.unitId,
                        editCellState.sheetId,
                        editCellState.row,
                        editCellState.column
                    );
                }
            })
        );
    }
}
