import { ICommandService, LocaleService, Plugin, PLUGIN_NAMES, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { SetScrollOperation } from './commands/operations/scroll.operation';
import { SetCopySelectionsOperation, SetSelectionsOperation } from './commands/operations/selection.operation';
import { SetZoomRatioOperation } from './commands/operations/set-zoom-ratio.operation';
import { AutoHeightController } from './controllers/auto-height.controller';
import { BasicWorksheetController } from './controllers/basic-worksheet.controller';
import { FreezeController } from './controllers/freeze.controller';
import { HeaderMenuController } from './controllers/header-menu.controller';
import { HeaderMoveController } from './controllers/header-move.controller';
import { HeaderResizeController } from './controllers/header-resize.controller';
import { HeaderUnhideController } from './controllers/header-unhide.controller';
import { MergeCellController } from './controllers/merge-cell.controller';
import { MoveRangeController } from './controllers/move-range.controller';
import { ScrollController } from './controllers/scroll.controller';
import { SelectionController } from './controllers/selection.controller';
import { SheetRenderController } from './controllers/sheet-render.controller';
import { ZoomController } from './controllers/zoom.controller';
import { enUS } from './locale';
import { BorderStyleManagerService } from './services/border-style-manager.service';
import { RefRangeService } from './services/ref-range.service';
import { ScrollManagerService } from './services/scroll-manager.service';
import { SelectionManagerService } from './services/selection/selection-manager.service';
import { ISelectionRenderService, SelectionRenderService } from './services/selection/selection-render.service';
import { SheetSkeletonManagerService } from './services/sheet-skeleton-manager.service';
import { SheetCanvasView } from './views/sheet-canvas-view';

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
            enUS,
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
            [RefRangeService],

            // controllers
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
            [MoveRangeController],
            [MergeCellController],
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
