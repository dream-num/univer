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

import type { Nullable, Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { IEditorBridgeServiceVisibleParam } from '../../../services/editor-bridge.service';
import type { ISheetObjectParam } from '../../utils/component-tools';
import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { isCellImage } from '@univerjs/sheets';
import { SetCellEditVisibleOperation } from '../../../commands/operations/cell-edit.operation';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import { HoverManagerService } from '../../../services/hover-manager.service';
import { getSheetObject } from '../../utils/component-tools';

export class MobileCellEditRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(HoverManagerService) hoverManagerService: HoverManagerService
    ) {
        super();

        this.disposeWithMe(hoverManagerService.currentDbClickedCell$.subscribe((cell) => {
            if (cell.location.unitId !== this._context.unitId) {
                return;
            }

            const snapshot = this._editorBridgeService.getEditCellState()?.documentLayoutObject.documentModel?.getSnapshot();
            if (isCellImage(snapshot)) {
                return;
            }

            this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
                visible: true,
                eventType: DeviceInputEventType.Dblclick,
                unitId: this._context.unitId,
            } as IEditorBridgeServiceVisibleParam);
        }));

        this.disposeWithMe(hoverManagerService.currentPointerDownCell$.subscribe((cell) => {
            if (cell.unitId !== this._context.unitId || this._isCurrentEditCell(cell)) {
                return;
            }

            this._hideEditor();
        }));

        this._initPointerDownListener();
    }

    private _initPointerDownListener(): void {
        const sheetObject = this._getSheetObject();
        if (!sheetObject) {
            return;
        }

        const { spreadsheetColumnHeader, spreadsheetLeftTopPlaceholder, spreadsheetRowHeader } = sheetObject;
        const hideEditor = () => this._hideEditor();

        this.disposeWithMe(spreadsheetColumnHeader.onPointerDown$.subscribeEvent({ next: hideEditor, priority: -1 }));
        this.disposeWithMe(spreadsheetLeftTopPlaceholder.onPointerDown$.subscribeEvent({ next: hideEditor, priority: -1 }));
        this.disposeWithMe(spreadsheetRowHeader.onPointerDown$.subscribeEvent({ next: hideEditor, priority: -1 }));
    }

    private _isCurrentEditCell(cell: { unitId: string; subUnitId: string; row: number; col: number }): boolean {
        const editLocation = this._editorBridgeService.getEditLocation();
        return editLocation?.unitId === cell.unitId &&
            editLocation.sheetId === cell.subUnitId &&
            editLocation.row === cell.row &&
            editLocation.column === cell.col;
    }

    private _hideEditor(): void {
        if (this._editorBridgeService.isForceKeepVisible() || !this._editorBridgeService.isVisible().visible) {
            return;
        }

        this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
            visible: false,
            eventType: DeviceInputEventType.PointerDown,
            unitId: this._context.unitId,
        });
    }

    private _getSheetObject(): Nullable<ISheetObjectParam> {
        if (!this._context.unit) {
            return null;
        }

        return getSheetObject(this._context.unit, this._context);
    }
}
