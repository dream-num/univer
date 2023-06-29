import { SheetContext, Plugin, UniverSheet, IOCContainer } from '@univerjs/core';
import { GROUP_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';

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
        // const context = this.getContext();
        //
        // /**
        //  * load more Locale object
        //  */
        // context.getLocale().load({
        //     en,
        //     zh,
        // });
        //
        // const item: IToolbarItemProps = {
        //     locale: 'group',
        //     type: ISlotElement.JSX,
        //     show: true,
        //     label: <GroupButton />,
        // };
        // context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addButton(item);
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}
}
