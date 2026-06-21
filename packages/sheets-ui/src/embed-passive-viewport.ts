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

import type { Injector } from '@univerjs/core';
import type { IEmbedPassiveViewportProvider } from '@univerjs/embed-ui';
import { UniverInstanceType } from '@univerjs/core';
import { scrollSceneViewportPassive, shouldPassDocsStickyVerticalWheelToHost } from '@univerjs/embed-ui';
import { IRenderManagerService, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';

export function createSheetsPassiveViewportProvider(rootInjector: Injector): IEmbedPassiveViewportProvider {
    return {
        childType: UniverInstanceType.UNIVER_SHEET,
        handleWheel: (context) => {
            if (context.source !== 'host-scroll-sync' && shouldPassDocsStickyVerticalWheelToHost(context.layout, context.event)) {
                return false;
            }

            const injector = context.runtimeScope?.injector ?? rootInjector;
            const renderManagerService = injector.has(IRenderManagerService)
                ? injector.get(IRenderManagerService)
                : rootInjector.has(IRenderManagerService)
                    ? rootInjector.get(IRenderManagerService)
                    : undefined;
            if (!renderManagerService) {
                return false;
            }

            const render = renderManagerService.getRenderById(context.childUnitId);
            const scene = render?.scene;
            return scrollSceneViewportPassive(
                context,
                scene?.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN),
                scene
            );
        },
    };
}
