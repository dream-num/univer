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

import { IDrawingManagerService, IImageRemoteService, LocaleService, Plugin } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { ImageRemoteService } from './services/image-remote.service';
import { DrawingManagerService } from './services/drawing-manager.service';

const PLUGIN_NAME = 'DRAWING_PLUGIN';

export class UniverDrawingPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;

    constructor(
        config: undefined,
        @Inject(Injector) protected _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
    }

    override onStarting(_injector: Injector): void {
        this._initDependencies(_injector);
        this._mockAddImage();
    }

    private _mockAddImage(): void {
        /**
         * TODO: @DR-Univer Before the loading process is completed, mock some data for testing.
         */
        // const imageManagerService = this._injector.get(IImageManagerService);
        // const model = new ImageModel({
        //     imageId: 'shapeTest1',
        //     contentUrl: 'https://static01.nyt.com/images/2019/09/04/business/04chinaclone-01/merlin_160087014_de761d9a-4360-402d-a15b-ddeff775760d-master1050.jpg',
        //     sourceType: SourceType.URL,
        //     sourceType: ImageSourceType.URL,
        //     source: 'https://minio.cnbabylon.com/univer/slide/gartner-tech-2022.png',
        // });
        // imageManagerService.add({
        //     unitId: 'd',
        //     subUnitId: DEFAULT_DOCUMENT_SUB_COMPONENT_ID,
        //     imageId: 'shapeTest1',
        //     imageModel: model,
        // });

        // const model2 = new ImageModel({
        //     imageId: 'shapeTest2',
        //     contentUrl: 'https://minio.cnbabylon.com/univer/slide/gartner-tech-2022.png',
        // });
        // imageManagerService.add({
        //     unitId: 'd',
        //     subUnitId: DEFAULT_DOCUMENT_SUB_COMPONENT_ID,
        //     imageId: 'shapeTest2',
        //     imageModel: model2,
        // });

        // const model3 = new ImageModel({
        //     imageId: 'shapeTest3',
        //     contentUrl: 'https://p.potaufeu.asahi.com/e511-p/picture/28108272/c96ce4be5caeb371b0d3acace6a846c4.jpg',
        // });
        // imageManagerService.add({
        //     unitId: 'd',
        //     subUnitId: DEFAULT_DOCUMENT_SUB_COMPONENT_ID,
        //     imageId: 'shapeTest3',
        //     imageModel: model3,
        // });

        // const model4 = new ImageModel({
        //     imageId: 'shapeTest4',
        //     contentUrl: 'https://i.epochtimes.com/assets/uploads/2017/12/dddcat-2838801-600x400.jpg',
        // });
        // imageManagerService.add({
        //     unitId: 'd',
        //     subUnitId: DEFAULT_DOCUMENT_SUB_COMPONENT_ID,
        //     imageId: 'shapeTest4',
        //     imageModel: model4,
        // });

        // const model5 = new ImageModel({
        //     imageId: 'shapeTest5',
        //     contentUrl: 'https://pic2.zhimg.com/80/b0fb7ff44b35986d9f8569e34d30692d_1440w.webp',
        // });
        // imageManagerService.add({
        //     unitId: 'd',
        //     subUnitId: DEFAULT_DOCUMENT_SUB_COMPONENT_ID,
        //     imageId: 'shapeTest5',
        //     imageModel: model5,
        // });

        // imageProperties: {
        //     contentUrl: 'https://minio.cnbabylon.com/univer/slide/gartner-tech-2022.png',
        // },

        // imageProperties: {
        //     contentUrl: 'https://minio.cnbabylon.com/univer/slide/hype-cycle-for-emerging-tech-2022.png',
        // },
    }

    private _initDependencies(injector: Injector): void {
        const dependencies: Dependency[] = [
            // services
            [IImageRemoteService, { useClass: ImageRemoteService }],
            [IDrawingManagerService, { useClass: DrawingManagerService }],
            // controllers
            // [ImageController],
        ];

        dependencies.forEach((dependency) => injector.add(dependency));
    }
}
