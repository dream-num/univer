import { BaseSelectChildrenProps, BaseSelectProps, BaseTextButtonProps, resetDataLabel } from '@univerjs/base-ui';
import { Tools, UIObserver } from '@univerjs/core';
import { SheetUIPlugin } from '..';
import { DefaultToolbarConfig, SheetToolBarConfig, ToolBarConfig } from '../Basics';
import { ToolBar } from '../View';

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

export class ToolBarUIController {
    private _plugin: SheetUIPlugin;

    private _toolbar: ToolBar;

    private _toolList: IToolBarItemProps[];

    private _config: SheetToolBarConfig;

    constructor(plugin: SheetUIPlugin, config?: SheetToolBarConfig) {
        this._plugin = plugin;

        this._config = Tools.deepMerge({}, DefaultToolbarConfig, config);

        this._toolList = [
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.undo',
                name: 'undo',
                customLabel: {
                    name: 'ForwardIcon',
                },
                show: this._config.undo,
                onClick: () => {
                    console.log('undo click');
                    const msg = {
                        name: 'undo',
                    };
                    // sheets-plugin-ui Univer => GlobalContext
                    // 插件不必要用
                    this._plugin.getContext().getObserverManager().requiredObserver<UIObserver>('onUIChangeObservable', 'core').notifyObservers(msg);
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
    addToolbarConfig(config: IToolBarItemProps) {
        const index = this._toolList.findIndex((item) => item.name === config.name);
        if (index > -1) {
            this._toolList.push(config);
        }
    }

    // 删除toolbar配置
    deleteToolbarConfig(name: string) {
        const index = this._toolList.findIndex((item) => item.name === name);
        if (index > -1) {
            this._toolList.splice(index, 1);
        }
    }

    // 刷新toolbar
    setToolbar() {
        const locale = this._plugin.getContext().getLocale();
        const toolList = resetDataLabel(this._toolList, locale);
        this._toolbar.setToolBar(toolList);
    }
}
