import { SheetContext, Plugin, PLUGIN_NAMES, UniverSheet } from '@univer/core';
import { zh, en } from './Locale';
import { IOCContainer } from '@univer/core';

export interface IDocsPluginConfig {}

export class DocsPlugin extends Plugin {
    constructor(config?: IDocsPluginConfig) {
        super(PLUGIN_NAMES.DOCUMENT);
    }

    static create(config?: IDocsPluginConfig) {
        return new DocsPlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
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
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}
}
