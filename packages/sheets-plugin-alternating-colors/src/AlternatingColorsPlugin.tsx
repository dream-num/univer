import { ISlotElement, ISlotProps } from '@univerjs/base-component';
import { SheetContext, IOCContainer, UniverSheet, Nullable, Plugin, PLUGIN_NAMES, Command } from '@univerjs/core';
import { IToolBarItemProps, SheetPlugin } from '@univerjs/base-sheets';
import { Banding } from './Banding';
import { IAddBandingActionData } from './Command';
import { ACTION_NAMES } from './Command/ACTION_NAMES';
import { ALTERNATING_COLORS_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { DEFAULT_PROPERTIES_BANDED_RANGE, IBandedRange } from './IBandedRange';
import { IConfig } from './IData/IAlternatingColors';
import { en, zh } from './Locale';
import { AlternatingColorsButton } from './UI/AlternatingColorsButton';
import { AlternatingColorsSide } from './UI/AlternatingColorsSide/AlternatingColorsSide';
import { AlternatingColorsPluginObserve } from './Basics/Observer';

export interface IAlternatingColorsPluginConfig {
    value: IBandedRange[];
}

export class AlternatingColorsPlugin extends Plugin<AlternatingColorsPluginObserve, SheetContext> {
    sheetPlugin: Nullable<SheetPlugin>;

    protected _config: IAlternatingColorsPluginConfig;

    constructor(config?: IAlternatingColorsPluginConfig) {
        super(ALTERNATING_COLORS_PLUGIN_NAME);
        this._config = config || { value: [] };
    }

    static create(config?: IAlternatingColorsPluginConfig) {
        return new AlternatingColorsPlugin(config);
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
            // context,
        };

        const item: IToolBarItemProps = {
            locale: ALTERNATING_COLORS_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <AlternatingColorsButton config={config} />,
        };

        // get spreadsheet plugin
        this.sheetPlugin = context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

        // extend toolbar
        this.sheetPlugin?.addButton(item);

        const panelItem: ISlotProps = {
            name: ALTERNATING_COLORS_PLUGIN_NAME,
            type: ISlotElement.JSX,
            label: <AlternatingColorsSide config={{ bandedRange: DEFAULT_PROPERTIES_BANDED_RANGE, alternatingColorsPlugin: this }} />,
        };

        // extend sider
        this.sheetPlugin?.addSider(panelItem);

        // extend main area
        // const mainItem: IMainProps = {
        //     name: ALTERNATING_COLORS_PLUGIN_NAME,
        //     type: ISlotElement.JSX,
        //     content: <div>middle alternating</div>,
        // };

        // this.sheetPlugin?.addMain(mainItem);
        this.sheetPlugin?.showMainByName(ALTERNATING_COLORS_PLUGIN_NAME, true);
    }

    /**
     * {@inheritDoc Plugin.onMapping}
     */
    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}

    getBandings(): Banding[] {
        return this._config.value.map((element) => new Banding(this, element));
    }

    getBandingById(bandedRangeId: string): Nullable<Banding> {
        const bandingData = this._config.value.find((element) => element.bandedRangeId === bandedRangeId);

        return bandingData && new Banding(this, bandingData);
    }

    getBandingData(): IBandedRange[] {
        return this._config.value;
    }

    /**
     * add banding by setting
     */
    addRowBanding(bandedRange: IBandedRange) {
        const context = this.getContext();
        const _commandManager = context.getCommandManager();
        const _worksheet = context.getWorkBook().getActiveSheet()!;

        // Organize action data
        const actionData: IAddBandingActionData = {
            actionName: ACTION_NAMES.ADD_BANDING_ACTION,
            bandedRange,
            sheetId: _worksheet.getSheetId(),
        };

        // Execute action
        const command = new Command(context.getWorkBook(), actionData);
        _commandManager.invoke(command);
    }
}
