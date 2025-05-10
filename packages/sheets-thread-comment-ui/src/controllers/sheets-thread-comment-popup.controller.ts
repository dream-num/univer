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
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { IDeleteCommentMutationParams } from '@univerjs/thread-comment';
import { Disposable, ICommandService, Inject, IUniverInstanceService, RANGE_TYPE, Rectangle, UniverInstanceType } from '@univerjs/core';
import { singleReferenceToGrid } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { RangeProtectionPermissionViewPoint, SetWorksheetActiveOperation, SheetPermissionCheckController, SheetsSelectionsService, WorkbookCommentPermission, WorksheetViewPermission } from '@univerjs/sheets';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { IEditorBridgeService, IMarkSelectionService, ScrollToRangeOperation, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { DeleteCommentMutation } from '@univerjs/thread-comment';
import { SetActiveCommentOperation, ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { debounceTime } from 'rxjs';
import { SheetsThreadCommentPopupService } from '../services/sheets-thread-comment-popup.service';

interface ISelectionShapeInfo {
    shapeId: string;
    unitId: string;
    subUnitId: string;
    commentId: string;
}

export class SheetsThreadCommentPopupController extends Disposable {
    private _isSwitchToCommenting = false;
    private _selectionShapeInfo: Nullable<ISelectionShapeInfo> = null;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetsThreadCommentPopupService) private readonly _sheetsThreadCommentPopupService: SheetsThreadCommentPopupService,
        @Inject(SheetsThreadCommentModel) private readonly _sheetsThreadCommentModel: SheetsThreadCommentModel,
        @Inject(ThreadCommentPanelService) private readonly _threadCommentPanelService: ThreadCommentPanelService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetPermissionCheckController) private readonly _sheetPermissionCheckController: SheetPermissionCheckController,
        @IMarkSelectionService private readonly _markSelectionService: IMarkSelectionService,
        @Inject(SheetsSelectionsService) private readonly _sheetSelectionService: SheetsSelectionsService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._initCommandListener();
        this._initPanelListener();
        this._initMarkSelection();
        this._initSelectionUpdateListener();
        this._initEditorBridge();
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
            if (this._threadCommentPanelService.activeCommentId) {
                this._commandService.executeCommand(SetActiveCommentOperation.id);
            }
            return;
        }

        const row = actualCell.actualRow;
        const col = actualCell.actualColumn;
        if (!this._sheetsThreadCommentModel.showCommentMarker(unitId, subUnitId, row, col)) {
            if (this._threadCommentPanelService.activeCommentId) {
                this._commandService.executeCommand(SetActiveCommentOperation.id);
            }
            return;
        }

        const commentId = this._sheetsThreadCommentModel.getByLocation(unitId, subUnitId, row, col);
        if (commentId) {
            this._commandService.executeCommand(SetActiveCommentOperation.id, {
                unitId,
                subUnitId,
                commentId,
            });
        }
    }

    private _initSelectionUpdateListener() {
        this.disposeWithMe(
            this._sheetSelectionService.selectionMoveEnd$.subscribe((selections) => {
                if (this._isSwitchToCommenting) {
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
                    this._sheetsThreadCommentPopupService.hidePopup();
                }
            })
        );
    }

    private _initCommandListener() {
        this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === DeleteCommentMutation.id) {
                const params = commandInfo.params as IDeleteCommentMutationParams;
                const active = this._sheetsThreadCommentPopupService.activePopup;
                if (!active) {
                    return;
                }
                const { unitId, subUnitId, commentId } = active;
                if (params.unitId === unitId && params.subUnitId === subUnitId && params.commentId === commentId) {
                    this._sheetsThreadCommentPopupService.hidePopup();
                }
            }
        });
    }

    private _initPanelListener() {
        this.disposeWithMe(this._threadCommentPanelService.activeCommentId$.subscribe(async (commentInfo) => {
            if (commentInfo) {
                const { unitId, subUnitId, commentId, trigger } = commentInfo;
                const comment = this._sheetsThreadCommentModel.getComment(unitId, subUnitId, commentId);
                if (!comment || comment.resolved) {
                    return;
                }

                const currentUnit = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                if (!currentUnit) {
                    return;
                }
                const currentUnitId = currentUnit.getUnitId();
                if (currentUnitId !== unitId) {
                    return;
                }
                this._isSwitchToCommenting = true;
                const currentSheetId = currentUnit.getActiveSheet()?.getSheetId();
                if (currentSheetId !== subUnitId) {
                    await this._commandService.executeCommand(SetWorksheetActiveOperation.id, {
                        unitId,
                        subUnitId,
                    });
                }
                this._isSwitchToCommenting = false;

                const location = singleReferenceToGrid(comment.ref);

                const { row, column: col } = location;
                const commentPermission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                    workbookTypes: [WorkbookCommentPermission],
                    worksheetTypes: [WorksheetViewPermission],
                    rangeTypes: [RangeProtectionPermissionViewPoint],
                }, [{ startRow: row, startColumn: col, endRow: row, endColumn: col }]);

                if (!commentPermission) {
                    return;
                }

                const GAP = 1;
                await this._commandService.executeCommand(ScrollToRangeOperation.id, {
                    range: {
                        startRow: Math.max(location.row - GAP, 0),
                        endRow: location.row + GAP,
                        startColumn: Math.max(location.column - GAP, 0),
                        endColumn: location.column + GAP,
                    },
                });
                if (this._editorBridgeService.isVisible().visible) {
                    return;
                }

                this._sheetsThreadCommentPopupService.showPopup({
                    unitId,
                    subUnitId,
                    row: location.row,
                    col: location.column,
                    commentId: comment.id,
                    trigger,
                });
            } else {
                this._sheetsThreadCommentPopupService.hidePopup();
            }
        }));
    }

    private _initMarkSelection() {
        this.disposeWithMe(this._threadCommentPanelService.activeCommentId$.pipe(debounceTime(100)).subscribe((activeComment) => {
            if (!activeComment) {
                if (this._selectionShapeInfo) {
                    this._markSelectionService.removeShape(this._selectionShapeInfo.shapeId);
                    this._selectionShapeInfo = null;
                }
                return;
            }

            const { unitId, subUnitId, commentId } = activeComment;
            if (this._selectionShapeInfo) {
                this._markSelectionService.removeShape(this._selectionShapeInfo.shapeId);
                this._selectionShapeInfo = null;
            }

            const comment = this._sheetsThreadCommentModel.getComment(unitId, subUnitId, commentId);
            if (!comment) {
                return;
            }

            const location = singleReferenceToGrid(comment.ref);

            const { row, column } = location;
            if (Number.isNaN(row) || Number.isNaN(column)) {
                return null;
            }

            const worksheet = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getSheetBySheetId(subUnitId);

            const mergeInfo = worksheet?.getMergedCell(row, column) ?? {
                startColumn: column,
                endColumn: column,
                startRow: row,
                endRow: row,
            };

            // TODO: use evented: false to solve this problem later
            const shapeId = this._markSelectionService.addShape(
                {
                    range: mergeInfo,
                    style: {
                        // hasAutoFill: false,
                        fill: 'rgba(255, 189, 55, 0.35)',
                        strokeWidth: 1,
                        stroke: '#FFBD37',
                        widgets: {},
                    },
                    primary: null,
                },
                [],
                -1
            );
            if (!shapeId) {
                return;
            }

            this._selectionShapeInfo = {
                ...activeComment,
                shapeId,
            };
        }));
    }
}
