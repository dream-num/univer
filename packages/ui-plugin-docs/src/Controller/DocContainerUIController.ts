import { Engine, IRenderingEngine } from '@univerjs/base-render';
import { LocaleService, LocaleType, ObserverManager } from '@univerjs/core';
import { Inject, Injector, SkipSelf } from '@wendellhu/redi';

import { IDocUIPluginConfig } from '../Basics';
import { DocContainer } from '../View';

export class DocContainerUIController {
    private _docContainer: DocContainer;

    constructor(
        private readonly _config: IDocUIPluginConfig,
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ObserverManager) private readonly _observerManager: ObserverManager,
        @IRenderingEngine private readonly _renderingEngine: Engine
    ) {}

    getUIConfig() {
        const config = {
            injector: this._injector,
            config: this._config,
            changeLocale: this.changeLocale,
            getComponent: this.getComponent,
        };
        return config;
    }

    // 获取SheetContainer组件
    getComponent = (ref: DocContainer) => {
        this._docContainer = ref;

        const container = ref.getContentRef().current;

        if (!container) {
            throw new Error('container is not ready');
        }

        const engine = this._renderingEngine;
        engine.setContainer(container);

        window.addEventListener('resize', () => {
            engine.resize();
        });

        setTimeout(() => {
            engine.resize();
        });

        this._observerManager.requiredObserver<DocContainer>('onUIDidMount')?.notifyObservers(this._docContainer);
        this._globalObserverManager.requiredObserver<boolean>('onUIDidMountObservable', 'core').notifyObservers(true);
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

    UIDidMount(cb: Function) {
        if (this._docContainer) {
            return cb(this._docContainer);
        }
    }

    getDocContainer() {
        return this._docContainer;
    }
}
