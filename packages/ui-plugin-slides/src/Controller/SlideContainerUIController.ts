import { DragManager, getRefElement } from '@univerjs/base-ui';
import { LocaleType } from '@univerjs/core';
import { ISlideUIPluginConfig } from '../Basics';
import { SlideUIPlugin } from '../SlideUIPlugin';
import { SlideContainer } from '../View';
import { InfoBarUIController } from './InfoBarUIController';
import { SlideBarUIController } from './SlideBarUIController';
import { ToolbarUIController } from './ToolbarUIController';

export class SlideContainerUIController {
    protected _plugin: SlideUIPlugin;

    private _slideContainer: SlideContainer;

    private _toolbarController: ToolbarUIController;

    private _infoBarController: InfoBarUIController;

    private _slideBarController: SlideBarUIController;

    private _config: ISlideUIPluginConfig;

    private _dragManager: DragManager;

    constructor(plugin: SlideUIPlugin) {
        this._plugin = plugin;

        this._config = this._plugin.getConfig();

        this._initialize();

        this._toolbarController = new ToolbarUIController(this._plugin, this._config.layout?.toolbarConfig);

        this._infoBarController = new InfoBarUIController(this._plugin);

        this._slideBarController = new SlideBarUIController(this._plugin);
    }

    getUIConfig() {
        const config = {
            context: this._plugin.getContext(),
            config: this._config,
            changeLocale: this.changeLocale,
            getComponent: this.getComponent,
            // 其余组件的props
            methods: {
                toolbar: {
                    getComponent: this._toolbarController.getComponent,
                },

                infoBar: {
                    getComponent: this._infoBarController.getComponent,
                },
                slideBar: {
                    getComponent: this._slideBarController.getComponent,
                    addSlide: this._slideBarController.addSlide,
                    activeSlide: this._slideBarController.activeSlide,
                },
            },
        };
        return config;
    }

    // 获取SlideContainer组件
    getComponent = (ref: SlideContainer) => {
        this._slideContainer = ref;
        this._plugin.getObserver('onUIDidMount')?.notifyObservers(this._slideContainer);
        this._plugin.getGlobalContext().getObserverManager().requiredObserver<boolean>('onUIDidMountObservable', 'core').notifyObservers(true);

        this.setSlideContainer();
    };

    /**
     * Change language
     * @param {String} lang new language
     *
     * e: {target: HTMLSelectElement } reference from  https://stackoverflow.com/a/48443771
     *
     */
    changeLocale = (locale: string) => {
        this._plugin
            .getContext()
            .getLocale()
            .change(locale as LocaleType);

        // publish
        this._plugin.getGlobalContext().getObserverManager().requiredObserver('onAfterChangeUILocaleObservable', 'core')!.notifyObservers();
    };

    getContentRef() {
        return this._slideContainer.getContentRef();
    }

    getToolbarController() {
        return this._toolbarController;
    }

    UIDidMount(cb: Function) {
        if (this._slideContainer) return cb(this._slideContainer);

        this._plugin.getObserver('onUIDidMount')?.add(() => cb(this._slideContainer));
    }

    private _initialize() {
        this._dragManager = new DragManager(this._plugin);
    }

    private setSlideContainer() {
        // handle drag event
        this._dragManager.handleDragAction(getRefElement(this._slideContainer));
    }
}
