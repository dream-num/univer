import { SlideContext, Plugin, PLUGIN_NAMES, UniverSheet, Tools, AsyncFunction } from '@univer/core';
import { getRefElement, isElement, ISlotProps, RefObject, render } from '@univer/base-component';
import { Engine, RenderEngine } from '@univer/base-render';
import { zh, en } from './Locale';
import { install, SlidePluginObserve } from './Basic/Observer';
import { ToolBarController } from './Controller/ToolBarController';
import { SlideContainerController } from './Controller/SlideContainerController';
import { InfoBarController } from './Controller/InfoBarController';
import { BaseSlideContainerConfig, ILayout, ISlidePluginConfigBase, SlideContainer } from './View/UI/SlideContainer';
import { SlideBarController } from './Controller/SlideBarController';
import { CanvasView } from './View/Render';

export interface ISlidePluginConfig extends ISlidePluginConfigBase {
    container: HTMLElement | string;
}

const DEFAULT_SLIDE_PLUGIN_DATA = {
    container: 'universlide',
    layout: 'auto',
};

export class SlidePlugin extends Plugin<SlidePluginObserve, SlideContext> {
    private _config: ISlidePluginConfig;

    private _infoBarControl: InfoBarController;

    private _splitLeftRef: RefObject<HTMLDivElement>;

    private _contentRef: RefObject<HTMLDivElement>;

    private _addButtonFunc: Function;

    private _addSiderFunc: AsyncFunction<ISlotProps>;

    private _addMainFunc: Function;

    private _showSiderByNameFunc: Function;

    private _showMainByNameFunc: Function;

    private _canvasEngine: Engine;

    private _canvasView: CanvasView;

    private _toolBarControl: ToolBarController;

    private _slideBarControl: SlideBarController;

    private _slideContainerController: SlideContainerController;

    private _componentList: Map<string, any>;

    constructor(config: Partial<ISlidePluginConfig> = {}) {
        super(PLUGIN_NAMES.SLIDE);

        this._config = Tools.commonExtend(DEFAULT_SLIDE_PLUGIN_DATA, config);
    }

    static create(config?: ISlidePluginConfig) {
        return new SlidePlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    initialize(): void {
        const context = this.getContext();

        this.getObserver('onSlideContainerDidMountObservable')?.add(() => {
            this._initializeRender();
        });

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en,
            zh,
        });

        this._componentList = new Map();

        const layout = this._config.layout as ILayout;

        if (layout === 'auto' || layout.toolBar) {
            this._toolBarControl = new ToolBarController(this);
        }
        if (layout === 'auto' || layout.infoBar) {
            this._infoBarControl = new InfoBarController(this);
        }
        
        this._slideBarControl = new SlideBarController(this);
        this._slideContainerController = new SlideContainerController(this);

        const slideContainer = this._initContainer(this._config.container);

        const config: BaseSlideContainerConfig = {
            skin: 'default',
            layout: this._config.layout,
            container: slideContainer,
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

        render(<SlideContainer config={config} />, slideContainer);
    }

    /**
     * Convert id to DOM
     * @param container
     * @returns
     */
    private _initContainer(container: HTMLElement | string) {
        let slideContainer = null;
        if (typeof container === 'string') {
            const containerDOM = document.getElementById(container);
            if (containerDOM == null) {
                slideContainer = document.createElement('div');
                slideContainer.id = container;
            } else {
                slideContainer = containerDOM;
            }
        } else if (isElement(container)) {
            slideContainer = container;
        } else {
            slideContainer = document.createElement('div');
            slideContainer.id = 'universlide';
        }

        return slideContainer;
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

    getSlideBarControl() {
        return this._slideBarControl;
    }

    onMounted(): void {
        install(this);
        this.initialize();
    }

    onDestroy(): void {}

    registerComponent(name: string, component: any) {
        this._componentList.set(name, component);
    }

    getRegisterComponent(name: string) {
        return this._componentList.get(name);
    }
}
