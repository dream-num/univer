import { BaseComponentRender } from '@univerjs/base-ui';
import { IToolbarItemProps, SHEET_UI_PLUGIN_NAME, SheetUIPlugin } from '@univerjs/ui-plugin-sheets';
import { OverGridImagePlugin } from '../OverGridImagePlugin';
import { OVER_GRID_IMAGE_PLUGIN_NAME } from '../Const/PLUGIN_NAME';
import { FileSelected } from '../Library/FileSelected';

export class OverGridImageController {
    protected _sheetUIPlugin: SheetUIPlugin;

    protected _plugin: OverGridImagePlugin;

    protected _render: BaseComponentRender;

    protected _toolButton: IToolbarItemProps;

    constructor(plugin: OverGridImagePlugin) {
        this._plugin = plugin;
        this._sheetUIPlugin = plugin.getGlobalContext().getPluginManager().getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME);

        this._toolButton = {
            name: OVER_GRID_IMAGE_PLUGIN_NAME,
            toolbarType: 1,
            tooltip: '导入图片',
            show: true,
            label: '图片',
            onClick: () => {
                FileSelected.chooseImage().then((img) => {});
            },
        };
        this._sheetUIPlugin.addToolButton(this._toolButton);
    }
}
