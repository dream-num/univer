import { Disposable, ICommandInfo, ICommandService, ICurrentUniverService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { SetWorksheetActivateMutation } from '../commands/mutations/set-worksheet-activate.mutation';
import { SetWorksheetColWidthMutation } from '../commands/mutations/set-worksheet-col-width.mutation';
import { SetWorksheetRowHeightMutation } from '../commands/mutations/set-worksheet-row-height.mutation';
import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../services/selection-manager.service';
import { CanvasView } from '../View';

const updateCommandList = [
    SetWorksheetRowHeightMutation.id,
    SetWorksheetColWidthMutation.id,
    SetWorksheetActivateMutation.id,
];

export class SheetContainerController extends Disposable {
    constructor(
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(CanvasView) private readonly canvasView: CanvasView,
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

                    this._selectionManagerService.setCurrentSelection({
                        pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                        unitId,
                        sheetId,
                    });

                    this.canvasView.updateToSheet(worksheet);
                }

                this.canvasView.getSheetView().getSpreadsheet().makeDirty(true);
            })
        );
    }
}
