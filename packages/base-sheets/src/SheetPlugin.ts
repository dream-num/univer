import { ICommandService, LocaleService, Plugin, PLUGIN_NAMES, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { SetScrollOperation } from './commands/operations/scroll.operation';
import { SetCopySelectionsOperation, SetSelectionsOperation } from './commands/operations/selection.operation';
import { SetZoomRatioOperation } from './commands/operations/set-zoom-ratio.operation';
import { AutoHeightController } from './Controller/auto-height.controller';
import { BasicWorksheetController } from './Controller/BasicWorksheet.controller';
import { FormulaBarController } from './Controller/FormulaBarController';
import { FreezeController } from './Controller/freeze.controller';
import { HeaderMenuController } from './Controller/header-menu.controller';
import { HeaderMoveController } from './Controller/header-move.controller';
import { HeaderResizeController } from './Controller/header-resize.controller';
import { HeaderUnhideController } from './Controller/header-unhide.controller';
import { ScrollController } from './Controller/scroll.controller';
import { SelectionController } from './Controller/Selection.controller';
import { SheetRenderController } from './Controller/sheet-render.controller';
import { ZoomController } from './Controller/zoom.controller';
import { en } from './Locale';
import { BorderStyleManagerService } from './services/border-style-manager.service';
import { ScrollManagerService } from './services/scroll-manager.service';
import { SelectionManagerService } from './services/selection/selection-manager.service';
import { ISelectionRenderService, SelectionRenderService } from './services/selection/selection-render.service';
import { SheetSkeletonManagerService } from './services/sheet-skeleton-manager.service';
import { SheetCanvasView } from './View/sheet-canvas-view';

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
        this._initializeCommands();
    }

    override onRendered(): void {
        this._localeService.getLocale().load({
            en,
        });
    }

    private _initializeDependencies(sheetInjector: Injector) {
        const dependencies: Dependency[] = [
            //views
            [SheetCanvasView],

            // services
            [BorderStyleManagerService],
            [SheetSkeletonManagerService],
            [
                ISelectionRenderService,
                {
                    useClass: SelectionRenderService,
                },
            ],
            [ScrollManagerService],
            [SelectionManagerService],

            // controllers
            [FormulaBarController],
            [BasicWorksheetController],
            [SelectionController],
            [SheetRenderController],
            [HeaderUnhideController],
            [HeaderMenuController],
            [HeaderResizeController],
            [HeaderMoveController],
            [FreezeController],
            [ScrollController],
            [ZoomController],
            [AutoHeightController],
        ];

        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
    }

    private _initializeCommands(): void {
        this._commandService.registerCommand(SetSelectionsOperation);
        this._commandService.registerCommand(SetCopySelectionsOperation);
        this._commandService.registerCommand(SetScrollOperation);
        this._commandService.registerCommand(SetZoomRatioOperation);
    }
}
