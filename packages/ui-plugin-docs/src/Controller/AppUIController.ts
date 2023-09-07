import { ComponentManager } from '@univerjs/base-ui';
import { LocaleService, LocaleType, ObserverManager } from '@univerjs/core';
import { Inject, Injector, SkipSelf } from '@wendellhu/redi';

import { IDocUIPluginConfig } from '../Basics';
import { UI } from '../View';
import { DocContainerUIController } from './DocContainerUIController';

export class AppUIController {
    private _docContainerController: DocContainerUIController;

    constructor(
        _config: IDocUIPluginConfig,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        this._docContainerController = this._injector.createInstance(DocContainerUIController, _config);

        const UIConfig = this._docContainerController.getUIConfig();

        UI.create({
            injector: this._injector,
            locale: this._localeService.getLocale().getCurrentLocale(),
            localeService: this._localeService,
            componentManager: this._componentManager,
            changeLocale: this.changeLocale,
            UIConfig,
            container: _config.container,
        });
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
