/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { Dependency, DependencyIdentifier, Injector } from '@univerjs/core';
import { LifecycleService, LifecycleStages, registerDependencies, touchDependencies } from '@univerjs/core';
import { SheetCanvasFloatDomManagerService } from '../../services/canvas-float-dom-manager.service';

export const SHEETS_DRAWING_FLOATING_HOST_DEPENDENCIES: Dependency[] = [
    [SheetCanvasFloatDomManagerService],
];

const SHEETS_DRAWING_FLOATING_HOST_TOUCH_DEPENDENCIES: [DependencyIdentifier<unknown>][] = [
    [SheetCanvasFloatDomManagerService],
];

export function registerSheetsDrawingFloatingHostCapability(injector: Injector): void {
    registerDependencies(injector, SHEETS_DRAWING_FLOATING_HOST_DEPENDENCIES);
    touchSheetsDrawingFloatingHostCapabilityWhenReady(injector);
}

function touchSheetsDrawingFloatingHostCapabilityWhenReady(injector: Injector): void {
    if (!injector.has(LifecycleService)) {
        touchDependencies(injector, SHEETS_DRAWING_FLOATING_HOST_TOUCH_DEPENDENCIES);
        return;
    }

    const lifecycleService = injector.get(LifecycleService);
    if (lifecycleService.stage >= LifecycleStages.Ready) {
        touchDependencies(injector, SHEETS_DRAWING_FLOATING_HOST_TOUCH_DEPENDENCIES);
        return;
    }

    void lifecycleService.onStage(LifecycleStages.Ready).then(() => {
        touchDependencies(injector, SHEETS_DRAWING_FLOATING_HOST_TOUCH_DEPENDENCIES);
    });
}
