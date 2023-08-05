import { LocaleType, ObserverManager, LocaleService } from '@univerjs/core';
import { Inject, Injector, SkipSelf } from '@wendellhu/redi';
import { ComponentManager, ZIndexManager } from '@univerjs/base-ui';
import { UI } from '../View';
import { SheetContainerUIController } from './SheetContainerUIController';
import { ISheetUIPluginConfig } from '../Basics';

export class AppUIController {
    private _sheetContainerController: SheetContainerUIController;

    constructor(
        config: ISheetUIPluginConfig,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(ZIndexManager) private readonly _zIndexManager: ZIndexManager
    ) {
        this._sheetContainerController = this._injector.createInstance(SheetContainerUIController, config);
        this._injector.add([SheetContainerUIController, { useValue: this._sheetContainerController }]);

        const UIConfig = this._sheetContainerController.getUIConfig();

        UI.create({
            injector: this._injector,
            locale: this._localeService.getLocale().getCurrentLocale(),
            componentManager: this._componentManager,
            zIndexManager: this._zIndexManager,
            changeLocale: this.changeLocale,
            UIConfig,
            container: config.container,
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
        this._localeService.getLocale().change(locale as LocaleType);

        // publish
        this._globalObserverManager.requiredObserver('onAfterChangeUILocaleObservable', 'core')!.notifyObservers();
    };

    getSheetContainerController() {
        return this._sheetContainerController;
    }
}