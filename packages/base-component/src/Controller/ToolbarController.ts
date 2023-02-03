import { ToolBarObserver } from '@univerjs/core';
import { BaseSelectChildrenProps, BaseSelectProps } from '@univerjs/style-univer/src/Components/Select';
import { BaseTextButtonProps } from '@univerjs/style-univer/src/Components/TextButton/TextButton';
import { BaseComponentPlugin } from '../BaseComponentPlugin';
import { SheetToolBarConfig, ToolBarConfig } from '../Basics/Interfaces/ComponentConfig/ToolBarConfig';
import { ToolBar } from '../UI/ToolBar';
import { resetDataLabel } from '../Utils';

// 继承基础下拉属性,添加国际化
export interface BaseToolBarSelectChildrenProps extends BaseSelectChildrenProps {
    locale?: string;
    suffixLocale?: string;
    children?: BaseToolBarSelectChildrenProps[];
}

export interface BaseToolBarSelectProps extends BaseSelectProps {
    locale?: string;
    suffixLocale?: string;
    children?: BaseToolBarSelectChildrenProps[];
}

enum ToolbarType {
    SELECT,
    BUTTON,
}

export interface IToolBarItemProps extends BaseToolBarSelectProps, BaseTextButtonProps {
    show?: boolean; //是否显示按钮
    toolbarType?: ToolbarType;
    locale?: string; //label国际化
    tooltipLocale?: string; //tooltip国际化 TODO: need right label
    tooltip?: string; //tooltip文字
    border?: boolean;
}

export class ToolBarController {
    private _plugin: BaseComponentPlugin;

    private _toolbar: ToolBar;

    private _currentConfig: ToolBarConfig = {};

    private _configList: Map<string, ToolBarConfig> = new Map();

    private _toolList: IToolBarItemProps[];

    constructor(plugin: BaseComponentPlugin) {
        this._plugin = plugin;

        this._toolList = [
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.undo',
                name: 'undo',
                customLabel: {
                    name: 'ForwardIcon',
                },
                show: this._currentConfig.undo,
                onClick: () => {
                    console.log('undo click');
                    const msg = {
                        name: 'undo',
                    };
                    this._plugin.getContext().getObserverManager().requiredObserver<ToolBarObserver>('onToolBarChangeObservable', 'core').notifyObservers(msg);
                },
            },
        ];
    }

    // 获取Toolbar组件
    getComponent = (ref: ToolBar) => {
        this._toolbar = ref;
        this.setToolbar();
    };

    // 增加toolbar配置
    addToolbarConfig(id: string, config: SheetToolBarConfig) {
        this._configList.set(id, config);
        this.setCurrentToolbarConfig(id);
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
        this.modifyToolList(config);
    }

    // 根据配置修改toolList
    modifyToolList(config: ToolBarConfig) {
        for (let i = 0; i < this._toolList.length; i++) {
            this._toolList[i].show = false;
            for (let k in config) {
                if (this._toolList[i].name === k) {
                    this._toolList[i].show = true;
                }
            }
        }
        this.setToolbar();
    }

    // 刷新toolbar
    setToolbar() {
        const locale = this._plugin.getLocale();
        const toolList = resetDataLabel(this._toolList, locale);
        this._toolbar.setToolBar(toolList);
    }
}
