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

import type { Dependency, SlideDataModel } from '@univerjs/core';
import type { IUniverSlidesUIConfig } from './controllers/config.schema';
import { IConfigService, Inject, Injector, IUniverInstanceService, merge, mergeOverrideWithDependencies, Plugin, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CanvasView } from './controllers/canvas-view';
import { defaultPluginConfig, SLIDES_UI_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SlidePopupMenuController } from './controllers/popup-menu.controller';
import { SlideEditingRenderController } from './controllers/slide-editing.render-controller';
import { SlideEditorBridgeRenderController } from './controllers/slide-editor-bridge.render-controller';
import { SlidesUIController } from './controllers/slide-ui.controller';
import { SlideRenderController } from './controllers/slide.render-controller';
import { ISlideEditorBridgeService, SlideEditorBridgeService } from './services/slide-editor-bridge.service';
import { ISlideEditorManagerService, SlideEditorManagerService } from './services/slide-editor-manager.service';
import { SlideCanvasPopMangerService } from './services/slide-popup-manager.service';
import { SlideRenderService } from './services/slide-render.service';

export const SLIDE_UI_PLUGIN_NAME = 'SLIDE_UI';

export class UniverSlidesUIPlugin extends Plugin {
    static override pluginName = SLIDE_UI_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SLIDE;

    constructor(
        private readonly _config: Partial<IUniverSlidesUIConfig> = defaultPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(SLIDES_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        mergeOverrideWithDependencies([
            [SlideRenderService],
            [ISlideEditorBridgeService, { useClass: SlideEditorBridgeService }],
            // used by SlideUIController --> EditorContainer
            [ISlideEditorManagerService, { useClass: SlideEditorManagerService }],
            [SlideCanvasPopMangerService],
        ] as Dependency[], this._config.override)
            .forEach((d) => this._injector.add(d));
    }

    override onReady(): void {
        ([
            // SlideRenderService will be init in ready stage, and then calling RenderManagerService@createRender --> init all deps in this rendering register block.

            [SlideRenderController],
        ] as Dependency[]).forEach((m) => {
            this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SLIDE, m));
        });

        mergeOverrideWithDependencies([
            [CanvasView],
            // cannot register in _renderManagerService now.
            // [ISlideEditorBridgeService, { useClass: SlideEditorBridgeService }],
            // // used by SlideUIController --> EditorContainer
            // [ISlideEditorManagerService, { useClass: SlideEditorManagerService }],

            // SlidesUIController controller should be registered in Ready stage.
            // SlidesUIController controller would add a new RenderUnit (__INTERNAL_EDITOR__DOCS_NORMAL)
            [SlidesUIController], // editor service was create in renderManagerService
            [SlideRenderController],
            [SlidePopupMenuController],
        ] as Dependency[], this._config.override).forEach((m) => {
            this._injector.add(m);
        });

        this._injector.get(CanvasView);
        this._injector.get(SlideRenderService);
    }

    override onRendered(): void {
        ([
            // need slideEditorBridgeService
            // need TextSelectionRenderService which init by EditorContainer
            [SlideEditorBridgeRenderController],
            [SlideEditingRenderController],
        ] as Dependency[]).forEach((m) => {
            // find all renderMap and register module to each item in renderMap
            this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SLIDE, m));
        });

        this._markSlideAsFocused();

        this._injector.get(SlidesUIController);
    }

    override onSteady(): void {
        this._injector.get(SlidePopupMenuController);
    }

    private _markSlideAsFocused() {
        const currentService = this._univerInstanceService;
        try {
            const slideDataModel = currentService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE)!;
            currentService.focusUnit(slideDataModel.getUnitId());
        } catch (e) {
        }
    }
}
