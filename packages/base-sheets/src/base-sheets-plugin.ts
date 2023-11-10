import { ICommandService, LocaleService, Plugin, PLUGIN_NAMES, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { BasicWorksheetController } from './controllers/basic-worksheet.controller';
import { MergeCellController } from './controllers/merge-cell.controller';
import { enUS } from './locale';
import { BorderStyleManagerService } from './services/border-style-manager.service';
import { SheetPermissionService } from './services/permission';
import { RefRangeService } from './services/ref-range.service';
import { SelectionManagerService } from './services/selection-manager.service';

/**
 * The main sheet base, construct the sheet container and layout, mount the rendering engine
 */
export class SheetPlugin extends Plugin {
    static override type = PluginType.Sheet;

    constructor(
        config: undefined,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super(PLUGIN_NAMES.SPREADSHEET);

        this._initializeDependencies(_injector);
    }

    override onRendered(): void {
        this._localeService.load({
            enUS,
        });
    }

    private _initializeDependencies(sheetInjector: Injector) {
        const dependencies: Dependency[] = [
            // services
            [BorderStyleManagerService],
            [SelectionManagerService],
            [RefRangeService],
            [SheetPermissionService],
            // controllers
            [BasicWorksheetController],
            [MergeCellController],
        ];

        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
    }
}
