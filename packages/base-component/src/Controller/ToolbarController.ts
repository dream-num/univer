import { BaseComponentPlugin } from '../BaseComponentPlugin';
import { DefaultToolbarConfig } from '../Basics/Const/ToolBar/DefaultToolbarConfig';
import { IToolBarItemProps, SheetToolBarConfig, ToolBarConfig } from '../Basics/Interfaces/ToolbarConfig/BaseToolBarConfig';

export class ToolBarController {
    private _plugin: BaseComponentPlugin;

    private _currentConfig: ToolBarConfig;

    private _configList: Map<string, ToolBarConfig>;

    private _toolList: IToolBarItemProps[];

    constructor(plugin: BaseComponentPlugin) {
        this._plugin = plugin;

        this._currentConfig = DefaultToolbarConfig;

        this._toolList = [
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.undo',
                name: 'undo',
                customLabel: {
                    name: 'ForwardIcon',
                },
                show: this._currentConfig.undoRedo,
                onClick: () => {},
            },
        ];
    }

    // 增加toolbar配置
    addToolbarConfig(id: string, config?: SheetToolBarConfig) {
        if (!config) {
            config = DefaultToolbarConfig;
        }
        this._configList.set(id, config);
    }

    // 删除toolbar配置
    deleteToolbarConfig(id: string) {
        this._configList.delete(id);
    }

    // 设置当前toolbar配置
    setCurrentToolbarConfig(id: string) {
        const config = this._configList.get(id);
        if (!config) return;
        this._currentConfig = config;
    }
}
