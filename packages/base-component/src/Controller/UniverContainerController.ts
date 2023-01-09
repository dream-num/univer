import { SheetPlugin } from '@univer/base-sheets';
import { LocaleType, Workbook } from '@univer/core';
import { BaseComponentPlugin } from '../BaseComponentPlugin';
import { UniverConfig } from '../Basics';
import { UI } from '../UI';

export class UniverContainerController {
    private _plugin: BaseComponentPlugin;

    private _sheetPlugin: SheetPlugin;

    private _config: UniverConfig;

    constructor(plugin: BaseComponentPlugin) {
        this._plugin = plugin;

        this._config = this._plugin.getConfig();
        // 初始化UI
        const config = {
            config: this._config,
            changeSkin: this.changeSkin,
            changeLocale: this.changeLocale,
        };
        UI.create(config);
    }

    /**
     * Change skin
     * @param {String} lang new skin
     */
    changeSkin = () => {
        // publish
        this._plugin.getContext().getObserverManager().getObserver<Workbook>('onAfterChangeUISkinObservable')?.notifyObservers(this._plugin.getContext().getWorkBook());
    };

    /**
     * Change language
     * @param {String} lang new language
     *
     * e: {target: HTMLSelectElement } reference from  https://stackoverflow.com/a/48443771
     *
     */
    changeLocale = (locale: string) => {
        this._plugin
            .getContext()
            .getLocale()
            .change(locale as LocaleType);

        // publish
        this._plugin.getContext().getContextObserver('onAfterChangeUILocaleObservable')?.notifyObservers();
    };
}
