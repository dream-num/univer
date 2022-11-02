import { SheetContext, Plugin, PLUGIN_NAMES, UniverSheet } from '@univer/core';
import { GroupButton } from './View/UI/GroupButton';
import { zh, en } from './Locale';

import { IToolBarItemProps, ISlotElement } from '@univer/base-component';
import { IOCContainer } from '@univer/core';
import { SheetPlugin } from '@univer/base-sheets';
import { GROUP_PLUGIN_NAME } from './Basic/Const/PLUGIN_NAME';

export interface IGroupPluginConfig {}

export class GroupPlugin extends Plugin {
    constructor(config?: IGroupPluginConfig) {
        super(GROUP_PLUGIN_NAME);
    }

    static create(config?: IGroupPluginConfig) {
        return new GroupPlugin(config);
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

        const item: IToolBarItemProps = {
            locale: 'group',
            type: ISlotElement.JSX,
            show: true,
            label: <GroupButton />,
        };
        context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addButton(item);
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}
}
