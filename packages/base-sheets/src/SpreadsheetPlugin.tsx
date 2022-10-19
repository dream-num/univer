import { getRefElement, IMainProps, isElement, ISlotProps, IToolBarItemProps, RefObject, render } from '@univer/base-component';
import { Engine, RenderEngine } from '@univer/base-render';
import { AsyncFunction, Attribute, Context, IOCAttribute, IOCContainer, IRangeCellData, IRangeData, IWorkbookConfig, Plugin, PLUGIN_NAMES, Tools } from '@univer/core';
import { FormulaPlugin } from '@univer/sheets-plugin-formula';

import { install, SpreadsheetPluginObserve, uninstall } from './Basics/Observer';
import { RightMenuProps } from './Model/RightMenuModel';
import { en, zh } from './Locale';
import { CANVAS_VIEW_KEY } from './View/Render/BaseView';
import { CanvasView } from './View/Render/CanvasView';
import { BaseSheetContainerConfig, ISpreadsheetPluginConfigBase, SheetContainer } from './View/UI/SheetContainer';
import {
    RightMenuController,
    ToolBarController,
    InfoBarController,
    SheetBarControl,
    CellEditorController,
    AntLineControl,
    CountBarController,
    SheetContainerController,
} from './Controller';

export interface ISelectionConfig {
    selection: IRangeData;
    cell?: IRangeCellData;
}

export interface ISelectionsConfig {
    [worksheetId: string]: ISelectionConfig[];
}

export interface ISpreadsheetPluginConfig extends ISpreadsheetPluginConfigBase {
    container: HTMLElement | string;
    selections: ISelectionsConfig;
}

const DEFAULT_SPREADSHEET_PLUGIN_DATA: ISpreadsheetPluginConfig = {
    container: 'universheet',
    layout: 'auto',
    selections: {
        'sheet-01': [
            {
                selection: {
                    startRow: 13,
                    endRow: 14,
                    startColumn: 1,
                    endColumn: 2,
                },
                cell: {
                    row: 13,
                    column: 1,
                },
            },
        ],
        'sheet-02': [
            {
                selection: {
                    startRow: 17,
                    endRow: 19,
                    startColumn: 1,
                    endColumn: 2,
                },
                cell: {
                    row: 17,
                    column: 1,
                },
            },
        ],
    },
};

/**
 * The main sheet base, construct the sheet container and layout, mount the rendering engine
 */
export class SpreadsheetPlugin extends Plugin<SpreadsheetPluginObserve> {
    @Attribute()
    private pros: IOCAttribute;

    private _config: ISpreadsheetPluginConfig;

    context: Context;

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

    private _sheetBarControl: SheetBarControl;

    private _cellEditorControl: CellEditorController;

    private _antLineController: AntLineControl;

    private _countBarController: CountBarController;

    private _sheetContainerController: SheetContainerController;

    constructor(props: Partial<ISpreadsheetPluginConfig> = {}) {
        super(PLUGIN_NAMES.SPREADSHEET);

        this._config = Tools.commonExtend(DEFAULT_SPREADSHEET_PLUGIN_DATA, props);
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

    initialize(context: Context): void {
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

        const configure: IWorkbookConfig = this.pros.getValue();

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

        this._rightMenuControl = new RightMenuController(this);
        this._toolBarControl = new ToolBarController(this);
        this._infoBarControl = new InfoBarController(this);
        this._sheetBarControl = new SheetBarControl(this);
        this._cellEditorControl = new CellEditorController(this);
        this._antLineController = new AntLineControl(this);
        this._countBarController = new CountBarController(this);
        this._sheetContainerController = new SheetContainerController(this);

        // render sheet container
        render(<SheetContainer config={config} />, sheetContainer);

        const formulaEngine = this.getPluginByName<FormulaPlugin>('formula')?.getFormulaEngine();
        // =(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10)+count(B1:C10,10*5-100))*5-100
        // =(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10, lambda(x,y, x*y*x)(sum(1,(1+2)*3),2))+lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+count(B1:C10,10*5-100))*5-100
        // =((1+2)-A1:B2 + 5)/2 + sum(indirect("A5"):B10 + A1:offset("C5", 1, 1), 100)
        // =1+(3*4=4)*5+1
        // =(-(1+2)--@A1:B2 + 5)/2 + -sum(indirect("A5"):B10# + B6# + A1:offset("C5", 1, 1)  ,  100) + {1,2,3;4,5,6;7,8,10} + lambda(x,y,z, x*y*z)(sum(1,(1+2)*3),2,lambda(x,y, @offset(A1:B0,x#*y#))(1,2):C20) & "美国人才" + sum((1+2%)*30%, 1+2)%
        formulaEngine?.calculate(`=lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+1-max(100,200)`);
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

    onMounted(ctx: Context): void {
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

    private _initializeRender(context: Context) {
        const engine = this.getPluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER)?.getEngine()!;

        this.register(engine);

        this._canvasView = new CanvasView(engine, this);

        this.context.getContextObserver('onSheetRenderDidMountObservable')?.notifyObservers();
    }

    onMapping(IOC: IOCContainer): void {}

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

    getSelectionModels() {
        return this.getSheetView()?.getSelectionModels();
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
        return this.getContext().getWorkBook();
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

    changeWorksheet(sheetId: string) {
        const workbook = this.getWorkbook();
        const worksheet = workbook.getSheetBySheetId(sheetId);
        if (!worksheet) {
            return;
        }
        this.getCanvasView().updateToSheet(worksheet);

        this.getObserver('onChangeCurrentSheetObserver')?.notifyObservers(sheetId);
    }

    addRightMenu(item: RightMenuProps[] | RightMenuProps) {
        this._rightMenuControl.addItem(item);
    }
}
