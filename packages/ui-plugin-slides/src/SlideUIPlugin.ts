import { ComponentManager } from '@univerjs/base-ui';
import { LocaleService, Plugin, PluginType, Tools } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { DefaultSlideUIConfig, ISlideUIPluginConfig } from './Basics';
import { SLIDE_UI_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { IToolbarItemProps } from './Controller';
import { AppUIController } from './Controller/AppUIController';
import { en } from './Locale';

export class SlideUIPlugin extends Plugin {
    static override type = PluginType.Slide;

    private _appUIController?: AppUIController;

    private _config: ISlideUIPluginConfig;

    private _componentManager?: ComponentManager;

    constructor(
        config: Partial<ISlideUIPluginConfig> = {},
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(SLIDE_UI_PLUGIN_NAME);
        this._config = Tools.deepMerge({}, DefaultSlideUIConfig, config);

        this.initializeDependencies();
    }

    getConfig() {
        return this._config;
    }

    override onStarting(_injector: Injector): void {
        this._localeService.getLocale().load({
            en,
        });
    }

    getAppUIController() {
        return this._appUIController;
    }

    getComponentManager() {
        return this._componentManager;
    }

    addToolButton(config: IToolbarItemProps) {
        this._appUIController!.getSlideContainerController().getToolbarController().addToolbarConfig(config);
    }

    deleteToolButton(name: string) {
        this._appUIController!.getSlideContainerController().getToolbarController().deleteToolbarConfig(name);
    }

    private initializeDependencies(): void {
        this._injector.add([ComponentManager]);

        this._componentManager = this._injector.get(ComponentManager);
        this._appUIController = this._injector.createInstance(AppUIController, this._config);
    }
}
