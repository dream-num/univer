import { LocaleService, LocaleType } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { IDocUIPluginConfig } from '../basics';
import { DocContainer } from '../views/doc-container/DocContainer';

export class DocContainerUIController {
    private _docContainer?: DocContainer;

    constructor(
        private readonly _config: IDocUIPluginConfig,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) private readonly _injector: Injector
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
    };

    /**
     * Change language
     * @param {String} lang new language
     *
     * e: {target: HTMLSelectElement } reference from  https://stackoverflow.com/a/48443771
     *
     */
    changeLocale = (locale: string) => {
        this._localeService.setLocale(locale as LocaleType);
    };

    getContentRef() {
        return this._docContainer!.getContentRef();
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
