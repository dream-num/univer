import { Plugin, PluginType } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { SHEET_NUMFMT_PLUGIN } from './base/const/PLUGIN_NAME';
import { NumfmtController } from './controllers/numfmt.controller';
import { NumfmtService } from './service/numfmt.service';

export class NumfmtPlugin extends Plugin {
    static override type = PluginType.Sheet;
    constructor(@Inject(Injector) override readonly _injector: Injector) {
        super(SHEET_NUMFMT_PLUGIN);
    }

    override onStarting(): void {
        this._injector.add([NumfmtService]);
        this._injector.add([NumfmtController]);
    }
}
