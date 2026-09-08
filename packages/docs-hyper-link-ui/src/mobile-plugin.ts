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
import { UniverDocsHyperLinkPlugin } from '@univerjs/docs-hyper-link';
import { UniverDocsMobileUIPlugin } from '@univerjs/docs-ui';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { ComponentsController } from './controllers/components.controller';
import { MobileComponentsController } from './controllers/mobile/components.controller';
import { DocHyperLinkEventRenderController } from './controllers/render-controllers/hyper-link-event.render-controller';
import { MobileDocHyperLinkEventRenderController } from './controllers/render-controllers/mobile/hyper-link-event.render-controller';
import { UniverDocsHyperLinkUIPlugin } from './plugin';
import { DocHyperLinkPopupService } from './services/hyper-link-popup.service';
import { MobileDocHyperLinkPopupService } from './services/mobile/hyper-link-popup.service';

@DependentOn(UniverDocsPlugin, UniverRenderEnginePlugin, UniverDocsHyperLinkPlugin, UniverDocsMobileUIPlugin)
export class UniverDocsHyperLinkMobileUIPlugin extends UniverDocsHyperLinkUIPlugin {
    protected override _getDependencies(): Dependency[] {
        return mergeOverrideWithDependencies(super._getDependencies(), [
            [ComponentsController, { useClass: MobileComponentsController }],
            [DocHyperLinkPopupService, { useClass: MobileDocHyperLinkPopupService }],
        ]);
    }

    protected override _getRenderModules(): Dependency[] {
        return mergeOverrideWithDependencies(super._getRenderModules(), [
            [DocHyperLinkEventRenderController, { useClass: MobileDocHyperLinkEventRenderController }],
        ]);
    }
}
