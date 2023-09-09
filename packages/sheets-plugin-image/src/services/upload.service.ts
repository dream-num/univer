import { ISelectionManager, SelectionManager } from '@univerjs/base-sheets';
import { ICurrentUniverService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { FileSelected } from '../Basics';

export class UploadService {
    constructor(
        @Inject(Injector) readonly _injector: Injector,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @ISelectionManager private readonly _selectionManager: SelectionManager
    ) {}

    upload() {
        const { _selectionManager, _currentUniverService, _injector } = this;
        const rowIndex = _selectionManager.getActiveRange()?.getRowIndex();
        const columnIndex = _selectionManager.getActiveRange()?.getColumn();
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
