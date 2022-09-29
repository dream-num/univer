import { ISlotElement, ISlotProps, IToolBarItemProps } from '@univer/base-component';
import { Context, IOCContainer, UniverSheet, Plugin, PLUGIN_NAMES } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { PTOTECTION_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { Protection } from './Domain/Protection';
import { IConfig } from './IData/IProtection';
import { en, zh } from './Locale';
import { ProtectionButton } from './UI/ProtectionButton';
import { ProtectionSide } from './UI/ProtectionSide';

type IPluginConfig = {};

export class ProtectionPlugin extends Plugin {
    _protectionSilder: Protection;

    constructor(config?: IPluginConfig) {
        super(PTOTECTION_PLUGIN_NAME);
    }

    static create(config?: IPluginConfig) {
        return new ProtectionPlugin(config);
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
        const config: IConfig = {
            context,
        };

        const item: IToolBarItemProps = {
            locale: PTOTECTION_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <ProtectionButton config={config} />,
        };
        context.getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addButton(item);

        // TODO
        this._protectionSilder = new Protection();

        const rangeData = {
            startRow: 0,
            endRow: 10,
            startColumn: 0,
            endColumn: 10,
        };

        const siderItem: ISlotProps = {
            name: 'protection',
            type: ISlotElement.JSX,
            label: <ProtectionSide config={{ rangeData, context, protection: this._protectionSilder }} />,
        };
        context.getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addSider(siderItem);
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: Context): void {
        this.initialize();
    }

    onDestroy(): void {}
}
