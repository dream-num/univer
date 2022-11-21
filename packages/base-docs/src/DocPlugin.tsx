import { DocContext, Plugin, PLUGIN_NAMES, UniverSheet, Tools, AsyncFunction } from '@univer/core';
import { zh, en } from './Locale';
import { IOCContainer } from '@univer/core';
import { Component, getRefElement, isElement, ISlotProps, RefObject, render } from '@univer/base-component';
import { DocPluginObserve, install } from './Basic/Observer';
import { ToolBarController } from './Controller/ToolBarController';
import { DocContainerController } from './Controller/DocContainerController';
import { BaseDocContainerConfig, DocContainer, IDocPluginConfigBase } from './View/UI/DocContainer';
import { InfoBarController } from './Controller/InfoBarController';
import { Engine, RenderEngine } from '@univer/base-render';
import { CanvasView } from './View/Render/CanvasView';

export interface IDocPluginConfig extends IDocPluginConfigBase {
    container: HTMLElement | string;
}

const DEFAULT_DOCUMENT_PLUGIN_DATA = {
    container: 'univerdoc',
    layout: 'auto',
};

export class DocPlugin extends Plugin<DocPluginObserve, DocContext> {
    private _config: IDocPluginConfig;
    private _toolBarRef: RefObject<HTMLElement>;
    private _infoBarControl: InfoBarController;

    private _splitLeftRef: RefObject<HTMLDivElement>;

    private _contentRef: RefObject<HTMLDivElement>;

    private _canvasView: CanvasView;

    private _addButtonFunc: Function;

    private _addSiderFunc: AsyncFunction<ISlotProps>;

    private _addMainFunc: Function;

    private _showSiderByNameFunc: Function;

    private _showMainByNameFunc: Function;

    private _canvasEngine: Engine;

    private _toolBarControl: ToolBarController;
    private _docContainerController: DocContainerController;
    private _componentList: Map<string, any>;

    constructor(config: Partial<IDocPluginConfig> = {}) {
        super(PLUGIN_NAMES.DOCUMENT);

        this._config = Tools.commonExtend(DEFAULT_DOCUMENT_PLUGIN_DATA, config);
    }

    static create(config?: IDocPluginConfig) {
        return new DocPlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    initialize(): void {
        const context = this.getContext();

        this.getObserver('onDocContainerDidMountObservable')?.add(() => {
            this._initializeRender();
        });

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en: en,
            zh: zh,
        });

        this._componentList = new Map();

        this._toolBarControl = new ToolBarController(this);
        this._infoBarControl = new InfoBarController(this);
        this._docContainerController = new DocContainerController(this);

        const docContainer = this._initContainer(this._config.container);

        const config: BaseDocContainerConfig = {
            skin: 'default',
            layout: this._config.layout,
            container: docContainer,
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

        render(<DocContainer config={config} />, docContainer);
    }

    /**
     * Convert id to DOM
     * @param container
     * @returns
     */
    private _initContainer(container: HTMLElement | string) {
        let docContainer = null;
        if (typeof container === 'string') {
            const containerDOM = document.getElementById(container);
            if (containerDOM == null) {
                docContainer = document.createElement('div');
                docContainer.id = container;
            } else {
                docContainer = containerDOM;
            }
        } else if (isElement(container)) {
            docContainer = container;
        } else {
            docContainer = document.createElement('div');
            docContainer.id = 'univerdoc';
        }

        return docContainer;
    }

    private _initializeRender() {
        const engine = this.getPluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER)?.getEngine()!;

        this.register(engine);
    }

    register(engineInstance: Engine) {
        // The preact ref component cannot determine whether ref.current or ref.current.base is DOM
        let container: HTMLElement = getRefElement(this.getContentRef());

        this._canvasEngine = engineInstance;

        engineInstance.setContainer(container);

        this._canvasView = new CanvasView(engineInstance, this);

        window.onresize = () => {
            engineInstance.resize();
        };
    }

    get config() {
        return this._config;
    }

    getContentRef(): RefObject<HTMLDivElement> {
        return this._contentRef;
    }
    getToolBarControl() {
        return this._toolBarControl;
    }

    getInfoBarControl() {
        return this._infoBarControl;
    }

    onMounted(ctx: DocContext): void {
        install(this);
        this.initialize();
    }

    onDestroy(): void {}

    registerComponent(name: string, component: Component, props?: any) {
        this._componentList.set(name, component);
    }

    getRegisterComponent(name: string) {
        return this._componentList.get(name);
    }
}
