import type { LocaleType } from '@univerjs/core';
import { LocaleService } from '@univerjs/core';
import { ComponentManager } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import type { IUniverSlidesUIConfig } from '../basics';
import { SlideContainerUIController } from './slide-container-ui-controller';

export class AppUIController {
    private _slideContainerUIController: SlideContainerUIController;

    constructor(
        config: IUniverSlidesUIConfig,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        this._slideContainerUIController = this._injector.createInstance(SlideContainerUIController, config);
        this._injector.add([SlideContainerUIController, { useValue: this._slideContainerUIController }]);
        const UIConfig = this._slideContainerUIController.getUIConfig();

        // TODO: put sidebar UI to the base-ui workbench container
    }

    /**
     * Change language
     * @param {String} lang new language
     *
     * e: {target: HTMLSelectElement } reference from  https://stackoverflow.com/a/48443771
     *
     */
    changeLocale = (locale: string) => {
        this._localeService.setLocale(locale as LocaleType);
    };

    getSlideContainerController() {
        return this._slideContainerUIController;
    }
}
