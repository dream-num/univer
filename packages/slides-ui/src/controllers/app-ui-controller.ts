/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
