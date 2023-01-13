import { RenderEngine } from '@univer/base-render';
import { CanvasView } from '@univer/base-sheets';
import { LocaleType, PLUGIN_NAMES } from '@univer/core';
import { BaseComponentPlugin } from '../BaseComponentPlugin';
import { UniverConfig } from '../Basics';
import { UniverSheetConfig } from '../Basics/Interfaces/UniverSheetConfig';
import { UI } from '../UI';
import { UniverContainer } from '../UI/UniverContainer';
import { ToolBarController } from './ToolbarController';

export class UniverContainerController {
    private _plugin: BaseComponentPlugin;

    private _univerContainer: UniverContainer;

    private _toolbarController: ToolBarController;

    private _config: UniverConfig;

    constructor(plugin: BaseComponentPlugin) {
        this._plugin = plugin;

        this._config = this._plugin.getConfig();
        // 初始化UI
        const config = {
            config: this._config,
            changeSkin: this.changeSkin,
            changeLocale: this.changeLocale,
            getComponent: this.getComponent,
            mountCanvas: this.mountCanvas,
        };
        UI.create(config);

        this._toolbarController = new ToolBarController(this._plugin);
    }

    getComponent = (ref: UniverContainer) => {
        this._univerContainer = ref;
        this._plugin.getObserver('onAfterUniverContainerDidMountObservable')!.notifyObservers();
    };

    mountCanvas = (container: HTMLElement) => {
        const engine = this._plugin.getPluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER)?.getEngine()!;
        engine.setContainer(container);
        new CanvasView(engine, this._plugin.getSheetPlugin());

        window.addEventListener('resize', () => {
            engine.resize();
        });

        // should be clear
        setTimeout(() => {
            engine.resize();
        }, 0);
    };

    /**
     * Change skin
     * @param {String} lang new skin
     */
    changeSkin = () => {
        // publish
        this._plugin.getObserver('onAfterChangeUISkinObservable')!.notifyObservers();
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
        this._plugin.getObserver('onAfterChangeUILocaleObservable')!.notifyObservers();
    };

    addSheet(config: UniverSheetConfig) {}

    getContentRef() {
        return this._univerContainer.getContentRef();
    }
}
