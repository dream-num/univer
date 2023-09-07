import { ComponentManager, RegisterManager } from '@univerjs/base-ui';
import { LocaleService, Plugin, PluginType, Tools } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { DefaultDocUiConfig, IDocUIPluginConfig, installObserver } from './Basics';
import { DOC_UI_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { AppUIController } from './Controller';
import { en, zh } from './Locale';

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
        this._initializeDependencies(_injector);
    }

    initialize(): void {
        this._localService.getLocale().load({
            en,
            zh,
        });

        installObserver(this);

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

    private _initializeDependencies(injector: Injector) {
        const dependencies: Dependency[] = [
            [ComponentManager],
            [
                AppUIController,
                {
                    useFactory: () => this._injector.createInstance(AppUIController, this._config),
                },
            ],
        ];

        dependencies.forEach((d) => {
            injector.add(d);
        });
    }
}
