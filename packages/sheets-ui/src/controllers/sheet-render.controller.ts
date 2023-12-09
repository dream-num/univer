import type { ICommandInfo } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import type { Rect, Spreadsheet, SpreadsheetColumnHeader, SpreadsheetRowHeader } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    COMMAND_LISTENER_SKELETON_CHANGE,
    COMMAND_LISTENER_VALUE_CHANGE,
    SelectionManagerService,
    SetWorksheetActiveOperation,
} from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

import { SHEET_VIEW_KEY } from '../common/keys';
import { ISelectionRenderService } from '../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

interface ISetWorksheetMutationParams {
    workbookId: string;
    worksheetId: string;
}

@OnLifecycle(LifecycleStages.Rendered, SheetRenderController)
export class SheetRenderController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @ISelectionRenderService
        private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {
        super.dispose();
    }

    private _initialize() {
        this._initialRenderRefresh();
    }

    private _initialRenderRefresh() {
        this.disposeWithMe(
            toDisposable(
                this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
                    if (param == null) {
                        return;
                    }

                    const { skeleton: spreadsheetSkeleton, unitId, sheetId } = param;

                    const workbook = this._currentUniverService.getUniverSheetInstance(unitId);

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

                    const { rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;

                    spreadsheet?.updateSkeleton(spreadsheetSkeleton);
                    spreadsheetRowHeader?.updateSkeleton(spreadsheetSkeleton);
                    spreadsheetColumnHeader?.updateSkeleton(spreadsheetSkeleton);
                    spreadsheetLeftTopPlaceholder?.transformByState({
                        width: rowHeaderWidth,
                        height: columnHeaderHeight,
                    });
                })
            )
        );
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
                const unitId = workbook.getUnitId();
                if (COMMAND_LISTENER_SKELETON_CHANGE.includes(command.id)) {
                    const worksheet = workbook.getActiveSheet();
                    const sheetId = worksheet.getSheetId();
                    const params = command.params;
                    const { workbookId, worksheetId } = params as ISetWorksheetMutationParams;
                    if (!(workbookId === workbook.getUnitId() && worksheetId === worksheet.getSheetId())) {
                        return;
                    }

                    if (command.id !== SetWorksheetActiveOperation.id) {
                        this._sheetSkeletonManagerService.makeDirty(
                            {
                                unitId,
                                sheetId,
                                commandId: command.id,
                            },
                            true
                        );
                    }

                    this._sheetSkeletonManagerService.setCurrent({
                        unitId,
                        sheetId,
                        commandId: command.id,
                    });
                } else if (COMMAND_LISTENER_VALUE_CHANGE.includes(command.id)) {
                    this._sheetSkeletonManagerService.reCalculate();
                }

                // this._sheetSkeletonManagerService.reCalculate();

                this._renderManagerService.getRenderById(unitId)?.mainComponent?.makeDirty(); // refresh spreadsheet
            })
        );
    }
}
