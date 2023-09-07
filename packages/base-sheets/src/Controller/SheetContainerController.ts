import { Disposable, ICommandInfo, ICommandService, ICurrentUniverService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { SetWorksheetActivateMutation } from '../Commands/Mutations/set-worksheet-activate.mutation';
import { SetWorksheetColWidthMutation } from '../Commands/Mutations/set-worksheet-col-width.mutation';
import { SetWorksheetRowHeightMutation } from '../Commands/Mutations/set-worksheet-row-height.mutation';
import { ISelectionManager } from '../Services/tokens';
import { CanvasView } from '../View';
import { SelectionManager } from './Selection';

const updateCommandList = [SetWorksheetRowHeightMutation.id, SetWorksheetColWidthMutation.id, SetWorksheetActivateMutation.id];

export class SheetContainerController extends Disposable {
    constructor(
        @ISelectionManager private readonly _selectionManager: SelectionManager,
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
                // refresh selection and worksheet canvas view
                if (updateCommandList.includes(command.id)) {
                    const worksheet = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
                    this._selectionManager.updateToSheet(worksheet);
                    this.canvasView.updateToSheet(worksheet);
                    this._selectionManager.renderCurrentControls(false);
                }

                this.canvasView.getSheetView().getSpreadsheet().makeDirty(true);
            })
        );
    }
}
