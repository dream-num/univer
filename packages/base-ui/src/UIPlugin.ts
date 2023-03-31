import { Plugin, PLUGIN_NAMES, Univer, Context } from '@univerjs/core';
import { EventManager } from './Common';

export interface IUIPluginConfig {}

const DEFAULT_SLIDE_PLUGIN_DATA = {};

export class UIPlugin extends Plugin<any, Context> {
    private _config: IUIPluginConfig;

    private _eventManager: EventManager;

    constructor(config: Partial<IUIPluginConfig> = {}) {
        super(PLUGIN_NAMES.BASE_UI);

        this._config = Object.assign(DEFAULT_SLIDE_PLUGIN_DATA, config);
    }

    static create(config?: IUIPluginConfig) {
        return new UIPlugin(config);
    }

    installTo(univerInstance: Univer) {
        univerInstance.install(this);
    }

    initialize(context: Context): void {
        this.context = context;

        this.initEventManager();
    }

    getConfig() {
        return this._config;
    }

    onMounted(ctx: Context): void {
        this.initialize(ctx);
    }

    initEventManager() {
        this._eventManager = new EventManager(this);
    }

    getEventManager() {
        return this._eventManager;
    }
}
