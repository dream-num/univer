import { BaseComponentRender } from '@univerjs/base-ui';
import { IToolbarItemProps, SheetContainerUIController } from '@univerjs/ui-plugin-sheets';
import { Inject } from '@wendellhu/redi';
import { ISelectionManager, SelectionManager } from '@univerjs/base-sheets';
import { ICurrentUniverService, ObserverManager } from '@univerjs/core';
import { FileSelected } from '../Library/FileSelected';
import { OVER_GRID_IMAGE_PLUGIN_NAME } from '../Const/PLUGIN_NAME';
import { IOverGridImageProperty, OverGridImageBorderType } from '../Interfaces';

export class OverGridImageController {
    protected _render: BaseComponentRender;

    protected _toolButton: IToolbarItemProps;

    constructor(
        @Inject(SheetContainerUIController) private readonly _sheetContainerUIController: SheetContainerUIController,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(ObserverManager) private _observerManager: ObserverManager,
        @ISelectionManager private readonly _selectionManager: SelectionManager
    ) {
        this._toolButton = {
            name: OVER_GRID_IMAGE_PLUGIN_NAME,
            label: '图片',
            toolbarType: 1,
            show: true,
            tooltip: '导入图片',
            onClick: () => {
                const rowIndex = _selectionManager.getActiveRange()?.getRowIndex();
                const columnIndex = _selectionManager.getActiveRange()?.getColumn();
                const sheetId = _currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
                FileSelected.chooseImage().then((file) => {
                    const reader = new FileReader();
                    const img = new Image();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        img.src = reader.result as string;
                    };
                    img.onload = () => {
                        _observerManager.getObserver<IOverGridImageProperty>('onAddImage')?.notifyObservers({
                            id: '1',
                            borderType: OverGridImageBorderType.SOLID,
                            radius: 0,
                            row: rowIndex || 1,
                            column: columnIndex || 1,
                            sheetId,
                            url: img.src,
                            width: img.width,
                            height: img.height,
                            borderColor: '#000000',
                            borderWidth: 1,
                        });
                    };
                });
            },
        };
        this._sheetContainerUIController.getToolbarController().addToolbarConfig(this._toolButton);
    }
}
