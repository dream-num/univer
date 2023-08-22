import { Engine, IRenderingEngine } from '@univerjs/base-render';
import { Plugin, PLUGIN_NAMES, DEFAULT_SELECTION, PluginType, CommandManager, ICurrentUniverService, LocaleService } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { SheetPluginObserve, uninstall } from './Basics/Observer';
import { CanvasView } from './View/CanvasView';
import {
    RightMenuController,
    SheetBarController,
    CellEditorController,
    SheetContainerController,
    ToolbarController,
    CountBarController,
    EditTooltipsController,
    SelectionManager,
    HideColumnController,
} from './Controller';
import { DEFAULT_SPREADSHEET_PLUGIN_DATA, install, ISheetPluginConfig } from './Basics';
import { FormulaBarController } from './Controller/FormulaBarController';
import { NamedRangeActionExtensionFactory } from './Basics/Register/NamedRangeActionExtension';
import { en, zh } from './Locale';
import { ISelectionManager } from './Services/tokens';
import { DragLineController } from './Controller/Selection/DragLineController';
import { ColumnTitleController } from './Controller/Selection/ColumnTitleController';
import { RowTitleController } from './Controller/Selection/RowTitleController';
import { ColumnRulerManager } from './Basics/Register/ColumnRegister';
import { HideColumnRulerFactory } from './Basics/Register/HideColumnRuler';

/**
 * The main sheet base, construct the sheet container and layout, mount the rendering engine
 */
export class SheetPlugin extends Plugin<SheetPluginObserve> {
    static override type = PluginType.Sheet;

    private _config: ISheetPluginConfig;

    private _canvasEngine: Engine;

    // TODO: @wzhudev these controllers should be removed finally after we completely refactored base-sheet plugin

    private _rightMenuController: RightMenuController;

    private _toolbarController: ToolbarController;

    private _editTooltipsController: EditTooltipsController;

    private _formulaBarController: FormulaBarController;

    private _sheetBarController: SheetBarController;

    private _cellEditorController: CellEditorController;

    private _countBarController: CountBarController;

    private _hideColumnController: HideColumnController;

    private _sheetContainerController: SheetContainerController;

    private _namedRangeActionExtensionFactory: NamedRangeActionExtensionFactory;

    private _columnRulerManager: ColumnRulerManager;

    private _hideColumnRulerFactory: HideColumnRulerFactory;

    constructor(
        config: Partial<ISheetPluginConfig>,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(CommandManager) private readonly _commandManager: CommandManager
    ) {
        super(PLUGIN_NAMES.SPREADSHEET);

        this._config = Object.assign(DEFAULT_SPREADSHEET_PLUGIN_DATA, config);

        this._initializeDependencies(_injector);
    }

    initialize(): void {
        this._localeService.getLocale().load({
            en,
            zh,
        });

        install(this);

        this.initConfig();
        this.initController();
        this.initCanvasView();
        this.registerExtension();
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
        this._cellEditorController = this._injector.get(CellEditorController);
        this._formulaBarController = this._injector.get(FormulaBarController);
        this._editTooltipsController = this._injector.get(EditTooltipsController);
        this._sheetBarController = this._injector.get(SheetBarController);
        this._toolbarController = this._injector.get(ToolbarController);
        this._rightMenuController = this._injector.get(RightMenuController);
        this._countBarController = this._injector.get(CountBarController);
        this._hideColumnController = this._injector.get(HideColumnController);
    }

    initCanvasView() {
        this._canvasEngine = this._injector.get(IRenderingEngine);
    }

    override onMounted(): void {
        this.initialize();
    }

    override onDestroy(): void {
        super.onDestroy();

        uninstall(this);

        const actionRegister = this._commandManager.getActionExtensionManager().getRegister();
        actionRegister.delete(this._namedRangeActionExtensionFactory);

        const rulerRegister = this._columnRulerManager.getRegister();
        rulerRegister.delete(this._hideColumnRulerFactory);
    }

    registerExtension() {
        const actionRegister = this._commandManager.getActionExtensionManager().getRegister();
        this._namedRangeActionExtensionFactory = new NamedRangeActionExtensionFactory(this, this._injector);
        actionRegister.add(this._namedRangeActionExtensionFactory); // TODO: this should return a disposable function

        this._columnRulerManager = this._injector.get(ColumnRulerManager);
        const rulerRegister = this._columnRulerManager.getRegister();
        this._hideColumnRulerFactory = new HideColumnRulerFactory(this);
        rulerRegister.add(this._hideColumnRulerFactory);
    }

    listenEventManager() {
        // TODO: move these init to controllers not here
        this._countBarController.listenEventManager();
        this._sheetBarController.listenEventManager();
        this._toolbarController.listenEventManager();
        this._rightMenuController.listenEventManager();
    }

    /** @deprecated move to DI system */
    getSelectionManager() {
        return this._injector.get(ISelectionManager);
    }

    private _initializeDependencies(sheetInjector: Injector) {
        const dependencies: Dependency[] = [
            [CanvasView],

            [CellEditorController],
            [SheetContainerController],
            [FormulaBarController],
            [EditTooltipsController],
            [SheetBarController],
            [ToolbarController],
            [RightMenuController],
            [CountBarController],

            // TODO@huwenzhao: this is a temporary solution
            [
                ISelectionManager,
                {
                    useFactory: (injector: Injector, canvasView: CanvasView) => injector.createInstance(SelectionManager, canvasView.getSheetView(), this._config),
                    deps: [Injector, CanvasView],
                },
            ],
            [RowTitleController],
            [ColumnTitleController],
            [DragLineController],
            [HideColumnController],

            [ColumnRulerManager],
        ];

        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
    }
}
