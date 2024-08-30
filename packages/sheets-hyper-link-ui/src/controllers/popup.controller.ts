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

import { Disposable, ICommandService, Inject, IPermissionService, LifecycleStages, OnLifecycle, Rectangle } from '@univerjs/core';
import { HoverManagerService, SheetPermissionInterceptorBaseController, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { debounceTime } from 'rxjs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ClearSelectionAllCommand, ClearSelectionContentCommand, ClearSelectionFormatCommand, RangeProtectionPermissionEditPoint, RangeProtectionPermissionViewPoint, WorkbookCopyPermission, WorkbookEditablePermission, WorkbookViewPermission, WorksheetCopyPermission, WorksheetEditPermission, WorksheetInsertHyperlinkPermission, WorksheetViewPermission } from '@univerjs/sheets';
import { SheetsHyperLinkPopupService } from '../services/popup.service';

@OnLifecycle(LifecycleStages.Rendered, SheetsHyperLinkPopupController)
export class SheetsHyperLinkPopupController extends Disposable {
    constructor(
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(SheetsHyperLinkPopupService) private readonly _sheetsHyperLinkPopupService: SheetsHyperLinkPopupService,
        @Inject(IRenderManagerService) private readonly _renderManagerService: IRenderManagerService,
        @Inject(IPermissionService) private readonly _permissionService: IPermissionService,
        @Inject(SheetPermissionInterceptorBaseController) private readonly _sheetPermissionInterceptorBaseController: SheetPermissionInterceptorBaseController,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initHoverListener();
        this._initCommandListener();
    }

    private _initHoverListener() {
        this.disposeWithMe(
            this._hoverManagerService.currentCellWithDoc$.pipe(debounceTime(200)).subscribe((currentCell) => {
                if (!currentCell) {
                    this._sheetsHyperLinkPopupService.hideCurrentPopup();
                    return;
                }

                const skeleton = this._renderManagerService.getRenderById(currentCell.location.unitId)
                    ?.with(SheetSkeletonManagerService)
                    .getWorksheetSkeleton(currentCell.location.subUnitId)
                    ?.skeleton;

                const currentCol = currentCell.location.col;
                const currentRow = currentCell.location.row;
                let targetRow = currentRow;
                let targetCol = currentCol;

                if (skeleton) {
                    skeleton.overflowCache.forValue((row, col, value) => {
                        if (Rectangle.contains(value, { startColumn: currentCol, endColumn: currentCol, startRow: currentRow, endRow: currentRow })) {
                            targetRow = row;
                            targetCol = col;
                        }
                    });
                }

                const viewPermission = this._sheetPermissionInterceptorBaseController.permissionCheckWithRanges({
                    workbookTypes: [WorkbookViewPermission],
                    worksheetTypes: [WorksheetViewPermission],
                    rangeTypes: [RangeProtectionPermissionViewPoint],
                }, [{ startRow: currentRow, startColumn: currentCol, endRow: currentRow, endColumn: currentCol }]);
                if (!viewPermission) {
                    this._sheetsHyperLinkPopupService.hideCurrentPopup();
                    return;
                }

                const editPermission = this._sheetPermissionInterceptorBaseController.permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    worksheetTypes: [WorksheetEditPermission, WorksheetInsertHyperlinkPermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                }, [{ startRow: currentRow, startColumn: currentCol, endRow: currentRow, endColumn: currentCol }]);

                const unitId = currentCell.location.unitId;
                const subUnitId = currentCell.location.subUnitId;

                const copyPermission = this._permissionService.composePermission([new WorkbookCopyPermission(unitId).id, new WorksheetCopyPermission(unitId, subUnitId).id]).every((permission) => permission.value);

                this._sheetsHyperLinkPopupService.showPopup({
                    ...currentCell.location,
                    row: targetRow,
                    col: targetCol,
                    editPermission,
                    copyPermission,
                    richTextLink: currentCell.customRange,
                });
            })
        );
    }

    private _initCommandListener() {
        const HIDE_COMMAND_LIST = [ClearSelectionContentCommand.id, ClearSelectionAllCommand.id, ClearSelectionFormatCommand.id];
        this.disposeWithMe(this._commandService.onCommandExecuted((command) => {
            if (HIDE_COMMAND_LIST.includes(command.id)) {
                this._sheetsHyperLinkPopupService.hideCurrentPopup();
            }
        }));
    }
}
