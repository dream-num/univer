import { Plugin, PluginType } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { SHEET_NUMFMT_PLUGIN } from './base/const/PLUGIN_NAME';
import { NumfmtController } from './controllers/numfmt.controller';
import { INumfmtController } from './controllers/type';
import { UserHabitController } from './controllers/user-habit.controller';
import { NumfmtService } from './service/numfmt.service';
import { INumfmtService } from './service/type';

export class NumfmtPlugin extends Plugin {
    static override type = PluginType.Sheet;
    constructor(@Inject(Injector) override readonly _injector: Injector) {
        super(SHEET_NUMFMT_PLUGIN);
    }

    override onStarting(): void {
        this._injector.add([INumfmtController, { useClass: NumfmtController, lazy: false }]);
        this._injector.add([INumfmtService, { useClass: NumfmtService, lazy: false }]);
        this._injector.add([UserHabitController]);
    }
}
