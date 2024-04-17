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

import { DEFAULT_DOCUMENT_SUB_COMPONENT_ID, LocaleService, Plugin } from '@univerjs/core';
import type { Dependency, Injector } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';

import { ImageLoadController } from './controllers/image.load.controller';
import { ImageModel } from './models/image-model';
import { IImageManagerService, ImageManagerService } from './services/image-manager.service';
import { IImageRenderService, ImageRenderService } from './services/image-render.service';

const PLUGIN_NAME = 'IMAGE_PLUGIN';

export class UniverImagePlugin extends Plugin {
    constructor(
        config: undefined,
        protected _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(PLUGIN_NAME);
    }

    override onStarting(_injector: Injector): void {
        this._initDependencies(_injector);
        this._injector = _injector;
    }

    override onReady(): void {
        /**
         * TODO: @DR-Univer Before the loading process is completed, mock some data for testing.
         */
        const imageManagerService = this._injector.get(IImageManagerService);
        const model = new ImageModel({
            imageId: 'shapeTest1',
            contentUrl: 'https://minio.cnbabylon.com/univer/slide/gartner-tech-2022.png',
        });
        imageManagerService.add({
            unitId: 'd',
            subUnitId: DEFAULT_DOCUMENT_SUB_COMPONENT_ID,
            imageId: 'shapeTest1',
            imageModel: model,
        });

        // imageProperties: {
        //     contentUrl: 'https://minio.cnbabylon.com/univer/slide/gartner-tech-2022.png',
        // },

        // imageProperties: {
        //     contentUrl: 'https://minio.cnbabylon.com/univer/slide/hype-cycle-for-emerging-tech-2022.png',
        // },
    }

    private _initDependencies(injector: Injector): void {
        const dependencies: Dependency[] = [
            // legacy managers - deprecated
            // [ComponentManager],
            // [ZIndexManager],
            // services
            [IImageManagerService, { useClass: ImageManagerService }],
            [IImageRenderService, { useClass: ImageRenderService }],
            // controllers
            [ImageLoadController],
            // [SharedController],
            // [IUIController, { useClass: DesktopUIController }],
        ];

        dependencies.forEach((dependency) => injector.add(dependency));
    }
}
