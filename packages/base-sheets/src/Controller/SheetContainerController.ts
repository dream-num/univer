import { Disposable, ICommandInfo, ICommandService, ICurrentUniverService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { SetWorksheetActivateMutation } from '../Commands/Mutations/set-worksheet-activate.mutation';
import { ISelectionManager } from '../Services/tokens';
import { CanvasView } from '../View';
import { SelectionManager } from './Selection';

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
                this.canvasView.getSheetView().getSpreadsheet().makeDirty(true);

                if (command.id === SetWorksheetActivateMutation.id) {
                    this.canvasView.updateToSheet(this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet());
                }
            })
        );
    }
}
