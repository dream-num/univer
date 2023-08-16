import { BaseComponentRender } from '@univerjs/base-ui';
import { IToolbarItemProps, SheetContainerUIController } from '@univerjs/ui-plugin-sheets';
import { Inject } from '@wendellhu/redi';
import { FileSelected } from '../Library/FileSelected';
import { OVER_GRID_IMAGE_PLUGIN_NAME } from '../Const/PLUGIN_NAME';

export class OverGridImageController {
    protected _render: BaseComponentRender;

    protected _toolButton: IToolbarItemProps;

    constructor(@Inject(SheetContainerUIController) private readonly _sheetContainerUIController: SheetContainerUIController) {
        debugger;
        this._toolButton = {
            name: OVER_GRID_IMAGE_PLUGIN_NAME,
            label: '图片',
            toolbarType: 1,
            show: true,
            tooltip: '导入图片',
            onClick: () => {
                FileSelected.chooseImage().then((img) => {});
            },
        };
        this._sheetContainerUIController.getToolbarController().addToolbarConfig(this._toolButton);
    }
}
