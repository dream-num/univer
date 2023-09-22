import {
    IRenderManagerService,
    ISelectionTransformerShapeManager,
    Rect,
    Spreadsheet,
    SpreadsheetColumnHeader,
    SpreadsheetRowHeader,
} from '@univerjs/base-render';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    ICurrentUniverService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { CANVAS_VIEW_KEY, SHEET_VIEW_KEY } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { columnWidthByHeader, rowHeightByHeader } from '../Basics/SheetHeader';
import { SetWorksheetActivateMutation } from '../commands/mutations/set-worksheet-activate.mutation';
import { SetWorksheetColWidthMutation } from '../commands/mutations/set-worksheet-col-width.mutation';
import { SetWorksheetRowHeightMutation } from '../commands/mutations/set-worksheet-row-height.mutation';
import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../services/selection-manager.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Rendered, SheetRenderController)
export class SheetRenderController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @ISelectionTransformerShapeManager
        private readonly _selectionTransformerShapeManager: ISelectionTransformerShapeManager,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    private _initialize() {
        this._initialRenderRefresh();
    }

    private _initialRenderRefresh() {
        this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                return;
            }

            const { skeleton: spreadsheetSkeleton, unitId, sheetId } = param;

            const workbook = this._currentUniverService.getUniverSheetInstance(unitId)?.getWorkBook();

            const worksheet = workbook?.getSheetBySheetId(sheetId);

            if (workbook == null || worksheet == null) {
                return;
            }

            const currentRender = this._renderManagerService.getRenderById(unitId);

            if (currentRender == null) {
                return;
            }

            const { mainComponent, components, scene } = currentRender;

            const spreadsheet = mainComponent as Spreadsheet;
            const spreadsheetRowHeader = components.get(SHEET_VIEW_KEY.ROW) as SpreadsheetRowHeader;
            const spreadsheetColumnHeader = components.get(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
            const spreadsheetLeftTopPlaceholder = components.get(SHEET_VIEW_KEY.LEFT_TOP) as Rect;

            this._selectionTransformerShapeManager.changeRuntime(spreadsheetSkeleton, scene);

            const { rowTotalHeight, columnTotalWidth, rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;

            spreadsheet?.updateSkeleton(spreadsheetSkeleton);
            spreadsheetRowHeader?.updateSkeleton(spreadsheetSkeleton);
            spreadsheetColumnHeader?.updateSkeleton(spreadsheetSkeleton);
            spreadsheetLeftTopPlaceholder?.transformByState({
                width: rowHeaderWidth,
                height: columnHeaderHeight,
            });

            scene?.transformByState({
                width: columnWidthByHeader(worksheet) + columnTotalWidth,
                height: rowHeightByHeader(worksheet) + rowTotalHeight,
                // width: this._columnWidthByTitle(worksheet) + columnTotalWidth + 100,
                // height: this._rowHeightByTitle(worksheet) + rowTotalHeight + 200,
            });

            const rowHeaderWidthScale = rowHeaderWidth * scene.scaleX;
            const columnHeaderHeightScale = columnHeaderHeight * scene.scaleY;

            const viewMain = scene.getViewport(CANVAS_VIEW_KEY.VIEW_MAIN);
            const viewTop = scene.getViewport(CANVAS_VIEW_KEY.VIEW_TOP);
            const viewLeft = scene.getViewport(CANVAS_VIEW_KEY.VIEW_LEFT);
            const viewLeftTop = scene.getViewport(CANVAS_VIEW_KEY.VIEW_LEFT_TOP);

            viewMain?.resize({
                left: rowHeaderWidthScale,
                top: columnHeaderHeightScale,
            });

            viewTop?.resize({
                left: rowHeaderWidthScale,
                height: columnHeaderHeightScale,
            });

            viewLeft?.resize({
                top: columnHeaderHeightScale,
                width: rowHeaderWidthScale,
            });

            viewLeftTop?.resize({
                width: rowHeaderWidthScale,
                height: columnHeaderHeightScale,
            });

            // spreadsheet.makeDirty();
        });
    }

    private _commandExecutedListener() {
        const updateCommandList = [
            SetWorksheetRowHeightMutation.id,
            SetWorksheetColWidthMutation.id,
            SetWorksheetActivateMutation.id,
        ];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
                    const unitId = workbook.getUnitId();
                    const worksheet = workbook.getActiveSheet();
                    const sheetId = worksheet.getSheetId();

                    if (command.id !== SetWorksheetActivateMutation.id) {
                        this._sheetSkeletonManagerService.makeDirty(
                            {
                                unitId,
                                sheetId,
                            },
                            true
                        );
                    }

                    this._sheetSkeletonManagerService.setCurrent({
                        unitId,
                        sheetId,
                    });

                    this._selectionManagerService.setCurrentSelection({
                        pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                        unitId,
                        sheetId,
                    });
                }

                this._renderManagerService.getCurrent()?.mainComponent?.makeDirty(); // refresh spreadsheet
            })
        );
    }
}
