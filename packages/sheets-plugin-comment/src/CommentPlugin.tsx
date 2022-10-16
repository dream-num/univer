import { IToolBarItemProps, ISlotElement } from '@univer/base-component';
import { Context, IOCContainer, UniverSheet, Nullable, Plugin, PLUGIN_NAMES } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { COMMENT_COLORS_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { IConfig } from './IData/IComment';
import { en, zh } from './Locale';
import { CommentButton } from './UI/CommentButton';

export interface ICommentPluginConfig {}

export class CommentPlugin extends Plugin {
    spreadsheetPlugin: Nullable<SpreadsheetPlugin>;

    constructor(config?: ICommentPluginConfig) {
        super(COMMENT_COLORS_PLUGIN_NAME);
    }

    static create(config?: ICommentPluginConfig) {
        return new CommentPlugin(config);
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
            locale: COMMENT_COLORS_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <CommentButton config={config} />,
        };
        // get spreadsheet plugin
        this.spreadsheetPlugin = context.getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

        // extend comment
        this.spreadsheetPlugin?.addButton(item);
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: Context): void {
        this.initialize();
    }

    onDestroy(): void {}
}
