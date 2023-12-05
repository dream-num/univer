import { Plugin, PluginType } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { SHEET_NUMFMT_PLUGIN } from './base/const/PLUGIN_NAME';
import { NumfmtController } from './controllers/numfmt.controller';
import { NumfmtCopyPasteController } from './controllers/numfmt.copy-paste.controller';
import { NumfmtEditorController } from './controllers/numfmt.editor.controller';
import { NumfmtRefRangeController } from './controllers/numfmt.ref-range.controller';
import { NumfmtSheetController } from './controllers/numfmt.sheet.controller';
import { INumfmtController } from './controllers/type';
import { UserHabitController } from './controllers/user-habit.controller';

export class NumfmtPlugin extends Plugin {
    static override type = PluginType.Sheet;
    constructor(@Inject(Injector) override readonly _injector: Injector) {
        super(SHEET_NUMFMT_PLUGIN);
    }

    override onStarting(): void {
        this._injector.add([INumfmtController, { useClass: NumfmtController, lazy: false }]);
        this._injector.add([NumfmtEditorController]);
        this._injector.add([UserHabitController]);
        this._injector.add([NumfmtRefRangeController]);
        this._injector.add([NumfmtSheetController]);
        this._injector.add([NumfmtCopyPasteController]);
    }
}
