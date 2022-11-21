import { ISlotElement, ISlotProps, IToolBarItemProps } from '@univer/base-component';
import { SheetContext, IOCContainer, UniverSheet, Plugin, PLUGIN_NAMES } from '@univer/core';
import { SheetPlugin } from '@univer/base-sheets';
import { PROTECTION_PLUGIN_NAME } from './Basic/Const/PLUGIN_NAME';
import { IConfig } from './IData/IProtection';
import { en, zh } from './Locale';
import { ProtectionButton } from './UI/ProtectionButton';
import { ProtectionSide } from './UI/ProtectionSide';
import { Protection } from './Controller';

export interface IProtectionPluginConfig {}

export class ProtectionPlugin extends Plugin {
    _protectionSlider: Protection;

    constructor(config?: IProtectionPluginConfig) {
        super(PROTECTION_PLUGIN_NAME);
    }

    static create(config?: IProtectionPluginConfig) {
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
            locale: PROTECTION_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <ProtectionButton config={config} />,
        };
        context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addButton(item);

        // TODO
        this._protectionSlider = new Protection();

        const rangeData = {
            startRow: 0,
            endRow: 10,
            startColumn: 0,
            endColumn: 10,
        };

        const siderItem: ISlotProps = {
            name: 'protection',
            type: ISlotElement.JSX,
            label: <ProtectionSide config={{ rangeData, context, protection: this._protectionSlider }} />,
        };
        context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addSider(siderItem);
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}
}
