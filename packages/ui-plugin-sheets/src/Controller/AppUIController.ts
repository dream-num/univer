import { LocaleType } from '@univerjs/core';
import { SheetUIPlugin } from '../SheetUIPlugin';
import { UI } from '../View';
import { SheetContainerUIController } from './SheetContainerUIController';

export class AppUIController {
    protected _plugin: SheetUIPlugin;

    private _sheetContainerController: SheetContainerUIController;

    constructor(plugin: SheetUIPlugin) {
        this._plugin = plugin;

        this._sheetContainerController = new SheetContainerUIController(this._plugin);

        const UIConfig = this._sheetContainerController.getUIConfig();

        UI.create({
            context: this._plugin.getContext(),
            locale: this._plugin.getContext().getLocale().getCurrentLocale(),
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
            .getContext()
            .getLocale()
            .change(locale as LocaleType);

        // publish
        this._plugin.getContext().getObserverManager().requiredObserver('onAfterChangeUILocaleObservable', 'core')!.notifyObservers();
    };

    getSheetContainerController() {
        return this._sheetContainerController;
    }
}
