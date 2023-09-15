import { ComponentManager } from '@univerjs/base-ui';
import { LocaleService, LocaleType, ObserverManager } from '@univerjs/core';
import { Inject, Injector, SkipSelf } from '@wendellhu/redi';

import { ISlideUIPluginConfig } from '../Basics';
import { UI } from '../View';
import { SlideContainerUIController } from './SlideContainerUIController';

export class AppUIController {
    private _slideContainerUIController: SlideContainerUIController;

    constructor(
        config: ISlideUIPluginConfig,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        this._slideContainerUIController = this._injector.createInstance(SlideContainerUIController, config);
        this._injector.add([SlideContainerUIController, { useValue: this._slideContainerUIController }]);
        const UIConfig = this._slideContainerUIController.getUIConfig();

        UI.create({
            injector: this._injector,
            locale: this._localeService.getLocale().getCurrentLocale(),
            componentManager: this._componentManager,
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

    getSlideContainerController() {
        return this._slideContainerUIController;
    }
}
