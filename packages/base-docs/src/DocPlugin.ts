import { Dependency, Inject, Injector } from '@wendellhu/redi';
import { LocaleService, ObserverManager, Plugin, PluginType, PLUGIN_NAMES, UIObserver } from '@univerjs/core';
import { Engine } from '@univerjs/base-render';
import { zh, en } from './Locale';
import { DocPluginObserve, install } from './Basics/Observer';
import { ToolbarController } from './Controller/ToolbarController';
import { DocumentController } from './Controller/DocumentController';
import { InfoBarController } from './Controller/InfoBarController';
import { CanvasView } from './View/Render/CanvasView';
import { CANVAS_VIEW_KEY } from './View/Render';
import { DocsView } from './View/Render/Views';
import { IDocPluginConfigBase } from './Interface';

export interface IDocPluginConfig extends IDocPluginConfigBase {}

const DEFAULT_DOCUMENT_PLUGIN_DATA = {};

export class DocPlugin extends Plugin<DocPluginObserve> {
    static override type = PluginType.Doc;

    private _config: IDocPluginConfig;

    private _infoBarControl: InfoBarController;

    private _canvasView: CanvasView;

    private _canvasEngine: Engine;

    private _toolbarControl: ToolbarController;

    private _documentController: DocumentController;

    constructor(
        config: Partial<IDocPluginConfig> = {},
        @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @Inject(Injector) override _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(PLUGIN_NAMES.DOCUMENT);

        this._config = Object.assign(DEFAULT_DOCUMENT_PLUGIN_DATA, config);
        this._initializeDependencies(_injector);
    }

    initialize(): void {
        this._localeService.getLocale().load({
            en,
            zh,
        });

        install(this);

        this.listenEventManager();
    }

    initializeAfterUI() {
        this.initCanvasView();
        this.initController();
    }

    initController() {
        this._toolbarControl = new ToolbarController();
        this._infoBarControl = new InfoBarController();
        this._documentController = new DocumentController();
    }

    initCanvasView() {
        this._canvasView = this._injector.get(CanvasView);
    }

    listenEventManager() {
        this._getCoreObserver<boolean>('onUIDidMountObservable').add(() => {
            this.initializeAfterUI();
        });
    }

    getConfig() {
        return this._config;
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

    getDocsView() {
        return this.getCanvasView().getDocsView();
    }

    getMainComponent() {
        return (this.getDocsView() as DocsView).getDocs();
    }

    getInputEvent() {
        return this.getMainComponent().getEditorInputEvent();
    }

    getDocumentController() {
        return this._documentController;
    }

    getToolbarControl() {
        return this._toolbarControl;
    }

    getInfoBarControl() {
        return this._infoBarControl;
    }

    override onMounted(): void {
        this.initialize();
    }

    override onDestroy(): void {}

    /** @deprecated This will be removed. Modules should inject `ObserverManager` instead of getting it from plugin. */
    protected _getCoreObserver<T>(type: string) {
        return this._globalObserverManager.requiredObserver<UIObserver<T>>(type, 'core');
    }

    private _initializeDependencies(docInjector: Injector) {
        const dependencies: Dependency[] = [[CanvasView]];

        dependencies.forEach((d) => {
            docInjector.add(d);
        });
    }
}