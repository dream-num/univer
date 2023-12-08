import { ICommandService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { ActiveDirtyController } from './controllers/active-dirty.controller';
import { BasicWorksheetController } from './controllers/basic-worksheet.controller';
import { CalculateResultApplyController } from './controllers/calculate-result-apply.controller';
import { MergeCellController } from './controllers/merge-cell.controller';
import { PassiveDirtyController } from './controllers/passive-dirty.controller';
import { zhCN } from './locale';
import { BorderStyleManagerService } from './services/border-style-manager.service';
import { NumfmtService } from './services/numfmt/numfmt.service';
import { INumfmtService } from './services/numfmt/type';
import { SheetPermissionService } from './services/permission';
import { RefRangeService } from './services/ref-range/ref-range.service';
import { SelectionManagerService } from './services/selection-manager.service';
import { SheetInterceptorService } from './services/sheet-interceptor/sheet-interceptor.service';

const PLUGIN_NAME = 'sheet';

export interface ISheetsPluginConfig {
    notExecuteFormula?: boolean;
}

/**
 * The main sheet base, construct the sheet container and layout, mount the rendering engine
 */
export class SheetsPlugin extends Plugin {
    static override type = PluginType.Sheet;

    constructor(
        private _config: ISheetsPluginConfig,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super(PLUGIN_NAME);

        this._initializeDependencies(_injector);
    }

    override onRendered(): void {
        this._localeService.load({
            zhCN,
        });
    }

    private _initializeDependencies(sheetInjector: Injector) {
        const dependencies: Dependency[] = [
            // services
            [BorderStyleManagerService],
            [SelectionManagerService],
            [RefRangeService],
            [SheetPermissionService],
            [INumfmtService, { useClass: NumfmtService }],
            [SheetInterceptorService],

            // controllers
            [BasicWorksheetController],
            [MergeCellController],
            [ActiveDirtyController],
            [PassiveDirtyController],
        ];

        if (!this._config?.notExecuteFormula) {
            dependencies.push([CalculateResultApplyController]);
        }

        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
    }
}
