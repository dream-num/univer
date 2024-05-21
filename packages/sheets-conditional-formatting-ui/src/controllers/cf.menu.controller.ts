/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { Disposable, IUniverInstanceService, LifecycleStages, LocaleService, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import type { MenuConfig } from '@univerjs/ui';
import { ComponentManager, IMenuService, ISidebarService } from '@univerjs/ui';
import type { IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import { FactoryManageConditionalFormattingRule } from '../menu/manage-rule';
import { ConditionFormattingPanel } from '../components/panel';

export interface IUniverSheetsConditionalFormattingUIConfig {
    menu: MenuConfig;
}

export const DefaultSheetConditionalFormattingUiConfig = {};

const CF_PANEL_KEY = 'sheet.conditional.formatting.panel';
@OnLifecycle(LifecycleStages.Ready, ConditionalFormattingMenuController)
export class ConditionalFormattingMenuController extends Disposable {
    private _sidebarDisposable: IDisposable | null = null;

    constructor(
        private readonly _config: Partial<IUniverSheetsConditionalFormattingUIConfig>,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @Inject(IMenuService) private _menuService: IMenuService,
        @Inject(ISidebarService) private _sidebarService: ISidebarService,
        @Inject(LocaleService) private _localeService: LocaleService
    ) {
        super();

        this._initMenu();
        this._initPanel();

        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((sheet) => {
                if (!sheet) this._sidebarDisposable?.dispose();
            })
        );
    }

    openPanel(rule?: IConditionFormattingRule) {
        const props = {
            header: { title: this._localeService.t('sheet.cf.title') },
            children: {
                label: CF_PANEL_KEY,
                rule,
            },
            onClose: () => this._sidebarDisposable = null,
        };

        this._sidebarDisposable = this._sidebarService.open(props);
    }

    private _initMenu() {
        const { menu = {} } = this._config;

        this._menuService.addMenuItem(FactoryManageConditionalFormattingRule(this._injector), menu);
    }

    private _initPanel() {
        this._componentManager.register(CF_PANEL_KEY, ConditionFormattingPanel);
    }
}
