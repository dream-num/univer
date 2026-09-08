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
import type { IUniverDocsUIConfig } from './config/config';
import { DependentOn, ICommandService, IConfigService, Inject, Injector, mergeOverrideWithDependencies } from '@univerjs/core';
import { UniverDocsPlugin } from '@univerjs/docs';
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverMobileUIPlugin } from '@univerjs/ui';
import { defaultPluginConfig } from './config/config';
import { ComponentsController } from './controllers/components.controller';
import { MobileComponentsController } from './controllers/mobile/components.controller';
import { DocMobileUIController } from './controllers/mobile/ui.controller';
import { DocBackScrollRenderController } from './controllers/render-controllers/back-scroll.render-controller';
import { DocSelectionRenderController } from './controllers/render-controllers/doc-selection-render.controller';
import { DocRenderController } from './controllers/render-controllers/doc.render-controller';
import { MobileDocBackScrollRenderController } from './controllers/render-controllers/mobile/back-scroll.render-controller';
import { MobileDocSelectionRenderController } from './controllers/render-controllers/mobile/doc-selection-render.controller';
import { MobileDocRenderController } from './controllers/render-controllers/mobile/doc.render-controller';
import { MobileDocZoomRenderController } from './controllers/render-controllers/mobile/zoom.render-controller';
import { DocZoomRenderController } from './controllers/render-controllers/zoom.render-controller';
import { DocUIController } from './controllers/ui.controller';
import { UniverDocsUIPlugin } from './plugin';
import { DocParagraphMenuService } from './services/doc-paragraph-menu.service';
import { DocViewScaleService } from './services/doc-view-scale';
import { DocFloatMenuService } from './services/float-menu.service';
import { MobileDocParagraphMenuService } from './services/mobile/doc-paragraph-menu.service';
import { MobileDocSelectionRenderService } from './services/mobile/doc-selection-render.service';
import { MobileDocViewScaleService } from './services/mobile/doc-view-scale';
import { MobileDocFloatMenuService } from './services/mobile/float-menu.service';
import { DocSelectionRenderService } from './services/selection/doc-selection-render.service';

@DependentOn(UniverDocsPlugin, UniverRenderEnginePlugin, UniverMobileUIPlugin)
export class UniverDocsMobileUIPlugin extends UniverDocsUIPlugin {
    static override pluginName = UniverDocsUIPlugin.pluginName;

    constructor(
        config: Partial<IUniverDocsUIConfig> = {},
        @Inject(Injector) injector: Injector,
        @IRenderManagerService renderManagerService: IRenderManagerService,
        @ICommandService commandService: ICommandService,
        @IConfigService configService: IConfigService
    ) {
        super({
            ...config,
            override: [
                ...(config.override ?? []),
                [DocUIController, { useClass: DocMobileUIController }],
                [ComponentsController, { useClass: MobileComponentsController }],
            ],
            fitToWidth: {
                ...defaultPluginConfig.fitToWidth,
                mode: 'fit-width',
                target: 'viewport',
                paddingX: 12,
                minScale: 0,
                maxScale: 1,
                align: 'center',
                ...config.fitToWidth,
            },
        }, injector, renderManagerService, commandService, configService);
    }

    protected override _getRenderBasics(): Dependency[] {
        return mergeOverrideWithDependencies(super._getRenderBasics(), [
            [DocRenderController, { useClass: MobileDocRenderController }],
            [DocSelectionRenderService, { useClass: MobileDocSelectionRenderService }],
            [DocSelectionRenderController, { useClass: MobileDocSelectionRenderController }],
            [DocBackScrollRenderController, { useClass: MobileDocBackScrollRenderController }],
            [DocZoomRenderController, { useClass: MobileDocZoomRenderController }],
            [DocViewScaleService, { useClass: MobileDocViewScaleService }],
        ]);
    }

    protected override _getRenderModules(): Dependency[] {
        return mergeOverrideWithDependencies(super._getRenderModules(), [
            [DocFloatMenuService, { useClass: MobileDocFloatMenuService }],
            [DocParagraphMenuService, { useClass: MobileDocParagraphMenuService }],
        ]);
    }
}
