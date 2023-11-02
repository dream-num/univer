import { IUniverInstanceService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { FORMULA_PLUGIN_NAME } from './common/PLUGIN_NAME';
import { enUS } from './locale';

export class FormulaPlugin extends Plugin {
    static override type = PluginType.Sheet;
    constructor(
        config: undefined,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService
    ) {
        super(FORMULA_PLUGIN_NAME);

        this._localeService.getLocale().load({
            enUS,
        });
    }
}
