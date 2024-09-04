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

import type { Nullable } from '@univerjs/core';
import { CustomRangeType, Disposable, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_ZEN_EDITOR_UNIT_ID_KEY, ICommandService, Inject, IPermissionService, IUniverInstanceService, LifecycleStages, OnLifecycle, Rectangle } from '@univerjs/core';
import { HoverManagerService, HoverRenderController, IEditorBridgeService, SheetPermissionInterceptorBaseController, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import type { Subscription } from 'rxjs';
import { debounceTime, map, mergeMap, Observable } from 'rxjs';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { ISheetLocationBase } from '@univerjs/sheets';
import {
    ClearSelectionAllCommand,
    ClearSelectionContentCommand,
    ClearSelectionFormatCommand,
    RangeProtectionPermissionEditPoint,
    RangeProtectionPermissionViewPoint,
    WorkbookCopyPermission,
    WorkbookEditablePermission,
    WorkbookViewPermission,
    WorksheetCopyPermission,
    WorksheetEditPermission,
    WorksheetInsertHyperlinkPermission,
    WorksheetViewPermission,
} from '@univerjs/sheets';
import { DocCanvasPopManagerService, DocEventManagerService } from '@univerjs/docs-ui';
import { TextSelectionManagerService } from '@univerjs/docs';
import { SheetsHyperLinkPopupService } from '../services/popup.service';
import { HyperLinkEditSourceType } from '../types/enums/edit-source';

@OnLifecycle(LifecycleStages.Rendered, SheetsHyperLinkPopupController)
export class SheetsHyperLinkPopupController extends Disposable {
    constructor(
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(SheetsHyperLinkPopupService) private readonly _sheetsHyperLinkPopupService: SheetsHyperLinkPopupService,
        @Inject(IRenderManagerService) private readonly _renderManagerService: IRenderManagerService,
        @Inject(IPermissionService) private readonly _permissionService: IPermissionService,
        @Inject(SheetPermissionInterceptorBaseController) private readonly _sheetPermissionInterceptorBaseController: SheetPermissionInterceptorBaseController,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DocCanvasPopManagerService) private readonly _docCanvasPopManagerService: DocCanvasPopManagerService
    ) {
        super();

        this._initHoverListener();
        this._initCommandListener();
        this._initHoverEditingListener();
        this._initTextSelectionListener();
        this._initZenEditor();
    }

    private _getLinkPermission(location: ISheetLocationBase) {
        const { unitId, subUnitId, row: currentRow, col: currentCol } = location;
        const viewPermission = this._sheetPermissionInterceptorBaseController.permissionCheckWithRanges({
            workbookTypes: [WorkbookViewPermission],
            worksheetTypes: [WorksheetViewPermission],
            rangeTypes: [RangeProtectionPermissionViewPoint],
        }, [{ startRow: currentRow, startColumn: currentCol, endRow: currentRow, endColumn: currentCol }]);

        const editPermission = this._sheetPermissionInterceptorBaseController.permissionCheckWithRanges({
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission, WorksheetInsertHyperlinkPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }, [{ startRow: currentRow, startColumn: currentCol, endRow: currentRow, endColumn: currentCol }]);

        const copyPermission = this._permissionService.composePermission([new WorkbookCopyPermission(unitId).id, new WorksheetCopyPermission(unitId, subUnitId).id]).every((permission) => permission.value);

        return {
            viewPermission,
            editPermission,
            copyPermission,
        };
    }

    private _initHoverListener() {
        this.disposeWithMe(
            // hover over not editing cell
            this._hoverManagerService.currentCellWithDoc$.pipe(debounceTime(200)).subscribe((currentCell) => {
                if (!currentCell) {
                    this._sheetsHyperLinkPopupService.hideCurrentPopup();
                    return;
                }

                const renderer = this._renderManagerService.getRenderById(currentCell.location.unitId);
                if (!renderer) {
                    return;
                }
                const hoverRenderController = renderer.with(HoverRenderController);
                if (!hoverRenderController.active) {
                    this._sheetsHyperLinkPopupService.hideCurrentPopup(HyperLinkEditSourceType.VIEWING);
                    return;
                }

                const skeleton = renderer?.with(SheetSkeletonManagerService)
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

                const { viewPermission, editPermission, copyPermission } = this._getLinkPermission(currentCell.location);

                if (!viewPermission || !currentCell.customRange) {
                    this._sheetsHyperLinkPopupService.hideCurrentPopup();
                    return;
                }

                this._sheetsHyperLinkPopupService.showPopup({
                    ...currentCell.location,
                    row: targetRow,
                    col: targetCol,
                    editPermission,
                    copyPermission,
                    customRange: currentCell.customRange,
                    customRangeRect: currentCell.rect,
                    type: HyperLinkEditSourceType.VIEWING,
                });
            })
        );
    }

    private _initHoverEditingListener() {
        let subscribe: Nullable<Subscription> = null;
        this.disposeWithMe(
            this._editorBridgeService.currentEditCellState$
                .pipe(mergeMap((state) => this._editorBridgeService.visible$.pipe(map((visible) => ({ visible, state })))))
                .subscribe(({ visible, state }) => {
                    if (!state) {
                        return;
                    }
                    if (state.editorUnitId !== DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
                        return;
                    }

                    if (!visible.visible) {
                        subscribe?.unsubscribe();
                        this._sheetsHyperLinkPopupService.hideCurrentPopup(HyperLinkEditSourceType.EDITING);
                        this._sheetsHyperLinkPopupService.endEditing(HyperLinkEditSourceType.EDITING);
                        return;
                    }

                    const { editorUnitId, unitId, sheetId, row, column } = state;
                    const renderer = this._renderManagerService.getRenderById(editorUnitId);
                    if (!renderer) {
                        return;
                    }
                    const { editPermission, viewPermission, copyPermission } = this._getLinkPermission({ unitId, subUnitId: sheetId, row, col: column });
                    const docEventService = renderer.with(DocEventManagerService);
                    if (!viewPermission) {
                        return;
                    }
                    subscribe?.unsubscribe();
                    subscribe = docEventService.hoverCustomRanges$.pipe(debounceTime(200)).subscribe((customRanges) => {
                        const customRange = customRanges.find((customRange) => customRange.range.rangeType === CustomRangeType.HYPERLINK);
                        if (!customRange) {
                            this._sheetsHyperLinkPopupService.hideCurrentPopup();
                            return;
                        }
                        const rect = customRange.rects[customRange.rects.length - 1];
                        const skeleton = this._renderManagerService.getRenderById(unitId)
                            ?.with(SheetSkeletonManagerService)
                            .getWorksheetSkeleton(sheetId)
                            ?.skeleton;
                        if (!skeleton || !rect) {
                            return;
                        }
                        const canvasClientRect = renderer.engine.getCanvasElement().getBoundingClientRect();

                        this._sheetsHyperLinkPopupService.showPopup({
                            unitId,
                            subUnitId: sheetId,
                            row,
                            col: column,
                            customRange: customRange.range,
                            customRangeRect: {
                                left: rect.left + canvasClientRect.left,
                                top: rect.top + canvasClientRect.top,
                                bottom: rect.bottom + canvasClientRect.top,
                                right: rect.right + canvasClientRect.left,
                            },
                            editPermission,
                            copyPermission,
                            type: HyperLinkEditSourceType.EDITING,
                        });
                    });
                })
        );

        this.disposeWithMe(() => {
            subscribe?.unsubscribe();
        });
    }

    private _initZenEditor() {
        this.disposeWithMe(
            this._univerInstanceService.focused$.pipe(
                mergeMap((id) => {
                    const render = id === DOCS_ZEN_EDITOR_UNIT_ID_KEY ? this._renderManagerService.getRenderById(id) : null;
                    if (render) {
                        return render.with(DocEventManagerService).hoverCustomRanges$.pipe(debounceTime(200));
                    }

                    return new Observable<null>((sub) => {
                        sub.next(null);
                    });
                })
            ).subscribe((value) => {
                const range = value?.find((range) => range.range.rangeType === CustomRangeType.HYPERLINK);
                const state = this._editorBridgeService.getEditCellState();
                if (range && state) {
                    const { unitId, sheetId, row, column } = state;
                    const { editPermission, viewPermission, copyPermission } = this._getLinkPermission({ unitId, subUnitId: sheetId, row, col: column });
                    if (viewPermission) {
                        this._sheetsHyperLinkPopupService.showPopup({
                            type: HyperLinkEditSourceType.ZEN_EDITOR,
                            unitId,
                            subUnitId: sheetId,
                            row,
                            col: column,
                            customRange: range.range,
                            editPermission,
                            copyPermission,
                        });
                    }
                } else {
                    this._sheetsHyperLinkPopupService.hideCurrentPopup(HyperLinkEditSourceType.ZEN_EDITOR);
                }
            })
        );
    }

    private _initTextSelectionListener() {
        this.disposeWithMe(
            this._textSelectionManagerService.textSelection$.subscribe((selection) => {
                if (!selection || selection.unitId !== DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
                    return;
                }

                this._sheetsHyperLinkPopupService.endEditing(HyperLinkEditSourceType.EDITING);
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
