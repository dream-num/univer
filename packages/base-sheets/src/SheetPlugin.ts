import { Engine, RenderEngine } from '@univerjs/base-render';
import { SheetContext, Plugin, PLUGIN_NAMES, DEFAULT_SELECTION } from '@univerjs/core';

import { SheetPluginObserve, uninstall } from './Basics/Observer';
import { CANVAS_VIEW_KEY } from './View/Render/BaseView';
import { CanvasView } from './View/Render/CanvasView';
import { RightMenuController, SheetBarControl, CellEditorController, SheetContainerController, ToolbarController, CountBarController } from './Controller';
import { DEFAULT_SPREADSHEET_PLUGIN_DATA, install, ISheetPluginConfig } from './Basics';
import { FormulaBarController } from './Controller/FormulaBarController';
import { NamedRangeActionExtensionFactory } from './Basics/Register/NamedRangeActionExtension';
import { en, zh } from './Locale';

/**
 * The main sheet base, construct the sheet container and layout, mount the rendering engine
 */

export class SheetPlugin extends Plugin<SheetPluginObserve, SheetContext> {
    private _config: ISheetPluginConfig;

    private _canvasEngine: Engine;

    private _canvasView: CanvasView;

    private _rightMenuControl: RightMenuController;

    private _toolbarControl: ToolbarController;

    private _formulaBarController: FormulaBarController;

    private _sheetBarControl: SheetBarControl;

    private _cellEditorController: CellEditorController;

    private _countBarController: CountBarController;

    private _sheetContainerController: SheetContainerController;

    private _namedRangeActionExtensionFactory: NamedRangeActionExtensionFactory;

    constructor(config?: Partial<ISheetPluginConfig>) {
        super(PLUGIN_NAMES.SPREADSHEET);
        this._config = Object.assign(DEFAULT_SPREADSHEET_PLUGIN_DATA, config);
    }

    initialize(context: SheetContext): void {
        this.context = context;

        this.getGlobalContext().getLocale().load({
            en,
            zh,
        });
        install(this);
        this.initConfig();
        this.initController();
        this.initCanvasView();
        this.registerExtension();
    }

    getConfig() {
        return this._config;
    }

    initConfig() {
        const config = this._config;
        if (!config.selections) {
            const worksheetId = this.getContext().getWorkBook().getActiveSheet().getSheetId();
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
        this._sheetContainerController = new SheetContainerController(this);
        this._cellEditorController = new CellEditorController(this);
        this._formulaBarController = new FormulaBarController(this);
        this._sheetBarControl = new SheetBarControl(this);
        this._toolbarControl = new ToolbarController(this);
        this._rightMenuControl = new RightMenuController(this);
        this._countBarController = new CountBarController(this);
    }

    initCanvasView() {
        const engine = this.getGlobalContext().getPluginManager().getRequirePluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER).getEngine();

        this._canvasEngine = engine;

        if (this._canvasView == null) {
            this._canvasView = new CanvasView(engine, this);
        }
    }

    onMounted(ctx: SheetContext): void {
        this.initialize(ctx);
    }

    onDestroy(): void {
        super.onDestroy();
        uninstall(this);

        const actionRegister = this.context.getCommandManager().getActionExtensionManager().getRegister();
        actionRegister.delete(this._namedRangeActionExtensionFactory);
    }

    registerExtension() {
        const actionRegister = this.context.getCommandManager().getActionExtensionManager().getRegister();
        this._namedRangeActionExtensionFactory = new NamedRangeActionExtensionFactory(this);
        actionRegister.add(this._namedRangeActionExtensionFactory);
    }

    listenEventManager() {
        // TODO: move to toolbarcontroller
        this._countBarController.listenEventManager();
        this._sheetBarControl.listenEventManager();
        this._toolbarControl.listenEventManager();
        this._rightMenuControl.listenEventManager();
    }

    getCanvasEngine() {
        return this._canvasEngine;
    }

    getCanvasView() {
        return this._canvasView;
    }

    getMainScene() {
        return this._canvasEngine.getScene(CANVAS_VIEW_KEY.MAIN_SCENE);
    }

    getSheetView() {
        return this.getCanvasView().getSheetView();
    }

    getSelectionManager() {
        return this.getSheetView()?.getSelectionManager();
    }

    getCurrentControls() {
        return this.getSelectionManager()?.getCurrentControls();
    }

    getSelectionShape() {
        return this._canvasEngine;
    }

    getMainComponent() {
        return this.getSheetView().getSpreadsheet();
    }

    getLeftTopComponent() {
        return this.getSheetView().getSpreadsheetLeftTopPlaceholder();
    }

    getRowComponent() {
        return this.getSheetView().getSpreadsheetRowTitle();
    }

    getColumnComponent() {
        return this.getSheetView().getSpreadsheetColumnTitle();
    }

    getSpreadsheetSkeleton() {
        return this.getSheetView().getSpreadsheetSkeleton();
    }

    getWorkbook() {
        return this.context.getWorkBook();
    }

    getRightMenuControl() {
        return this._rightMenuControl;
    }

    getToolbarControl() {
        return this._toolbarControl;
    }

    getSheetBarControl() {
        return this._sheetBarControl;
    }

    getCellEditorController() {
        return this._cellEditorController;
    }

    getFormulaBarController() {
        return this._formulaBarController;
    }

    getSheetContainerControl() {
        return this._sheetContainerController;
    }

    getCountBarController() {
        return this._countBarController;
    }
}
