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

import type { Nullable } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { IHoverCellPosition } from '@univerjs/sheets-ui';
import { Disposable, Inject, RANGE_TYPE, Rectangle } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { SheetsNoteModel } from '@univerjs/sheets-note';
import { HoverManagerService, IEditorBridgeService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { debounceTime } from 'rxjs/operators';
import { SheetsNotePopupService } from '../services/sheets-note-popup.service';

export class SheetsNotePopupController extends Disposable {
    private _isSwitchingSheet = false;

    constructor(
        @Inject(SheetsNotePopupService) private readonly _sheetsNotePopupService: SheetsNotePopupService,
        @Inject(SheetsNoteModel) private readonly _sheetsNoteModel: SheetsNoteModel,
        @Inject(SheetsSelectionsService) private readonly _sheetSelectionService: SheetsSelectionsService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService
    ) {
        super();

        this._initSelectionUpdateListener();
        this._initEditorBridge();
        this._initHoverEvent();
    }

    private _handleSelectionChange(selections: ISelectionWithStyle[], unitId: string, subUnitId: string) {
        const range = selections[0]?.range;
        const render = this._renderManagerService.getRenderById(unitId);
        const skeleton = render?.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId)?.skeleton;
        if (!skeleton) {
            return;
        }

        if (!range) {
            return;
        }
        const actualCell = skeleton.getCellWithCoordByIndex(range.startRow, range.startColumn);

        const rangeType = range.rangeType ?? RANGE_TYPE.NORMAL;
        if ((rangeType !== RANGE_TYPE.NORMAL || range.endColumn - range.startColumn > 0 || range.endRow - range.startRow > 0) && !((actualCell.isMerged || actualCell.isMergedMainCell) && Rectangle.equals(actualCell.mergeInfo, range))) {
            this._sheetsNotePopupService.hidePopup();
            return;
        }

        const row = actualCell.actualRow;
        const col = actualCell.actualColumn;
        const note = this._sheetsNoteModel.getNote(unitId, subUnitId, row, col);
        if (note?.show) return;

        if (note) {
            this._sheetsNotePopupService.showPopup({
                unitId,
                subUnitId,
                row,
                col,
            });
        } else {
            this._sheetsNotePopupService.hidePopup(true);
        }
    }

    private _initSelectionUpdateListener() {
        this.disposeWithMe(
            this._sheetSelectionService.selectionMoveEnd$.subscribe((selections) => {
                if (this._isSwitchingSheet) {
                    return;
                }
                const current = this._sheetSelectionService.currentSelectionParam;
                if (!current) {
                    return;
                }
                this._handleSelectionChange(selections, current.unitId, current.sheetId);
            })
        );
    }

    private _initEditorBridge() {
        this.disposeWithMe(
            this._editorBridgeService.visible$.subscribe((visible) => {
                if (visible.visible) {
                    this._sheetsNotePopupService.hidePopup(true);
                }
            })
        );
    }

    private _initHoverEvent() {
        this.disposeWithMe(
            this._hoverManagerService.currentCell$.pipe(debounceTime(100)).subscribe((cell: Nullable<IHoverCellPosition>) => {
                if (!cell?.location) return;

                const { unitId, subUnitId, row, col } = cell.location;

                const note = this._sheetsNoteModel.getNote(unitId, subUnitId, row, col);
                if (note?.show) return;
                if (note) {
                    this._sheetsNotePopupService.showPopup({
                        unitId,
                        subUnitId,
                        row,
                        col,
                        temp: true,
                    });
                } else {
                    this._sheetsNotePopupService.hidePopup();
                }
            })
        );
    }
}
