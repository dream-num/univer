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

import { IUniverInstanceService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { SlideUIController } from './controllers/slide-ui.controller';
import { zhCN } from './locale';

export const SLIDE_UI_PLUGIN_NAME = 'slides-ui';

export class UniverSlidesUIPlugin extends Plugin {
    static override type = PluginType.Slide;

    constructor(
        _config: unknown,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService
    ) {
        super(SLIDE_UI_PLUGIN_NAME);
    }

    override onStarting(injector: Injector): void {
        this._localeService.load({
            zhCN,
        });

        ([[SlideUIController]] as Dependency[]).forEach((d) => injector.add(d));
    }

    override onRendered(): void {
        this._markSlideAsFocused();
    }

    private _markSlideAsFocused() {
        const currentService = this._currentUniverService;
        try {
            const c = currentService.getCurrentUniverSlideInstance();
            currentService.focusUniverInstance(c.getUnitId());
        } catch (e) {
        }
    }
}
