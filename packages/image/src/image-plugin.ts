import { DEFAULT_DOCUMENT_SUB_COMPONENT_ID, LocaleService, Plugin, PLUGIN_NAMES, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { ImageLoadController } from './controllers/image.load.controller';
import { ImageModel } from './models/image-model';
import { IImageManagerService, ImageManagerService } from './services/image-manager.service';
import { IImageRenderService, ImageRenderService } from './services/image-render.service';

export class ImagePlugin extends Plugin {
    static override type = PluginType.Univer;

    constructor(
        config: undefined,
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(PLUGIN_NAMES.BASE_COMPONENT);
    }

    override onStarting(_injector: Injector): void {
        this._initDependencies(_injector);
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
            subComponentId: DEFAULT_DOCUMENT_SUB_COMPONENT_ID,
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
