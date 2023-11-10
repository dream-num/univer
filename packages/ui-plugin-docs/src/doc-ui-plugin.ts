import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY } from '@univerjs/base-render';
import { IUniverInstanceService, LocaleService, Plugin, PluginType, Tools } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { DefaultDocUiConfig, IDocUIPluginConfig } from './basics';
import { DOC_UI_PLUGIN_NAME } from './basics/const/plugin-name';
import { AppUIController } from './controllers';
import { DocClipboardController } from './controllers/clipboard.controller';
import { DocUIController } from './controllers/doc-ui.controller';
import { enUS } from './locale';
import { DocClipboardService, IDocClipboardService } from './services/clipboard/clipboard.service';

export class DocUIPlugin extends Plugin {
    static override type = PluginType.Doc;

    constructor(
        private readonly _config: IDocUIPluginConfig,
        @Inject(Injector) override _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(DOC_UI_PLUGIN_NAME);

        this._localeService.load({
            enUS,
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
            [IDocClipboardService, { useClass: DocClipboardService }],
            [DocClipboardController],
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

        if (id !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY && id !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
            currentService.focusUniverInstance(doc.getUnitId());
        }
    }

    private _initModules(): void {
        this._injector.get(AppUIController);
        this._injector.get(DocClipboardController).initialize();
    }
}
