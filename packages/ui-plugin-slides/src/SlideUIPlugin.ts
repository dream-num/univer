import { Plugin, Context, UniverSlide } from '@univerjs/core';
import { zh, en } from './Locale';
import { SLIDE_UI_PLUGIN_NAME } from './Basic/Const/PLUGIN_NAME';
import { UIController } from './Controller/UIController';

export interface ISlideUIPluginConfig {}

export class SlideUIPlugin extends Plugin<any, Context> {
    private _UIController: UIController;

    constructor(config?: ISlideUIPluginConfig) {
        super(SLIDE_UI_PLUGIN_NAME);
    }

    static create(config?: ISlideUIPluginConfig) {
        return new SlideUIPlugin(config);
    }

    installTo(universheetInstance: UniverSlide) {
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
