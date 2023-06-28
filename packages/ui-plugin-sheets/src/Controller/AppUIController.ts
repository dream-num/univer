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
            context: this._plugin.getGlobalContext(),
            locale: this._plugin.getGlobalContext().getLocale().getCurrentLocale(),
            componentManager: this._plugin.getComponentManager(),
            zIndexManager: this._plugin.getZIndexManager(),
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

    getSheetContainerController() {
        return this._sheetContainerController;
    }
}
