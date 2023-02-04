import { BaseComponentPlugin } from '..';
import { InfoBar } from '../UI/InfoBar';

type IProps = {
    locale?: string;
    label?: string;
};

export interface BaseInfoBarProps {
    back: IProps;
    update: IProps;
    save: IProps;
    rename: IProps;
    sheetName: string;
}

export class InfoBarController {
    private _infoBar: InfoBar;

    private _plugin: BaseComponentPlugin;

    private _infoList: BaseInfoBarProps;

    constructor(plugin: BaseComponentPlugin) {
        this._plugin = plugin;

        this._infoList = {
            back: {
                locale: 'info.return',
            },
            update: {
                locale: 'info.detailUpdate',
            },
            save: {
                locale: 'info.detailSave',
            },
            rename: {
                locale: 'info.tips',
            },
            sheetName: 'UniverSheet',
        };
        this._initialize();
    }

    private _initialize() {}

    // 获取Toolbar组件
    getComponent = (ref: InfoBar) => {
        this._infoBar = ref;
        this.resetInfoList(this._infoList);
    };

    resetInfoList(list: BaseInfoBarProps) {
        const locale = this._plugin.getLocale();
        for (let k in list) {
            if (list[k].locale) {
                list[k].label = locale.get(list[k].locale);
            }
        }
        this._infoBar.setInfoList(list);
    }

    renameSheet() {}
}
