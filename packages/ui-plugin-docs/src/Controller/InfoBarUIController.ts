import { DocUIPlugin } from '../DocUIPlugin';
import { InfoBarModel } from '../Model';
import { InfoBar } from '../View/InfoBar';

type IProps = {
    locale?: string;
    label?: string;
    onBlur?: (e: FocusEvent) => void;
};

export interface BaseInfoBarProps {
    back: IProps;
    rename: IProps;
    save: IProps;
    sheet: IProps;
    update: IProps;
}

export class InfoBarUIController {
    private _infoBarModel: InfoBarModel;

    private _infoBar: InfoBar;

    private _plugin: DocUIPlugin;

    private _infoList: BaseInfoBarProps;

    constructor(plugin: DocUIPlugin) {
        this._plugin = plugin;
    }

    getComponent = (ref: InfoBar) => {
        this._infoBar = ref;
        this._refreshComponent();
        this.resetInfoList(this._infoList);
    };

    resetInfoList(list: BaseInfoBarProps) {
        const locale = this._plugin.getContext().getLocale();
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
        this._infoBarModel.setName(name);
    }

    private _refreshComponent(): void {
        const name = 'UniverDoc';
        // const name = this._plugin.getContext().getUniver().getCurrentUniverDocInstance().getWorkBook().getConfig().name;
        this._infoBarModel = new InfoBarModel(name);
        this._infoList = {
            back: {
                locale: 'info.return',
            },
            rename: {
                locale: 'info.tips',
            },
            update: {
                locale: 'info.detailUpdate',
            },
            save: {
                locale: 'info.detailSave',
            },
            sheet: {
                label: name,
                onBlur: (e) => {
                    this.setSheetName(e);
                },
            },
        };
    }
}
