import { ISelectionTransformerShapeManager, SelectionTransformerShapeManager } from '@univerjs/base-render';
import {
    DEFAULT_SELECTION,
    ICommandService,
    ICurrentUniverService,
    LocaleService,
    Plugin,
    PLUGIN_NAMES,
    PluginType,
} from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { DEFAULT_SPREADSHEET_PLUGIN_DATA, ISheetPluginConfig } from './Basics';
import { SheetPluginObserve, uninstall } from './Basics/Observer';
import { SetSelectionsOperation } from './commands/operations/selection.operation';
import { BasicWorkbookController, CountBarController, SheetContainerController } from './Controller';
import { BasicWorksheetController } from './Controller/BasicWorksheet.controller';
import { FormulaBarController } from './Controller/FormulaBarController';
import { SelectionController } from './Controller/Selection.controller';
import { ToggleWorksheetController } from './Controller/ToggleWorksheet.controller';
import { en } from './Locale';
import { BorderStyleManagerService } from './services/border-style-manager.service';
import { SelectionManagerService } from './services/selection-manager.service';
import { SheetSkeletonManagerService } from './services/sheet-skeleton-manager.service';
import { CanvasView } from './View/CanvasView';

/**
 * The main sheet base, construct the sheet container and layout, mount the rendering engine
 */
export class SheetPlugin extends Plugin<SheetPluginObserve> {
    static override type = PluginType.Sheet;

    private _config: ISheetPluginConfig;

    // private _formulaBarController: Nullable<FormulaBarController>;

    // private _countBarController: Nullable<CountBarController>;

    // private _sheetContainerController: Nullable<SheetContainerController>;

    constructor(
        config: Partial<ISheetPluginConfig>,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super(PLUGIN_NAMES.SPREADSHEET);

        this._config = Object.assign(DEFAULT_SPREADSHEET_PLUGIN_DATA, config);

        this._initializeDependencies(_injector);
        this._initializeCommands();
    }

    initialize(): void {
        this._localeService.getLocale().load({
            en,
        });

        // install(this);

        this.initConfig();
        this.initController();
        // this.listenEventManager();
    }

    getConfig() {
        return this._config;
    }

    initConfig() {
        const config = this._config;
        if (!config.selections) {
            const worksheetId = this._currentUniverService
                .getCurrentUniverSheetInstance()
                .getWorkBook()
                .getActiveSheet()
                .getSheetId();
            config.selections = {
                [worksheetId]: [
                    {
                        selection: DEFAULT_SELECTION,
                    },
                ],
            };
        }
    }

    initController() {
        this._injector.get(CanvasView);

        this._injector.get(SheetContainerController);
        this._injector.get(FormulaBarController);
        this._injector.get(CountBarController);

        this._injector.get(BasicWorksheetController);
        this._injector.get(BasicWorkbookController);

        this._injector.get(SelectionController);

        this._injector.get(ToggleWorksheetController);
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

            // controllers
            [SheetContainerController],
            [FormulaBarController],
            [CountBarController],
            [BasicWorksheetController],
            [BasicWorkbookController],
            [SelectionController],
            [ToggleWorksheetController],
        ];

        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
    }

    private _initializeCommands(): void {
        this._commandService.registerCommand(SetSelectionsOperation);
    }
}
