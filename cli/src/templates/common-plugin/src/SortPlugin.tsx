import { Context, Plugin, PLUGIN_NAMES, UniverSheet, UniverDoc, UniverSlide } from '@univer/core';
import { <%= projectUpperValue %>Button } from './View/UI/<%= projectUpperValue %>Button';
import { zh, en } from './Locale';

import { IToolBarItemProps, ISlotElement } from '@univer/base-component';
import { IOCContainer } from '@univer/core';
import { SheetPlugin } from '@univer/base-sheets';
import { <%= projectConstantValue %>_PLUGIN_NAME} from './Basic/Const/PLUGIN_NAME'

export interface I<%= projectUpperValue %>PluginConfig {}

export class <%= projectUpperValue %>Plugin extends Plugin {

    constructor(config ?: IPluginConfig) {
        super(<%= projectConstantValue %>_PLUGIN_NAME);
    }

    static create(config?: I<%= projectUpperValue %>PluginConfig) {
        return new <%= projectUpperValue %>Plugin(config);
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
        

        // const item: IToolBarItemProps = {
        //     locale: '<%= projectValue %>',
        //     type: ISlotElement.JSX,
        //     show: true,
        //     label: <<%= projectUpperValue %>Button />
        // }
        // context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addToolButton(item)
}

onMapping(IOC: IOCContainer): void {}

onMounted(ctx: Context): void {
    this.initialize()
}

onDestroy(): void {}
}
