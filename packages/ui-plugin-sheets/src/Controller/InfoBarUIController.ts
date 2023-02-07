import { Plugin } from '@univerjs/core';
import { InfoBarModel } from '../Model/InfoBarModel';
import { InfoBar } from '../View';

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

export class InfoBarUIController {
    private _infoList: BaseInfoBarProps;

    private _plugin: Plugin;

    private _infoBar: InfoBar;

    private _infoBarModel: InfoBarModel;

    constructor(plugin: Plugin) {
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

    setSheetName(e: FocusEvent) {
        const target = e.target as HTMLInputElement;
        const name = target.value;
        this._infoBarModel.setName(name);
    }

    resetInfoList(list: BaseInfoBarProps) {
        const locale = this._plugin.getContext().getLocale();
        for (let k in list) {
            if (list[k].locale) {
                list[k].label = locale.get(list[k].locale);
            }
        }
        this._infoBar.setInfoList(list);
    }

    renameSheet() {}
}
