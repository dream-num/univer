import { Engine, RenderEngine } from '@univerjs/base-render';
import { SheetContext, Plugin, PLUGIN_NAMES, UIObserver } from '@univerjs/core';

import { SheetPluginObserve, uninstall } from './Basics/Observer';
import { RightMenuProps } from './Model/RightMenuModel';
import { en, zh } from './Locale';
import { CANVAS_VIEW_KEY } from './View/Render/BaseView';
import { CanvasView } from './View/Render/CanvasView';
import { RightMenuController, InfoBarController, SheetBarControl, CellEditorController, SheetContainerController, ToolbarController } from './Controller';
import { IToolbarItemProps } from './Model/ToolbarModel';
import { ModalGroupController } from './Controller/ModalGroupController';
import { install, ISheetPluginConfig } from './Basics';
import { FormulaBarController } from './Controller/FormulaBarController';
import { NamedRangeActionExtensionFactory } from './Basics/Register/NamedRangeActionExtension';

/**
 * The main sheet base, construct the sheet container and layout, mount the rendering engine
 */

export class SheetPlugin extends Plugin<SheetPluginObserve, SheetContext> {
    private _config: ISheetPluginConfig;

    private _canvasEngine: Engine;

    private _canvasView: CanvasView;

    private _rightMenuControl: RightMenuController;

    private _toolbarControl: ToolbarController;

    private _infoBarControl: InfoBarController;

    private _formulaBarController: FormulaBarController;

    private _sheetBarControl: SheetBarControl;

    private _cellEditorController: CellEditorController;

    private _sheetContainerController: SheetContainerController;

    private _modalGroupController: ModalGroupController;

    private _componentList: Map<string, any>;

    private _namedRangeActionExtensionFactory: NamedRangeActionExtensionFactory;

    // private _component: BaseComponentPlugin;

    constructor(config: any) {
        super(PLUGIN_NAMES.SPREADSHEET);
        // this._component = component;

        this._config = config;
    }

    initialize(context: SheetContext): void {
        this.context = context;

        install(this);

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en,
            zh,
        });

        this.initController();
        this.initCanvasView();

        this.registerExtension();
    }

    get config() {
        return this._config;
    }

    initController() {
        this._sheetContainerController = new SheetContainerController(this);
        this._cellEditorController = new CellEditorController(this);
        this._formulaBarController = new FormulaBarController(this);
        this._sheetBarControl = new SheetBarControl(this);
    }

    initCanvasView() {
        const engine = this.getContext().getUniver().getGlobalContext().getPluginManager().getPluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER)?.getEngine()!;

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
        this._sheetBarControl.listenEventManager();
        this.getContext()
            .getUniver()
            .getGlobalContext()
            .getObserverManager()
            .requiredObserver<UIObserver<boolean>>('onUIChangeObservable', 'core')
            .add((msg) => {
                console.log('get click event mas:', msg);
            });
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

    getInfoBarControl() {
        return this._infoBarControl;
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

    getModalGroupControl() {
        return this._modalGroupController;
    }

    getSheetContainerControl() {
        return this._sheetContainerController;
    }

    addRightMenu(item: RightMenuProps[] | RightMenuProps) {
        this._rightMenuControl && this._rightMenuControl.addItem(item);
    }

    addToolButton(config: IToolbarItemProps) {
        this._toolbarControl && this._toolbarControl.addToolButton(config);
    }

    registerComponent(name: string, component: any, props?: any) {
        this._componentList.set(name, component);
    }

    getRegisterComponent(name: string) {
        return this._componentList.get(name);
    }

    registerModal(name: string, component: any) {
        this._modalGroupController.addModal(name, component);
    }
}
