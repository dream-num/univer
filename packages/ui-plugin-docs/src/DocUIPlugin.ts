import { Dependency, Inject, Injector } from '@wendellhu/redi';
import { Plugin, PLUGIN_NAMES, Tools, PluginType, LocaleService, CommandManager } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { ComponentManager, RegisterManager } from '@univerjs/base-ui';

import { zh, en } from './Locale';
import { DOC_UI_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { DefaultDocUiConfig, IDocUIPluginConfig, installObserver } from './Basics';
import { AppUIController } from './Controller';

export class DocUIPlugin extends Plugin<any> {
    static override type = PluginType.Doc;

    private _appUIController: AppUIController;

    private _registerManager: RegisterManager;

    private _componentManager: ComponentManager;

    constructor(
        private readonly _config: IDocUIPluginConfig,
        @Inject(Injector) override _injector: Injector,
        @Inject(LocaleService) private readonly _localService: LocaleService
    ) {
        super(DOC_UI_PLUGIN_NAME);

        this._config = Tools.deepMerge({}, DefaultDocUiConfig, this._config);
    }

    initialize(): void {
        this._localService.getLocale().load({
            en,
            zh,
        });

        const dependencies: Dependency[] = [
            [ComponentManager],
            [
                AppUIController,
                {
                    useFactory: () => this._injector.createInstance(AppUIController, this._config),
                },
            ],
        ];

        installObserver(this);

        dependencies.forEach((d) => {
            this._injector.add(d);
        });

        this._componentManager = this._injector.get(ComponentManager);
        this._appUIController = this._injector.get(AppUIController);
    }

    /**
     * usage this._clipboardExtensionManager.handle(data);
     * @returns
     */
    getRegisterManager(): RegisterManager {
        return this._registerManager;
    }

    /**
     * This API is used in plugins for initialization that depends on UI rendering
     * @param cb
     * @returns
     */
    UIDidMount(cb: Function) {
        this._appUIController.getDocContainerController().UIDidMount(cb);
    }

    override onMounted(): void {
        this.initialize();
    }

    override onDestroy(): void {}

}