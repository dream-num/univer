import { LocaleService, LocaleType, ObserverManager } from '@univerjs/core';
import { Inject, Injector, SkipSelf } from '@wendellhu/redi';

import { IDocUIPluginConfig } from '../Basics';
import { DocContainerUIController } from './DocContainerUIController';

export class AppUIController {
    private _docContainerController: DocContainerUIController;

    constructor(
        _config: IDocUIPluginConfig,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        this._docContainerController = this._injector.createInstance(DocContainerUIController, _config);
    }

    /**
     * Change language
     * @param {String} locale new language
     *
     * e: {target: HTMLSelectElement } reference from  https://stackoverflow.com/a/48443771
     *
     */
    changeLocale = (locale: string) => {
        this._localeService.getLocale().change(locale as LocaleType);

        // publish
        this._globalObserverManager.requiredObserver('onAfterChangeUILocaleObservable', 'core')!.notifyObservers();
    };

    getDocContainerController() {
        return this._docContainerController;
    }
}
