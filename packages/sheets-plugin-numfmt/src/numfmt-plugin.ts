import { ComponentManager, IMenuService } from '@univerjs/base-ui';
import { ICommandService, LocaleService, LocaleType, Plugin, PluginType } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { SHEET_NUMFMT_PLUGIN } from './base/const/PLUGIN_NAME';
import { AddDecimalCommand } from './commands/commands/add.decimal.command';
import { SetCurrencyOperator } from './commands/commands/set.currency.command';
import { SetNumfmtCommand } from './commands/commands/set.numfmt.command';
import { SubtractDecimalCommand } from './commands/commands/subtract.decimal.command';
import { SetNumfmtMutation } from './commands/mutations/set.numfmt.mutation';
import { CloseNumfmtPanelOperator } from './commands/operators/close.numfmt.panel.operator';
import { OpenNumfmtPanelOperator } from './commands/operators/open.numfmt.panel.operator';
import { SheetNumfmtPanel } from './components/index';
import { zhCn } from './locale/zh-CN';
import { AddDecimalMenuItem, CurrencyMenuItem, FactoryOtherMenuItem, SubtractDecimalMenuItem } from './menu/menu';
import { NumfmtService } from './service/numfmt.service';

export class NumfmtPlugin extends Plugin {
    static override type = PluginType.Sheet;
    constructor(
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @Inject(ICommandService) private _commandService: ICommandService,
        @Inject(LocaleService) private _localeService: LocaleService,
        @Inject(IMenuService) private _menuService: IMenuService
    ) {
        super(SHEET_NUMFMT_PLUGIN);
    }

    override onStarting(): void {
        this._injector.add([NumfmtService]);
        this._localeService.load({ [LocaleType.ZH_CN]: zhCn, [LocaleType.EN_US]: zhCn });
        this._componentManager.register(SHEET_NUMFMT_PLUGIN, SheetNumfmtPanel);
        [
            AddDecimalCommand,
            SubtractDecimalCommand,
            SetCurrencyOperator,
            OpenNumfmtPanelOperator,
            CloseNumfmtPanelOperator,
            SetNumfmtMutation,
            SetNumfmtCommand,
        ].forEach((config) => this._commandService.registerCommand(config));
    }

    override onRendered(): void {
        this._initMenu();
    }

    private _initMenu() {
        [AddDecimalMenuItem, SubtractDecimalMenuItem, CurrencyMenuItem]
            .map((factory) => factory(this._componentManager))
            .forEach((configFactory) => {
                this._menuService.addMenuItem(configFactory(this._injector));
            });

        this._menuService.addMenuItem(FactoryOtherMenuItem(this._injector));
    }
}
