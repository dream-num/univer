import { Plugin, UniverSheet, UniverDoc, UniverSlide } from '@univer/core';
import { zh, en } from './Locale';
import { COLLABORATION_PLUGIN_NAME } from './Basic/Const/PLUGIN_NAME';
import { CollaborationController } from './Controller/CollaborationController';

export interface ICollaborationPluginConfig {
    url: string;
}

export class CollaborationPlugin extends Plugin {
    private _collaborationController: CollaborationController;
    config: ICollaborationPluginConfig;
    constructor(config?: ICollaborationPluginConfig) {
        super(COLLABORATION_PLUGIN_NAME);
        this.config = config || { url: '' };
        console.log('colla---config---', config);
    }

    static create(config?: ICollaborationPluginConfig) {
        return new CollaborationPlugin(config);
    }

    installTo(univerInstance: UniverSheet | UniverDoc | UniverSlide) {
        univerInstance.installPlugin(this);
    }

    initialize(): void {
        const context = this.getContext();

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en: en,
            zh: zh,
        });

        this._collaborationController = new CollaborationController(this);
    }

    onMounted(): void {
        this.initialize();
    }

    onDestroy(): void {}

    // TODO common function
    getConfig() {
        return this.config;
    }

    getCollaborationController() {
        return this._collaborationController;
    }
}
