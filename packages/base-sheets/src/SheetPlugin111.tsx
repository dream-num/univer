import { getRefElement, isElement, ISlotProps, RefObject, render } from '@univer/base-ui';
import { Engine, RenderEngine } from '@univer/base-render';
import {
    AsyncFunction,
    SheetContext,
    IWorkbookConfig,
    Plugin,
    PLUGIN_NAMES,
    Tools,
    CommandManager,
    IActionObserverProps,
    SheetActionBase,
    ACTION_NAMES,
    ISetNamedRangeActionData,
} from '@univer/core';

import { install, SheetPluginObserve, uninstall } from './Basics/Observer';
import { RightMenuProps } from './Model/RightMenuModel';
import { en, zh } from './Locale';
import { CANVAS_VIEW_KEY } from './View/Render/BaseView';
import { CanvasView } from './View/Render/CanvasView';
import { SheetContainer } from './View/UI/SheetContainer';
import {
    RightMenuController,
    InfoBarController,
    SheetBarControl,
    CellEditorController,
    AntLineControl,
    CountBarController,
    SheetContainerController,
    ToolbarController,
    BaseSheetContainerConfig,
} from './Controller';
import { IToolbarItemProps } from './Model/ToolbarModel';
import { ModalGroupController } from './Controller/ModalGroupController';
import { ISheetPluginConfig, DEFAULT_SPREADSHEET_PLUGIN_DATA } from './Basics';
import { FormulaBarController } from './Controller/FormulaBarController';
import { NamedRangeActionExtensionFactory } from './Basics/Register/NamedRangeActionExtension';

/**
 * The main sheet base, construct the sheet container and layout, mount the rendering engine
 */

export class SheetPlugin extends Plugin<SheetPluginObserve, SheetContext> {
    private _config: ISheetPluginConfig;

    private _toolbarRef: RefObject<HTMLElement>;

    private _splitLeftRef: RefObject<HTMLDivElement>;

    private _contentRef: RefObject<HTMLDivElement>;

    private _addButtonFunc: Function;

    private _addSiderFunc: AsyncFunction<ISlotProps>;

    private _addMainFunc: Function;

    private _showSiderByNameFunc: Function;

    private _showMainByNameFunc: Function;

    private _canvasEngine: Engine;

    private _canvasView: CanvasView;

    private _viewSheetMap: Map<string, string>;

    private _rightMenuControl: RightMenuController;

    private _toolbarControl: ToolbarController;

    private _infoBarControl: InfoBarController;

    private _formulaBarController: FormulaBarController;

    private _sheetBarControl: SheetBarControl;

    private _cellEditorController: CellEditorController;

    private _antLineController: AntLineControl;

    private _countBarController: CountBarController;

    private _sheetContainerController: SheetContainerController;

    private _modalGroupController: ModalGroupController;

    private _componentList: Map<string, any>;

    private _namedRangeActionExtensionFactory: NamedRangeActionExtensionFactory;

    constructor(config: Partial<ISheetPluginConfig> = {}) {
        super(PLUGIN_NAMES.SPREADSHEET);

        this._config = Tools.deepMerge({}, DEFAULT_SPREADSHEET_PLUGIN_DATA, config);
    }

    register(engineInstance: Engine) {
        // The preact ref component cannot determine whether ref.current or ref.current.base is DOM
        let container: HTMLElement = getRefElement(this._sheetContainerController.getContentRef());

        this._canvasEngine = engineInstance;

        engineInstance.setContainer(container);
        window.addEventListener('resize', () => {
            engineInstance.resize();
        });

        // should be clear
        setTimeout(() => {
            engineInstance.resize();
        }, 0);

        // window.onresize = () => {
        //     engineInstance.resize();
        // };
    }

