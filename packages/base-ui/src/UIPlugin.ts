import { Plugin, PLUGIN_NAMES, Univer, SheetContext } from '@univerjs/core';

export interface IUIPluginConfig {}

const DEFAULT_SLIDE_PLUGIN_DATA = {};

export class UIPlugin extends Plugin<any, SheetContext> {
    private _config: IUIPluginConfig;

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

    initialize(context: SheetContext): void {
        this.context = context;
    }

    getConfig() {
        return this._config;
    }

    onMounted(ctx: SheetContext): void {
        this.initialize(ctx);
    }
}