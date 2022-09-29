import { PLUGIN_NAMES } from '@univer/core';
import { InfoBarModel } from '../Model/Domain/InfoBarModel';
import { SpreadsheetPlugin } from '../SpreadsheetPlugin';
import { InfoBar } from '../View/UI/InfoBar';

type IProps = {
    locale?: string;
    label?: string;
    onBlur?: (e: FocusEvent) => void;
};

export interface BaseInfoBarProps {
    back: IProps;
    update: IProps;
    save: IProps;
    rename: IProps;
    sheet: IProps;
}

export class InfoBarController {
    private _infoBarModel: InfoBarModel;

    private _infoBar: InfoBar;

    private _plugin: SpreadsheetPlugin;

    private _infoList: BaseInfoBarProps;

    constructor(plugin: SpreadsheetPlugin) {
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
            sheet: {
                label: 'UniverSheet Demo',
                onBlur: this.setSheetName,
            },
        };
        this.init();
    }

    init() {
        const context = this._plugin.context;
        const manager = context.getObserverManager();

        manager.requiredObserver<InfoBar>('onInfoBarDidMountObservable', PLUGIN_NAMES.SPREADSHEET).add((component) => {
            this._infoBar = component;
            this.resetInfoList(this._infoList);
        });

        context.getContextObserver('onAfterChangeUILocaleObservable').add(() => {
            this.resetInfoList(this._infoList);
        });
    }

    resetInfoList(list: BaseInfoBarProps) {
        const locale = this._plugin.context.getLocale();
        for (let k in list) {
            if (list[k].locale) {
                list[k].label = locale.get(list[k].locale);
            }
        }
        this._infoBar.setInfoList(list);
    }

    setSheetName(e: FocusEvent) {
        const target = e.target as HTMLInputElement;
        const name = target.value;
        this._infoBarModel.setSheetName(name);
    }
}
