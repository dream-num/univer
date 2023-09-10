import { LocaleService, LocaleType, ObserverManager } from '@univerjs/core';
import { Inject, Injector, SkipSelf } from '@wendellhu/redi';

import { ISheetUIPluginConfig } from '../Basics';
import { SheetContainerUIController } from './SheetContainerUIController';

export class AppUIController {
    private _sheetContainerController: SheetContainerUIController;

    constructor(
        config: ISheetUIPluginConfig,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager
    ) {
        this._sheetContainerController = this._injector.createInstance(SheetContainerUIController, config);
        this._injector.add([SheetContainerUIController, { useValue: this._sheetContainerController }]);
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
