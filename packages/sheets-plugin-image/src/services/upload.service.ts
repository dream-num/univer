import { SelectionManagerService } from '@univerjs/base-sheets';
import { ICurrentUniverService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { FileSelected } from '../Basics';

export class UploadService {
    constructor(
        @Inject(Injector) readonly _injector: Injector,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
    ) {}

    upload() {
        const { _selectionManagerService, _currentUniverService, _injector } = this;
        const selection = _selectionManagerService.getLast()?.selection;
        const worksheet = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
        if (selection == null) {
            return;
        }
        const activeRange = worksheet.getRange(selection);
        const rowIndex = activeRange.getRowIndex();
        const columnIndex = activeRange.getColumn();
        const workbook = _currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        FileSelected.chooseImage().then((file) => {
            const reader = new FileReader();
            const img = new Image();
            reader.readAsDataURL(file);
            reader.onload = () => {
                img.src = reader.result as string;
            };
            img.onload = () => {
                // FIXME use command system
                // const action: IAddOverGridImageActionData = {
                //     actionName: AddOverGridImageAction.NAME,
                //     id: Tools.generateRandomId(),
                //     borderType: OverGridImageBorderType.SOLID,
                //     row: rowIndex || 1,
                //     column: columnIndex || 1,
                //     url: img.src,
                //     radius: 0,
                //     width: img.width,
                //     height: img.height,
                //     borderColor: '#000000',
                //     borderWidth: 1,
                //     sheetId: workbook.getActiveSheet().getSheetId(),
                //     injector: _injector,
                // };
                // const command = new Command({ WorkBookUnit: workbook }, action);
                // this._commandManager.invoke(command);
            };
        });
    }
}
