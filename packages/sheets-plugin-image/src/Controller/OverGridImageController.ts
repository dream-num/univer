import { BaseComponentRender } from '@univerjs/base-ui';
import { IToolbarItemProps, SheetContainerUIController } from '@univerjs/ui-plugin-sheets';
import { Inject, Injector } from '@wendellhu/redi';
import { ISelectionManager, SelectionManager } from '@univerjs/base-sheets';
import { Command, CommandManager, ICurrentUniverService, ObserverManager, Tools } from '@univerjs/core';
import { FileSelected, IOverGridImageProperty, OVER_GRID_IMAGE_PLUGIN_NAME, OverGridImageBorderType } from '../Basics';
import { AddImagePropertyAction, IAddImagePropertyData } from '../Model';
import { IImagePluginData } from '../Symbol';

export class OverGridImageController {
    protected _render: BaseComponentRender;

    protected _toolButton: IToolbarItemProps;

    constructor(
        @Inject(Injector) readonly _injector: Injector,
        @Inject(IImagePluginData) _imagePluginData: Map<string, IOverGridImageProperty>,
        @Inject(SheetContainerUIController) private readonly _sheetContainerUIController: SheetContainerUIController,
        @Inject(CommandManager) private _commandManager: CommandManager,
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
                const workbook = _currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
                FileSelected.chooseImage().then((file) => {
                    const reader = new FileReader();
                    const img = new Image();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        img.src = reader.result as string;
                    };
                    img.onload = () => {
                        const action: IAddImagePropertyData = {
                            actionName: AddImagePropertyAction.NAME,
                            id: Tools.generateRandomId(),
                            borderType: OverGridImageBorderType.SOLID,
                            row: rowIndex || 1,
                            column: columnIndex || 1,
                            url: img.src,
                            radius: 0,
                            width: img.width,
                            height: img.height,
                            borderColor: '#000000',
                            borderWidth: 1,
                            sheetId: workbook.getActiveSheet().getSheetId(),
                            injector: _injector,
                        };
                        const command = new Command({ WorkBookUnit: workbook }, action);
                        this._commandManager.invoke(command);
                    };
                });
            },
        };
        this._sheetContainerUIController.getToolbarController().addToolbarConfig(this._toolButton);
    }
}
