import { getRefElement, IMainProps, isElement, ISlotProps, RefObject, render } from '@univer/base-component';
import { Engine, RenderEngine } from '@univer/base-render';
import { AsyncFunction, SheetContext, IWorkbookConfig, Plugin, PLUGIN_NAMES, Tools } from '@univer/core';

import { install, SheetPluginObserve, uninstall } from './Basics/Observer';
import { RightMenuProps } from './Model/RightMenuModel';
import { en, zh } from './Locale';
import { CANVAS_VIEW_KEY } from './View/Render/BaseView';
import { CanvasView } from './View/Render/CanvasView';
import { BaseSheetContainerConfig, ILayout, SheetContainer } from './View/UI/SheetContainer';
import {
    RightMenuController,
    InfoBarController,
    SheetBarControl,
    CellEditorController,
    AntLineControl,
    CountBarController,
    SheetContainerController,
    ToolBarController,
} from './Controller';
import { IToolBarItemProps } from './Model/ToolBarModel';
import { ModalGroupController } from './Controller/ModalGroupController';
import { ISheetPluginConfig, DEFAULT_SPREADSHEET_PLUGIN_DATA } from './Basics';
import { FormulaBarController } from './Controller/FormulaBarController';

/**
 * The main sheet base, construct the sheet container and layout, mount the rendering engine
 */
interface ComponentChildrenProps {
    component: any;
    props?: any;
}

export class SheetPlugin extends Plugin<SheetPluginObserve, SheetContext> {
    private _config: ISheetPluginConfig;

    private _toolBarRef: RefObject<HTMLElement>;

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

    private _toolBarControl: ToolBarController;

    private _infoBarControl: InfoBarController;

    private _formulaBarController: FormulaBarController;

    private _sheetBarControl: SheetBarControl;

    private _cellEditorControl: CellEditorController;

    private _antLineController: AntLineControl;

    private _countBarController: CountBarController;

    private _sheetContainerController: SheetContainerController;

    private _modalGroupController: ModalGroupController;

    private _componentList: Map<string, any>;

    constructor(config: Partial<ISheetPluginConfig> = {}) {
        super(PLUGIN_NAMES.SPREADSHEET);

        this._config = Tools.deepMerge(DEFAULT_SPREADSHEET_PLUGIN_DATA, config);
    }

    register(engineInstance: Engine) {
        // The preact ref component cannot determine whether ref.current or ref.current.base is DOM
        let container: HTMLElement = getRefElement(this.getContentRef());

        this._canvasEngine = engineInstance;

        engineInstance.setContainer(container);
        window.onresize = () => {
            engineInstance.resize();
        };
    }

    initialize(context: SheetContext): void {
        this.context = context;

        this.getObserver('onSheetContainerDidMountObservable')?.add(() => {
            this._initializeRender(context);
        });

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
            context,
            getSplitLeftRef: (ref) => {
                this._splitLeftRef = ref;
            },
            getContentRef: (ref) => {
                this._contentRef = ref;
            },
            addButton: (cb: Function) => {
                this._addButtonFunc = cb;
            },
            addSider: (cb: AsyncFunction<ISlotProps>) => {
                this._addSiderFunc = cb;
            },
            addMain: (cb: Function) => {
                this._addMainFunc = cb;
            },
            showSiderByName: (cb: Function) => {
                this._showSiderByNameFunc = cb;
            },
            showMainByName: (cb: Function) => {
                this._showMainByNameFunc = cb;
            },
            onDidMount: () => {},
        };

        this._componentList = new Map();

        const layout = this._config.layout as ILayout;

        this._sheetContainerController = new SheetContainerController(this);
        this._modalGroupController = new ModalGroupController(this);

        // TODO rightMenu config
        this._rightMenuControl = new RightMenuController(this);

        if (layout === 'auto' || layout.toolBar) {
            this._toolBarControl = new ToolBarController(this);
        }
        if (layout === 'auto' || layout.infoBar) {
            this._infoBarControl = new InfoBarController(this);
        }
        if (layout === 'auto' || layout.sheetBar) {
            this._sheetBarControl = new SheetBarControl(this);
        }
        this._cellEditorControl = new CellEditorController(this);
        this._antLineController = new AntLineControl(this);

