import { IToolbarItemProps, ISlotElement } from '@univerjs/base-ui';
import { SheetContext, UniverSheet, Plugin, PLUGIN_NAMES } from '@univerjs/core';
import { SheetPlugin } from '@univerjs/base-sheets';
import { SCREENSHOT_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { IConfig } from './IData/IScreenshot';
import { en, zh } from './Locale';
import { ScreenshotButton } from './UI/ScreenshotButton';

export interface IScreenshotPluginConfig {}

export class ScreenshotPlugin extends Plugin {
    constructor(config?: IScreenshotPluginConfig) {
        super(SCREENSHOT_PLUGIN_NAME);
    }

    static create(config?: IScreenshotPluginConfig) {
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

        const item: IToolbarItemProps = {
            locale: SCREENSHOT_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <ScreenshotButton config={config} />,
        };
        context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addButton(item);
    }

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}
}
