import {
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    IUniverInstanceService,
    LocaleService,
    Plugin,
    PluginType,
    Tools,
} from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import type { IDocsUIPluginConfig } from './basics';
import { DefaultDocUiConfig } from './basics';
import { DOC_UI_PLUGIN_NAME } from './basics/const/plugin-name';
import { AppUIController } from './controllers';
import { DocUIController } from './controllers/doc-ui.controller';
import { zhCN } from './locale';

export class DocsUIPlugin extends Plugin {
    static override type = PluginType.Doc;

    constructor(
        private readonly _config: IDocsUIPluginConfig,
        @Inject(Injector) override _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(DOC_UI_PLUGIN_NAME);

        this._localeService.load({
            zhCN,
        });

        this._config = Tools.deepMerge({}, DefaultDocUiConfig, this._config);
        this._initDependencies(_injector);
    }

    override onRendered(): void {
        this._initModules();
        this._markDocAsFocused();
    }

    override onDestroy(): void {}

    private _initDependencies(injector: Injector) {
        const dependencies: Dependency[] = [
            [DocUIController],
            [
                // controllers
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

    private _markDocAsFocused() {
        const currentService = this._injector.get(IUniverInstanceService);
        const doc = currentService.getCurrentUniverDocInstance();
        const id = doc.getUnitId();

        if (id !== DOCS_NORMAL_EDITOR_UNIT_ID_KEY && id !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
            currentService.focusUniverInstance(doc.getUnitId());
        }
    }

    private _initModules(): void {
        this._injector.get(AppUIController);
    }
}
