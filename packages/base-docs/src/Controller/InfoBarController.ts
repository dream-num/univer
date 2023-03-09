import { DocPlugin } from '../DocPlugin';

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
    private _plugin: DocPlugin;

    constructor(plugin: DocPlugin) {
        this._plugin = plugin;
    }
}
