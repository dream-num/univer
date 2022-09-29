import { IToolBarItemProps, ISlotElement } from '@univer/base-component';
import { Context, IOCContainer, UniverSheet, Plugin, PLUGIN_NAMES } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { SCREENSHOT_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { IConfig } from './IData/IScreenshot';
import { en, zh } from './Locale';
import { ScreenshotButton } from './UI/ScreenshotButton';

type IPluginConfig = {};

export class ScreenshotPlugin extends Plugin {
    constructor(config?: IPluginConfig) {
        super(SCREENSHOT_PLUGIN_NAME);
    }

    static create(config?: IPluginConfig) {
        return new ScreenshotPlugin(config);
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
            locale: SCREENSHOT_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <ScreenshotButton config={config} />,
        };
        context.getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addButton(item);
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: Context): void {
        this.initialize();
    }

    onDestroy(): void {}
}
