import { Disposable, ICommandInfo, ICommandService, ICurrentUniverService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { SetWorksheetActivateMutation } from '../Commands/Mutations/set-worksheet-activate.mutation';
import { SetWorksheetColWidthMutation } from '../Commands/Mutations/set-worksheet-col-width.mutation';
import { SetWorksheetRowHeightMutation } from '../Commands/Mutations/set-worksheet-row-height.mutation';
import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../Services/selection-manager.service';
import { SheetSkeletonManagerService } from '../Services/sheetSkeleton-manager.service';

const updateCommandList = [
    SetWorksheetRowHeightMutation.id,
    SetWorksheetColWidthMutation.id,
    SetWorksheetActivateMutation.id,
];

export class SheetContainerController extends Disposable {
    constructor(
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
                    const unitId = workbook.getUnitId();
                    const worksheet = workbook.getActiveSheet();
                    const sheetId = worksheet.getSheetId();

                    this._sheetSkeletonManagerService.setCurrent({
                        unitId,
                        sheetId,
                    });

                    this._selectionManagerService.setCurrentSelection({
                        pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                        unitId,
                        sheetId,
                    });

                    // this.canvasView.updateToSheet(worksheet);
                }

                // this.canvasView.getSheetView().getSpreadsheet().makeDirty(true);
            })
        );
    }
}
