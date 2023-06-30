// import { InfoBar } from '@univerjs/ui-plugin-slides/src/View/InfoBar/InfoBar';
import { InfoBarModel } from '../Model/InfoBarModel';
import { SlidePlugin } from '../SlidePlugin';

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

    // private _infoBar: InfoBar;

    private _plugin: SlidePlugin;

    private _infoList: BaseInfoBarProps;

    constructor(plugin: SlidePlugin) {
        this._plugin = plugin;

        // TODO get name from config
        const name = 'UniverSlide Demo';
        this._infoBarModel = new InfoBarModel(name);

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
                label: name,
                onBlur: (e) => {
                    this.setSlideName(e);
                },
            },
        };
        this._initialize();
    }

    resetInfoList(list: BaseInfoBarProps) {
        // const locale = this._plugin.context.getLocale();
        // for (let k in list) {
        //     if (list[k].locale) {
        //         list[k].label = locale.get(list[k].locale);
        //     }
        // }
        // this._infoBar.setInfoList(list);
    }

    setSlideName(e: FocusEvent) {
        const target = e.target as HTMLInputElement;
        const name = target.value;
        this._infoBarModel.setName(name);
    }

    private _initialize() {
        const context = this._plugin.context;
        const manager = context.getObserverManager();

        // manager.requiredObserver<InfoBar>('onInfoBarDidMountObservable', PLUGIN_NAMES.SLIDE).add((component) => {
        //     this._infoBar = component;
        //     this.resetInfoList(this._infoList);
        // });
    }
}
