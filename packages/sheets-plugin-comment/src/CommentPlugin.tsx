import { IToolBarItemProps, ISlotElement } from '@univerjs/base-component';
import { SheetContext, IOCContainer, UniverSheet, Nullable, Plugin, PLUGIN_NAMES } from '@univerjs/core';
import { SheetPlugin } from '@univerjs/base-sheets';
import { COMMENT_COLORS_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { IConfig } from './IData/IComment';
import { en, zh } from './Locale';
import { CommentButton } from './UI/CommentButton';

export interface ICommentPluginConfig {}

export class CommentPlugin extends Plugin {
    sheetPlugin: Nullable<SheetPlugin>;

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
        this.sheetPlugin = context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

        // extend comment
        this.sheetPlugin?.addButton(item);
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}
}