    initialize(context: SheetContext): void {
        this.context = context;

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en,
            zh,
        });

        const configure: IWorkbookConfig = context.getWorkBook().getConfig();

        const sheetContainer = this._initContainer(this._config.container);

        const config: BaseSheetContainerConfig = {
            skin: configure.skin || 'default',
            layout: this._config.layout,
            container: sheetContainer,
            onDidMount: () => {},
            context,
        };

        this._componentList = new Map();

        const sheetContainerConfig = this._config.layout?.sheetContainerConfig;
        const rightMenuConfig = this._config.layout?.rightMenuConfig;
        const toolbarConfig = this._config.layout?.toolbarConfig;

        this._modalGroupController = new ModalGroupController(this);
        this._sheetContainerController = new SheetContainerController(this, config);

        // TODO rightMenu config
        if (sheetContainerConfig?.rightMenu) {
            this._rightMenuControl = new RightMenuController(this, rightMenuConfig);
        }

        if (sheetContainerConfig?.toolbar) {
            this._toolbarControl = new ToolbarController(this, toolbarConfig);
        }
        if (sheetContainerConfig?.infoBar) {
            this._infoBarControl = new InfoBarController(this);
        }
        if (sheetContainerConfig?.sheetBar) {
            this._sheetBarControl = new SheetBarControl(this);
        }
        this._cellEditorController = new CellEditorController(this);
        this._antLineController = new AntLineControl(this);

        if (sheetContainerConfig?.countBar) {
            this._countBarController = new CountBarController(this);
        }
        if (sheetContainerConfig?.formulaBar) {
            this._formulaBarController = new FormulaBarController(this);
        }

        this.getObserver('onSheetContainerDidMountObservable')?.add(() => {
            this._initializeRender(context);
        });

        // render sheet container
        render(
            <SheetContainer changeLocale={this._sheetContainerController.changeLocale} changeSkin={this._sheetContainerController.changeSkin} config={config} />,
            sheetContainer
        );

        // const formulaEngine = this.getPluginByName<FormulaPlugin>('formula')?.getFormulaEngine();
        // =(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10)+count(B1:C10,10*5-100))*5-100
        // =(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10, lambda(x,y, x*y*x)(sum(1,(1+2)*3),2))+lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+count(B1:C10,10*5-100))*5-100
        // =((1+2)-A1:B2 + 5)/2 + sum(indirect("A5"):B10 + A1:offset("C5", 1, 1), 100)
        // =1+(3*4=4)*5+1
        // =(-(1+2)--@A1:B2 + 5)/2 + -sum(indirect("A5"):B10# + B6# + A1:offset("C5", 1, 1)  ,  100) + {1,2,3;4,5,6;7,8,10} + lambda(x,y,z, x*y*z)(sum(1,(1+2)*3),2,lambda(x,y, @offset(A1:B0,x#*y#))(1,2):C20) & "美国人才" + sum((1+2%)*30%, 1+2)%
        // formulaEngine?.calculate(`=lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+1-max(100,200)`);

        this.registerExtension();
    }

    /**
     * Convert id to DOM
     * @param container
     * @returns
     */
    private _initContainer(container: HTMLElement | string) {
        let sheetContainer = null;
        if (typeof container === 'string') {
            const containerDOM = document.getElementById(container);
            if (containerDOM == null) {
                sheetContainer = document.createElement('div');
                sheetContainer.id = container;
            } else {
                sheetContainer = containerDOM;
            }
        } else if (isElement(container)) {
            sheetContainer = container;
        } else {
            sheetContainer = document.createElement('div');
            sheetContainer.id = 'universheet';
        }

        return sheetContainer;
    }

    onMounted(ctx: SheetContext): void {
        install(this);

        this.initialize(ctx);

        CommandManager.getActionObservers().add((actionObs: IActionObserverProps): void => {
            const currentUnitId = this.getContext().getWorkBook().getUnitId();
            const action = actionObs.action as SheetActionBase<ISetNamedRangeActionData, ISetNamedRangeActionData>;
            const actionData = action.getDoActionData();
            const actionUnitId = action.getWorkBook().getUnitId();

            if (currentUnitId !== actionUnitId) return;

            if (actionData.actionName === ACTION_NAMES.SET_NAMED_RANGE_ACTION) {
                const namedRange = actionData.namedRange;
            }
        });
    }

    get config() {
        return this._config;
    }

    private _initializeRender(context: SheetContext) {
        const engine = this.getPluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER)?.getEngine()!;

        this.register(engine);

        if (this._canvasView == null) {
            this._canvasView = new CanvasView(engine, this);
        }

        this.context.getContextObserver('onSheetRenderDidMountObservable')?.notifyObservers();
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

    addButton(item: IToolbarItemProps): void {
        this._addButtonFunc(item);
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
