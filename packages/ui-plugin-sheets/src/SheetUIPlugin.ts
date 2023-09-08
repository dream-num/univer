import { Dependency, Inject, Injector } from '@wendellhu/redi';
import { Plugin, Tools, PluginType, LocaleService, IUndoRedoService } from '@univerjs/core';
import {
    ComponentManager,
    getRefElement,
    KeyboardManager,
    SlotComponent,
    ZIndexManager,
    SlotManager,
    DragManager,
    IShortcutService,
    DesktopShortcutService,
    SharedController,
    IPlatformService,
    DesktopPlatformService,
    IMenuService,
    DesktopMenuService,
} from '@univerjs/base-ui';
import { IRenderingEngine } from '@univerjs/base-render';
import { DefaultSheetUIConfig, installObserver, ISheetUIPluginConfig, SheetUIPluginObserve, SHEET_UI_PLUGIN_NAME } from './Basics';
import { AppUIController } from './Controller/AppUIController';
import { Fx } from './View/FormulaBar';
import { SlotComponentProps } from './Controller/SlotController';
import { zh, en } from './Locale';
import { DesktopSheetShortcutController } from './Controller/shortcut.controller';

export class SheetUIPlugin extends Plugin<SheetUIPluginObserve> {
    static override type = PluginType.Sheet;

    private _appUIController: AppUIController;

    private _keyboardManager: KeyboardManager;

    private _config: ISheetUIPluginConfig;

    private _zIndexManager: ZIndexManager;

    private _dragManager: DragManager;

    private _componentManager: ComponentManager;

    constructor(config: ISheetUIPluginConfig, @Inject(Injector) override readonly _injector: Injector, @Inject(LocaleService) private readonly _localeService: LocaleService) {
        super(SHEET_UI_PLUGIN_NAME);

        this._config = Tools.deepMerge({}, DefaultSheetUIConfig, config);
    }

    initialize(): void {
        installObserver(this);

        /**
         * load more Locale object
         *
         * TODO 异步加载
         */
        this._localeService.getLocale().load({
            zh,
            en,
        });

        this.initializeDependencies();

        // AppUIController initializes the DOM as an asynchronous rendering process, and must wait for the UI rendering to complete before starting to render the canvas
        this.UIDidMount(() => {
            this.initRender();
        });
    }

    initRender() {
        const engine = this._injector.get(IRenderingEngine);
        const container = getRefElement(this._appUIController.getSheetContainerController().getContentRef());

        // mount canvas to DOM container
        engine.setContainer(container);

        window.addEventListener('resize', () => {
            engine.resize();
        });

        // should be clear
        setTimeout(() => {
            engine.resize();
        }, 0);
    }

    initUI() {}

    override onMounted(): void {
        this.initialize();
    }

    override onDestroy(): void {}

    getAppUIController() {
        return this._appUIController;
    }

    getComponentManager() {
        return this._componentManager;
    }

    getZIndexManager() {
        return this._zIndexManager;
    }

    /**
     * usage this._clipboardExtensionManager.handle(data);
     * @returns
     */
    getKeyboardManager(): KeyboardManager {
        return this._keyboardManager;
    }

    /**
     * Formula Bar API
     * @param str
     */
    setFormulaContent(str: string) {
        this._appUIController.getSheetContainerController().getFormulaBarUIController().getFormulaBar().setFormulaContent(str);
    }

    setFx(fx: Fx) {
        this._appUIController.getSheetContainerController().getFormulaBarUIController().getFormulaBar().setFx(fx);
    }

    /**
     * This API is used in plugins for initialization that depends on UI rendering
     * @param cb
     * @returns
     */
    UIDidMount(cb: Function) {
        this._appUIController.getSheetContainerController().UIDidMount(cb);
    }

    setSlot(slotName: string, component: SlotComponent, cb?: () => {}) {
        this._appUIController.getSheetContainerController().getSlotManager().setSlotComponent(slotName, component, cb);
    }

    addSlot(name: string, slot: SlotComponentProps, cb?: () => void) {
        this._appUIController.getSheetContainerController().getMainSlotController().addSlot(name, slot, cb);
    }

    getSlot(name: string) {
        // return this._appUIController.getSheetContainerController().getMainSlotController().getSlot(name);
    }

    private initializeDependencies(): void {
        const dependencies: Dependency[] = [
            [DragManager],
            [KeyboardManager],
            [ComponentManager],
            [ZIndexManager],
            [SlotManager],
            [IShortcutService, { useClass: DesktopShortcutService }],
            [IPlatformService, { useClass: DesktopPlatformService }],
            [SharedController],
            [IMenuService, { useClass: DesktopMenuService }],
            [DesktopSheetShortcutController],
        ];
        dependencies.forEach((d) => this._injector.add(d));

        this._dragManager = this._injector.get(DragManager);
        this._componentManager = this._injector.get(ComponentManager);
        this._keyboardManager = this._injector.get(KeyboardManager);
        this._zIndexManager = this._injector.get(ZIndexManager);

        this._appUIController = this._injector.createInstance(AppUIController, this._config);
        this._injector.add([AppUIController, { useValue: this._appUIController }]);

        this._injector.get(IUndoRedoService);
        this._injector.get(SharedController);
        this._injector.get(DesktopSheetShortcutController);
    }
}
