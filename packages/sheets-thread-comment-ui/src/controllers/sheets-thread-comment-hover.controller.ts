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

import { Disposable, Inject } from '@univerjs/core';
import { RangeProtectionPermissionViewPoint, SheetPermissionCheckController, WorkbookCommentPermission, WorksheetViewPermission } from '@univerjs/sheets';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { HoverManagerService } from '@univerjs/sheets-ui';
import { debounceTime } from 'rxjs';
import { SheetsThreadCommentPopupService } from '../services/sheets-thread-comment-popup.service';

export class SheetsThreadCommentHoverController extends Disposable {
    constructor(
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(SheetsThreadCommentPopupService) private readonly _sheetsThreadCommentPopupService: SheetsThreadCommentPopupService,
        @Inject(SheetsThreadCommentModel) private readonly _sheetsThreadCommentModel: SheetsThreadCommentModel,
        @Inject(SheetPermissionCheckController) private readonly _sheetPermissionCheckController: SheetPermissionCheckController
    ) {
        super();
        this._initHoverEvent();
    }

    private _initHoverEvent() {
        this.disposeWithMe(
            this._hoverManagerService.currentCell$.pipe(debounceTime(100)).subscribe((cell) => {
                const currentPopup = this._sheetsThreadCommentPopupService.activePopup;
                if (cell && ((currentPopup && currentPopup.temp) || !currentPopup)) {
                    const { location } = cell;
                    const { unitId, subUnitId, row, col } = location;

                    const commentId = this._sheetsThreadCommentModel.getByLocation(unitId, subUnitId, row, col);

                    if (commentId) {
                        const commentPermission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                            workbookTypes: [WorkbookCommentPermission],
                            worksheetTypes: [WorksheetViewPermission],
                            rangeTypes: [RangeProtectionPermissionViewPoint],
                        }, [{ startRow: row, startColumn: col, endRow: row, endColumn: col }]);
                        if (!commentPermission) {
                            return;
                        }
                        const comment = this._sheetsThreadCommentModel.getComment(unitId, subUnitId, commentId);
                        if (comment && !comment.resolved) {
                            this._sheetsThreadCommentPopupService.showPopup({
                                unitId,
                                subUnitId,
                                row,
                                col,
                                commentId,
                                temp: true,
                            });
                        }
                    } else {
                        if (currentPopup) {
                            this._sheetsThreadCommentPopupService.hidePopup();
                        }
                    }
                }
            })
        );
    }
}
