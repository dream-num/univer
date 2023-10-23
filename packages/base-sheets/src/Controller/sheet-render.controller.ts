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
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { COMMAND_LISTENER_SKELETON_CHANGE } from '../Basics/Const/COMMAND_LISTENER_CONST';
import { SHEET_VIEW_KEY } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { SetWorksheetActivateMutation } from '../commands/mutations/set-worksheet-activate.mutation';
import { SelectionManagerService } from '../services/selection-manager.service';
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
        });
    }

    private _commandExecutedListener() {
        const updateCommandList = COMMAND_LISTENER_SKELETON_CHANGE;

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
                    const unitId = workbook.getUnitId();
                    const worksheet = workbook.getActiveSheet();
                    const sheetId = worksheet.getSheetId();

                    const params = command.params;
                    const { workbookId, worksheetId } = params as ISetWorksheetMutationParams;
                    if (!(workbookId === workbook.getUnitId() && worksheetId === worksheet.getSheetId())) {
                        return;
                    }

                    if (command.id !== SetWorksheetActivateMutation.id) {
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
                }

                this._renderManagerService.getCurrent()?.mainComponent?.makeDirty(); // refresh spreadsheet
            })
        );
    }
}
