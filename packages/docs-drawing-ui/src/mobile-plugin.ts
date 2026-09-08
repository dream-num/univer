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

import type { Dependency } from '@univerjs/core';
import { DependentOn, mergeOverrideWithDependencies } from '@univerjs/core';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsDrawingPlugin } from '@univerjs/docs-drawing';
import { UniverDocsMobileUIPlugin } from '@univerjs/docs-ui';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { UniverDrawingMobileUIPlugin } from '@univerjs/drawing-ui';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { ComponentsController } from './controllers/components.controller';
import { MobileComponentsController } from './controllers/mobile/components.controller';
import { MobileDocDrawingPopupMenuController } from './controllers/mobile/drawing-popup-menu.controller';
import { DocDrawingUpdateRenderController } from './controllers/render-controllers/doc-drawing-update.render-controller';
import { MobileDocDrawingUpdateRenderController } from './controllers/render-controllers/mobile/doc-drawing-update.render-controller';
import { DocDrawingPopupMenuController } from './menu/drawing-popup-menu.controller';
import { UniverDocsDrawingUIPlugin } from './plugin';

@DependentOn(UniverDocsPlugin, UniverDrawingPlugin, UniverRenderEnginePlugin, UniverDocsDrawingPlugin, UniverDocsMobileUIPlugin, UniverDrawingMobileUIPlugin)
export class UniverDocsDrawingMobileUIPlugin extends UniverDocsDrawingUIPlugin {
    protected override _getDependencies(): Dependency[] {
        return mergeOverrideWithDependencies(super._getDependencies(), [
            [ComponentsController, { useClass: MobileComponentsController }],
            [DocDrawingPopupMenuController, { useClass: MobileDocDrawingPopupMenuController }],
        ]);
    }

    protected override _getRenderModules(): Dependency[] {
        return mergeOverrideWithDependencies(super._getRenderModules(), [
            [DocDrawingUpdateRenderController, { useClass: MobileDocDrawingUpdateRenderController }],
        ]);
    }
}
