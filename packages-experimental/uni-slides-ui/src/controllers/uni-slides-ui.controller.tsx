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

import React from 'react';
import type { SlideDataModel } from '@univerjs/core';
import { connectInjector, ICommandService, Inject, Injector, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType, useDependency } from '@univerjs/core';
import type { IUniverSlidesDrawingConfig } from '@univerjs/slides-ui';
import { SlidesUIController } from '@univerjs/slides-ui';
import { ComponentManager, IMenuService, IShortcutService, IUIPartsService, useObservable } from '@univerjs/ui';
import { UniUIPart } from '@univerjs/uniui';
import { UniSlideSideBar } from '../views/UniSlideSideBar';

@OnLifecycle(LifecycleStages.Ready, UniSlidesUIController)
export class UniSlidesUIController extends SlidesUIController {
    constructor(
        _config: Partial<IUniverSlidesDrawingConfig>,
        @Inject(Injector) _injector: Injector,
        @IMenuService _menuService: IMenuService,
        @Inject(ComponentManager) _componentManager: ComponentManager,
        @IUIPartsService _uiPartsService: IUIPartsService,
        @ICommandService _commandService: ICommandService,
        @IShortcutService _shortcutService: IShortcutService
    ) {
        super(_config, _injector, _menuService, _componentManager, _uiPartsService, _commandService, _shortcutService);
    }

    protected override _initUIComponents(): void {
        this.disposeWithMe(this._uiPartsService.registerComponent(UniUIPart.OUTLINE, () => connectInjector(RenderOutline, this._injector)));
    }
}

function RenderOutline() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const focused = useObservable(univerInstanceService.focused$);
    const slide = useObservable(() => univerInstanceService.getCurrentTypeOfUnit$<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE), null, false, []);
    if (!slide || focused !== slide.getUnitId()) return null;

    return (
        <UniSlideSideBar />
    );
}
