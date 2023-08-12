import { Engine, IRenderingEngine } from '@univerjs/base-render';
import { getRefElement } from '@univerjs/base-ui';
import { LocaleService, LocaleType, ObserverManager } from '@univerjs/core';
import { Inject, Injector, SkipSelf } from '@wendellhu/redi';

import { IDocUIPluginConfig } from '../Basics';
import { DocContainer } from '../View';
import { InfoBarUIController } from './InfoBarUIController';
import { ToolbarUIController } from './ToolbarUIController';

export class DocContainerUIController {
    private _docContainer: DocContainer;

    private _toolbarController: ToolbarUIController;

    private _infoBarController: InfoBarUIController;

    constructor(
        private readonly _config: IDocUIPluginConfig,
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ObserverManager) private readonly _observerManager: ObserverManager,
        @IRenderingEngine private readonly _renderingEngine: Engine
    ) {
        this._initialize();

        this._toolbarController = this._injector.createInstance(ToolbarUIController, this._config.layout?.toolbarConfig || {});
        this._infoBarController = new InfoBarUIController();
    }

    getUIConfig() {
        const config = {
            injector: this._injector,
            config: this._config,
            changeLocale: this.changeLocale,
            getComponent: this.getComponent,
            // 其余组件的props
            methods: {
                toolbar: {
                    getComponent: this._toolbarController.getComponent,
                },
                infoBar: {
                    getComponent: this._infoBarController.getComponent,
                    // renameSheet: this._infoBarController.renameSheet,
                },
            },
        };
        return config;
    }

    // 获取SheetContainer组件
    getComponent = (ref: DocContainer) => {
        this._docContainer = ref;

        const container = getRefElement(ref.getContentRef());

        const engine = this._renderingEngine;
        engine.setContainer(container);

        window.addEventListener('resize', () => {
            engine.resize();
        })

        setTimeout(() => {
            engine.resize();
        });

        this._observerManager.requiredObserver<DocContainer>('onUIDidMount')?.notifyObservers(this._docContainer);
        this._globalObserverManager.requiredObserver<boolean>('onUIDidMountObservable', 'core').notifyObservers(true);

        this._initDocContainer();
    };

    /**
     * Change language
     * @param {String} lang new language
     *
     * e: {target: HTMLSelectElement } reference from  https://stackoverflow.com/a/48443771
     *
     */
    changeLocale = (locale: string) => {
        this._localeService.getLocale().change(locale as LocaleType);
        this._globalObserverManager.requiredObserver('onAfterChangeUILocaleObservable', 'core')!.notifyObservers();
    };

    getContentRef() {
        return this._docContainer.getContentRef();
    }

    getToolbarController() {
        return this._toolbarController;
    }

    UIDidMount(cb: Function) {
        if (this._docContainer) {
            return cb(this._docContainer);
        }

        this._plugin.getObserver('onUIDidMount')?.add(() => cb(this._docContainer));
    }

    getDocContainer() {
        return this._docContainer;
    }

    private _initialize() {}

    private _initDocContainer() {
        // handle drag event
    }
}