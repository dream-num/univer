import { ISelectionTransformerShapeManager, SelectionTransformerShapeManager } from '@univerjs/base-render';
import { DEFAULT_SELECTION, ICommandService, ICurrentUniverService, LocaleService, Plugin, PLUGIN_NAMES, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { DEFAULT_SPREADSHEET_PLUGIN_DATA, install, ISheetPluginConfig } from './Basics';
import { SheetPluginObserve, uninstall } from './Basics/Observer';
import { SetSelectionsOperation } from './Commands/Operations/selection.operation';
import { BasicWorkbookController, CountBarController, SheetBarController, SheetContainerController } from './Controller';
import { BasicWorksheetController } from './Controller/BasicWorksheet.controller';
import { FormulaBarController } from './Controller/FormulaBarController';
import { en, zh } from './Locale';
import { BorderStyleManagerService } from './Services/border-style-manager.service';
import { SelectionManagerService } from './Services/selection-manager.service';
import { CanvasView } from './View/CanvasView';

/**
 * The main sheet base, construct the sheet container and layout, mount the rendering engine
 */
export class SheetPlugin extends Plugin<SheetPluginObserve> {
    static override type = PluginType.Sheet;

    private _config: ISheetPluginConfig;

    private _formulaBarController: FormulaBarController;

    private _sheetBarController: SheetBarController;

    private _countBarController: CountBarController;

    private _sheetContainerController: SheetContainerController;

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
            zh,
        });

        install(this);

        this.initConfig();
        this.initController();
        this.listenEventManager();
    }

    getConfig() {
        return this._config;
    }

    initConfig() {
        const config = this._config;
        if (!config.selections) {
            const worksheetId = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
            config.selections = {
                [worksheetId]: [
                    {
                        selection: DEFAULT_SELECTION,
                    },
                ],
            };
        }
    }

    // TODO@huwenzhao: We don't need to init controllers manually
    initController() {
        this._sheetContainerController = this._injector.get(SheetContainerController);
        this._formulaBarController = this._injector.get(FormulaBarController);
        this._sheetBarController = this._injector.get(SheetBarController);
        this._countBarController = this._injector.get(CountBarController);

        this._injector.get(BasicWorksheetController);
        this._injector.get(BasicWorkbookController);
    }

    override onMounted(): void {
        this.initialize();
    }

    override onDestroy(): void {
        super.onDestroy();

        uninstall(this);
    }

    listenEventManager() {
        // TODO: move these init to controllers not here
        this._countBarController.listenEventManager();
        this._sheetBarController.listenEventManager();
    }

    private _initializeDependencies(sheetInjector: Injector) {
        const dependencies: Dependency[] = [
            [CanvasView],

            [SheetContainerController],
            [FormulaBarController],
            [SheetBarController],
            [CountBarController],

            [BasicWorksheetController],
            [BasicWorkbookController],

            [BorderStyleManagerService],

            [SelectionManagerService],

            [
                ISelectionTransformerShapeManager,
                {
                    useClass: SelectionTransformerShapeManager,
                },
            ],
        ];

        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
    }

    private _initializeCommands(): void {
        this._commandService.registerCommand(SetSelectionsOperation);
    }
}
