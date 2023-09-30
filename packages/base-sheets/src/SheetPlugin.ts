import { ISelectionTransformerShapeManager, SelectionTransformerShapeManager } from '@univerjs/base-render';
import { ICommandService, LocaleService, Plugin, PLUGIN_NAMES, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { SheetPluginObserve, uninstall } from './Basics/Observer';
import { SetSelectionsOperation } from './commands/operations/selection.operation';
import { BasicWorkbookController, CountBarController } from './Controller';
import { BasicWorksheetController } from './Controller/BasicWorksheet.controller';
import { FormulaBarController } from './Controller/FormulaBarController';
import { FreezeController } from './Controller/freeze.controller';
import { HeaderMenuController } from './Controller/header-menu.controller';
import { HeaderMoveController } from './Controller/header-move.controller';
import { HeaderResizeController } from './Controller/header-resize.controller';
import { ScrollController } from './Controller/scroll.controller';
import { SelectionController } from './Controller/Selection.controller';
import { SheetRenderController } from './Controller/sheet-render.controller';
import { en } from './Locale';
import { BorderStyleManagerService } from './services/border-style-manager.service';
import { ScrollManagerService } from './services/scroll-manager.service';
import { SelectionManagerService } from './services/selection-manager.service';
import { SheetSkeletonManagerService } from './services/sheet-skeleton-manager.service';
import { CanvasView } from './View/CanvasView';

/**
 * The main sheet base, construct the sheet container and layout, mount the rendering engine
 */
export class SheetPlugin extends Plugin<SheetPluginObserve> {
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

    initialize(): void {
        this._localeService.getLocale().load({
            en,
        });

        this.initController();
    }

    initController() {
        this._injector.get(CanvasView);

        this._injector.get(FormulaBarController);
        this._injector.get(CountBarController);

        this._injector.get(BasicWorksheetController);
        this._injector.get(BasicWorkbookController);

        this._injector.get(SelectionController);

        this._injector.get(SheetRenderController);

        this._injector.get(HeaderMenuController);

        this._injector.get(HeaderResizeController);

        this._injector.get(HeaderMoveController);

        this._injector.get(ScrollController);

        this._injector.get(FreezeController);
    }

    override onStarting(): void {}

    override onRendered(): void {
        this.initialize();
    }

    override onDestroy(): void {
        super.onDestroy();

        uninstall(this);
    }

    // listenEventManager() {
    //     // TODO: move these init to controllers not here
    //     this._countBarController?.listenEventManager();
    // }

    private _initializeDependencies(sheetInjector: Injector) {
        const dependencies: Dependency[] = [
            //views
            [CanvasView],

            // services
            [BorderStyleManagerService],
            [SheetSkeletonManagerService],
            [SelectionManagerService],
            [
                ISelectionTransformerShapeManager,
                {
                    useClass: SelectionTransformerShapeManager,
                },
            ],
            [ScrollManagerService],

            // controllers
            [FormulaBarController],
            [CountBarController],
            [BasicWorksheetController],
            [BasicWorkbookController],
            [SelectionController],
            [SheetRenderController],
            [HeaderMenuController],
            [HeaderResizeController],
            [HeaderMoveController],
            [FreezeController],
            [ScrollController],
        ];

        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
    }

    private _initializeCommands(): void {
        this._commandService.registerCommand(SetSelectionsOperation);
    }
}
