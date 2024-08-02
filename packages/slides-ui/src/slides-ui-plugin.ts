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

import type { Dependency, DependencyOverride, SlideDataModel } from '@univerjs/core';
import { Inject, Injector, IUniverInstanceService, mergeOverrideWithDependencies, Plugin, UniverInstanceType } from '@univerjs/core';

import { SlidesUIController } from './controllers/slide-ui.controller';

export const SLIDE_UI_PLUGIN_NAME = 'SLIDE_UI';

export class UniverSlidesUIPlugin extends Plugin {
    static override pluginName = SLIDE_UI_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SLIDE;

    constructor(
        private readonly _config: { override?: DependencyOverride },
        @Inject(Injector) override readonly _injector: Injector,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
    }

    override onStarting(injector: Injector): void {
        mergeOverrideWithDependencies([[SlidesUIController]] as Dependency[], this._config.override)
            .forEach((d) => injector.add(d));
    }

    override onRendered(): void {
        this._markSlideAsFocused();
    }

    private _markSlideAsFocused() {
        const currentService = this._univerInstanceService;
        try {
            const slide = currentService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE)!;
            currentService.focusUnit(slide.getUnitId());
        } catch (e) {
        }
    }
}
