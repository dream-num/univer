import { IToolBarItemProps, ISlotElement } from '@univer/base-component';
import { Context, UniverSheet, Nullable, Plugin, PLUGIN_NAMES, Worksheet } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { en, zh } from './Locale';
import { FindButton } from './UI/FindButton';
import { TextFinder } from './Domain/TextFind';
import { FindType, IConfig } from './IData/IFind';
import { FIND_PLUGIN_NAME } from './Const/PLUGIN_NAME';

type IPluginConfig = {};

export class FindPlugin extends Plugin {
    spreadsheetPlugin: Nullable<SpreadsheetPlugin>;

    constructor(config?: IPluginConfig) {
        super(FIND_PLUGIN_NAME);
    }

    static create(config?: IPluginConfig) {
        return new FindPlugin(config);
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
        const config: IConfig = {};

        const item: IToolBarItemProps = {
            locale: FIND_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <FindButton config={config} />,
        };
        // get spreadsheet plugin
        this.spreadsheetPlugin = context.getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

        // extend comment
        this.spreadsheetPlugin?.addButton(item);
    }

    createTextFinder(workSheet: Worksheet, type: FindType, text: string) {
        return new TextFinder(workSheet, type, text);
    }

    onMounted(ctx: Context): void {
        this.initialize();
    }

    onDestroy(): void {}

    onMapping(): void {}
}
