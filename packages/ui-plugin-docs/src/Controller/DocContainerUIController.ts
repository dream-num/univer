import { EventManager } from '@univerjs/base-ui';
import { LocaleType, UniverDoc } from '@univerjs/core';
import { IDocUIPluginConfig } from '../Basics';
import { DocUIPlugin } from '../DocUIPlugin';
import { DocContainer } from '../View';
import { InfoBarUIController } from './InfoBarUIController';
import { ToolbarUIController } from './ToolbarUIController';

export class DocContainerUIController {
    protected _plugin: DocUIPlugin;

    private _docContainer: DocContainer;

    private _toolbarController: ToolbarUIController;

    private _infoBarController: InfoBarUIController;

    private _config: IDocUIPluginConfig;

    private _eventManager: EventManager;

    constructor(plugin: DocUIPlugin) {
        this._plugin = plugin;

        this._config = this._plugin.getConfig();

        this._initialize();

        this._toolbarController = new ToolbarUIController(this._plugin, this._config.layout?.toolbarConfig);

        this._infoBarController = new InfoBarUIController(this._plugin);
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
                    // renameSheet: this._infoBarController.renameSheet,
                },
            },
        };
        return config;
    }

    // 获取SheetContainer组件
    getComponent = (ref: DocContainer) => {
        this._docContainer = ref;
        this._plugin.getObserver('onUIDidMount')?.notifyObservers(this._docContainer);

        this._initDocContainer();
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
        return this._docContainer.getContentRef();
    }

    setEventManager() {
        const univerDocs = this._plugin.getUniver().getAllUniverDocsInstance();
        univerDocs.forEach((univerDoc: UniverDoc) => {
            // univerDocs.getWorkBook().getContext().getPluginManager().getRequirePluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET).listenEventManager();
        });
    }

    getEventManager() {
        return this._eventManager;
    }

    getToolbarController() {
        return this._toolbarController;
    }

    UIDidMount(cb: Function) {
        if (this._docContainer) return cb(this._docContainer);

        this._plugin.getObserver('onUIDidMount')?.add(() => cb(this._docContainer));
    }

    getDocContainer() {
        return this._docContainer;
    }

    private _initialize() {
        this._eventManager = new EventManager(this._plugin);

        this.setEventManager();
    }

    private _initDocContainer() {
        // handle drag event
    }
}
