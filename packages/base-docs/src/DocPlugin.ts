import { DocContext, Plugin, PLUGIN_NAMES, UIObserver, UniverSheet } from '@univerjs/core';
import { Engine, RenderEngine } from '@univerjs/base-render';
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

export class DocPlugin extends Plugin<DocPluginObserve, DocContext> {
    private _config: IDocPluginConfig;

    private _infoBarControl: InfoBarController;

    private _canvasView: CanvasView;

    private _canvasEngine: Engine;

    private _toolbarControl: ToolbarController;

    private _documentController: DocumentController;

    constructor(config: Partial<IDocPluginConfig> = {}) {
        super(PLUGIN_NAMES.DOCUMENT);

        this._config = Object.assign(DEFAULT_DOCUMENT_PLUGIN_DATA, config);
    }

    static create(config?: IDocPluginConfig) {
        return new DocPlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    initialize(ctx: DocContext): void {
        this.context = ctx;

        this.getGlobalContext().getLocale().load({
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
        this._toolbarControl = new ToolbarController(this);
        this._infoBarControl = new InfoBarController(this);
        this._documentController = new DocumentController(this, this._config);
    }

    initCanvasView() {
        const engine = this.getContext().getUniver().getGlobalContext().getPluginManager().getPluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER)?.getEngine()!;

        this._canvasEngine = engine;

        if (this._canvasView == null) {
            this._canvasView = new CanvasView(engine, this);
        }
    }

    listenEventManager() {
        this._getCoreObserver<boolean>('onUIDidMountObservable').add(({ name, value }) => {
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

    onMounted(ctx: DocContext): void {
        this.initialize(ctx);
    }

    onDestroy(): void {}

    protected _getCoreObserver<T>(type: string) {
        return this.getGlobalContext().getObserverManager().requiredObserver<UIObserver<T>>(type, 'core');
    }
}
