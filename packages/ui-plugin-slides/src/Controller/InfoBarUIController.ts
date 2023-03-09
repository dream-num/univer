import { InfoBarModel } from '../Model/InfoBarModel';
import { SlideUIPlugin } from '../SlideUIPlugin';
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
    slide: IProps;
    update: IProps;
}

export class InfoBarUIController {
    private _infoBarModel: InfoBarModel;

    private _infoBar: InfoBar;

    private _plugin: SlideUIPlugin;

    private _infoList: BaseInfoBarProps;

    constructor(plugin: SlideUIPlugin) {
        this._plugin = plugin;
    }

    getComponent = (ref: InfoBar) => {
        this._infoBar = ref;
        this._refreshComponent();
        this.resetInfoList(this._infoList);
    };

    resetInfoList(list: BaseInfoBarProps) {
        const locale = this._plugin.getGlobalContext().getLocale();
        for (let k in list) {
            if (list[k].locale) {
                list[k].label = locale.get(list[k].locale);
            }
        }
        this._infoBar.setInfoList(list);
    }

    setSlideName(e: FocusEvent) {
        const target = e.target as HTMLInputElement;
        const name = target.value;
        this._infoBarModel.setName(name);
    }

    private _refreshComponent(): void {
        const name = 'UniverSlide';
        // const name = this._plugin.getUniver().getCurrentUniverSlideInstance().getWorkBook().getConfig().name;
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
            slide: {
                label: name,
                onBlur: (e) => {
                    this.setSlideName(e);
                },
            },
        };
    }
}
