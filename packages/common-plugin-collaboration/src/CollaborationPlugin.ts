import { Plugin, UniverSheet, UniverDoc, UniverSlide } from '@univerjs/core';
import { zh, en } from './Locale';
import { COLLABORATION_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { CollaborationController } from './Controller/CollaborationController';

export interface ICollaborationPluginConfig {
    url: string;
}

export class CollaborationPlugin extends Plugin {
    config: ICollaborationPluginConfig;

    private _collaborationController: CollaborationController;

    constructor(config?: ICollaborationPluginConfig) {
        super(COLLABORATION_PLUGIN_NAME);
        this.config = config || { url: '' };
    }

    static create(config?: ICollaborationPluginConfig) {
        return new CollaborationPlugin(config);
    }

    installTo(univerInstance: UniverSheet | UniverDoc | UniverSlide) {
        univerInstance.installPlugin(this);
    }

    initialize(): void {
        const context = this.getGlobalContext();

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en,
            zh,
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
