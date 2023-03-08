import { Plugin, Context, UniverDoc } from '@univerjs/core';
import { zh, en } from './Locale';
import { DOC_UI_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { UIController } from './Controller/UIController';

export interface IDocUIPluginConfig {}

export class DocUIPlugin extends Plugin<any, Context> {
    private _UIController: UIController;

    constructor(config?: IDocUIPluginConfig) {
        super(DOC_UI_PLUGIN_NAME);
    }

    static create(config?: IDocUIPluginConfig) {
        return new DocUIPlugin(config);
    }

    installTo(universheetInstance: UniverDoc) {
        universheetInstance.installPlugin(this);
    }

    initialize(): void {
        /**
         * load more Locale object
         */
        this.getLocale().load({
            en,
            zh,
        });

        this._UIController = new UIController(this);
    }

    onMounted(): void {
        this.initialize();
    }

    onDestroy(): void {}
}
