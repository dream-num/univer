import { IToolBarItemProps, ISlotElement } from '@univer/base-component';
import { Context, IOCContainer, UniverSheet, Plugin, PLUGIN_NAMES } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { en, zh } from './Locale';
import { LinkButton } from './UI/LinkButton';

import { IConfig } from './IData/ILink';
import { LINK_PLUGIN_NAME } from './Const/PLUGIN_NAME';

type IPluginConfig = {};

export class LinkPlugin extends Plugin {
    constructor(config?: IPluginConfig) {
        super(LINK_PLUGIN_NAME);
    }

    static create(config?: IPluginConfig) {
        return new LinkPlugin(config);
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
            en,
            zh,
        });
        const config: IConfig = { context };

        const item: IToolBarItemProps = {
            locale: LINK_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <LinkButton config={config} />,
        };
        context.getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addButton(item);
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: Context): void {
        this.initialize();
    }

    onDestroy(): void {}
}
