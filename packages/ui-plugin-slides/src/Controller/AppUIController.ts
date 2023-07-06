import { LocaleType } from '@univerjs/core';
import { SlideUIPlugin } from '../SlideUIPlugin';
import { UI } from '../View';
import { SlideContainerUIController } from './SlideContainerUIController';

export class AppUIController {
    protected _plugin: SlideUIPlugin;

    private _slideContainerController: SlideContainerUIController;

    constructor(plugin: SlideUIPlugin) {
        this._plugin = plugin;

        this._slideContainerController = new SlideContainerUIController(this._plugin);

        const UIConfig = this._slideContainerController.getUIConfig();

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

    getSlideContainerController() {
        return this._slideContainerController;
    }
}
