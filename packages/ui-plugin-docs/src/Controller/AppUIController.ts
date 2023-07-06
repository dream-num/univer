import { LocaleType } from '@univerjs/core';
import { DocUIPlugin } from '../DocUIPlugin';
import { UI } from '../View';
import { DocContainerUIController } from './DocContainerUIController';

export class AppUIController {
    protected _plugin: DocUIPlugin;

    private _docContainerController: DocContainerUIController;

    constructor(plugin: DocUIPlugin) {
        this._plugin = plugin;

        this._docContainerController = new DocContainerUIController(this._plugin);

        const UIConfig = this._docContainerController.getUIConfig();

        UI.create({
            context: this._plugin.getGlobalContext(),
            locale: this._plugin.getGlobalContext().getLocale().getCurrentLocale(),
            componentManager: this._plugin.getComponentManager(),
            changeLocale: this.changeLocale,
            UIConfig,
            container: this._plugin.getConfig().container,
        });
    }

    /**
     * Change language
     * @param {String} lang new language
     *
     * e: {target: HTMLSelectElement } reference from  https://stackoverflow.com/a/48443771
     *
     */
    changeLocale = (locale: string) => {
        this._plugin
            .getGlobalContext()
            .getLocale()
            .change(locale as LocaleType);

        // publish
        this._plugin.getGlobalContext().getObserverManager().requiredObserver('onAfterChangeUILocaleObservable', 'core')!.notifyObservers();
    };

    getDocContainerController() {
        return this._docContainerController;
    }
}