        if (layout === 'auto' || layout.countBar) {
            this._countBarController = new CountBarController(this);
        }
        if (layout === 'auto' || layout.formulaBar) {
            this._formulaBarController = new FormulaBarController(this);
        }

        // render sheet container
        render(<SheetContainer config={config} />, sheetContainer);

        // const formulaEngine = this.getPluginByName<FormulaPlugin>('formula')?.getFormulaEngine();
        // =(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10)+count(B1:C10,10*5-100))*5-100
        // =(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10, lambda(x,y, x*y*x)(sum(1,(1+2)*3),2))+lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+count(B1:C10,10*5-100))*5-100
        // =((1+2)-A1:B2 + 5)/2 + sum(indirect("A5"):B10 + A1:offset("C5", 1, 1), 100)
        // =1+(3*4=4)*5+1
        // =(-(1+2)--@A1:B2 + 5)/2 + -sum(indirect("A5"):B10# + B6# + A1:offset("C5", 1, 1)  ,  100) + {1,2,3;4,5,6;7,8,10} + lambda(x,y,z, x*y*z)(sum(1,(1+2)*3),2,lambda(x,y, @offset(A1:B0,x#*y#))(1,2):C20) & "美国人才" + sum((1+2%)*30%, 1+2)%
        // formulaEngine?.calculate(`=lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+1-max(100,200)`);
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

    /**
     * Initialize all selections
     */
    private _initSelection() {}

    onMounted(ctx: SheetContext): void {
        install(this);

        // this.initialize(ctx);

        // When executing setContainer, occasionally ContentRef has not been mounted, because the didmount mount of preact is asynchronous, so let's judge here, if there is no DOM, we will execute our mount through the hook of the completion of the mount Rendering logic.

        // if (!this.getContentRef().current) {
        // this.context
        //     .getObserverManager()
        //     .getObserver('onSheetContainerDidMountObservable', 'workbook')
        //     ?.add((e) => {
        //         this._initializeRender(ctx);
        //     });

        this.initialize(ctx);
        // return;
        // }

        // this._initializeRender(ctx);
    }

    get config() {
        return this._config;
    }

    private _initializeRender(context: SheetContext) {
        const engine = this.getPluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER)?.getEngine()!;

        this.register(engine);

        this._canvasView = new CanvasView(engine, this);

        this.context.getContextObserver('onSheetRenderDidMountObservable')?.notifyObservers();
    }

    onDestroy(): void {
        super.onDestroy();
        uninstall(this);
    }

    getSplitLeftRef(): RefObject<HTMLDivElement> {
        return this._splitLeftRef;
    }

    // getContentRef(): RefObject<HTMLDivElement | Component> {
    //     return this._contentRef;
    // }

    getContentRef(): RefObject<HTMLDivElement> {
        return this._contentRef;
    }

    addButton(item: IToolBarItemProps): void {
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

    getToolBarControl() {
        return this._toolBarControl;
    }

    getInfoBarControl() {
        return this._infoBarControl;
    }

    getSheetBarControl() {
        return this._sheetBarControl;
    }

    getCellEditorControl() {
        return this._cellEditorControl;
    }

    addSider(item: ISlotProps): Promise<void> {
        return this._addSiderFunc(item);
    }

    addMain(item: IMainProps): Promise<void> {
        return this._addMainFunc(item);
    }

    showSiderByName(name: string, show: boolean): Promise<void> {
        return this._showSiderByNameFunc(name, show);
        // TODO 是否可以直接 this.sheetContainer.showSiderByName();
    }

    showMainByName(name: string, show: boolean): Promise<void> {
        return this._showMainByNameFunc(name, show);
    }

    addRightMenu(item: RightMenuProps[] | RightMenuProps) {
        this._rightMenuControl.addItem(item);
    }

    addToolButton(config: IToolBarItemProps) {
        this._toolBarControl.addToolButton(config);
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
