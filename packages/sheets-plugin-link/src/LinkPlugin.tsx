import { IToolbarItemProps, ISlotElement } from '@univerjs/base-ui';
import { SheetContext, IOCContainer, UniverSheet, Plugin, PLUGIN_NAMES } from '@univerjs/core';
import { SheetPlugin } from '@univerjs/base-sheets';
import { en, zh } from './Locale';
import { LinkButton } from './UI/LinkButton';

import { IConfig } from './IData/ILink';
import { LINK_PLUGIN_NAME } from './Const/PLUGIN_NAME';

export interface ILinkPluginConfig {}

export class LinkPlugin extends Plugin {
    constructor(config?: ILinkPluginConfig) {
        super(LINK_PLUGIN_NAME);
    }

    static create(config?: ILinkPluginConfig) {
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

        const item: IToolbarItemProps = {
            locale: LINK_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <LinkButton config={config} />,
        };
        context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addButton(item);
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}
}
