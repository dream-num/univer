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

import type { ComponentManager, IMenuSelectorItem } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import { LocaleService } from '@univerjs/core';
import { Conditions } from '@univerjs/icons';
import { OpenConditionalFormatOperator, OPERATION } from '../commands/operations/open-conditional-format-panel';

export const FactoryManageConditionalFormatRule = (componentManager: ComponentManager) => {
    const key = 'conditional-format-menu-icon';
    componentManager.register(key, Conditions);
    return (_accessor: IAccessor) => {
        const localeService = _accessor.get(LocaleService);
        return {
            id: OpenConditionalFormatOperator.id,
            type: MenuItemType.SELECTOR,
            group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
            positions: [MenuPosition.TOOLBAR_START],
            icon: key,
            tooltip: localeService.t('sheet.cf.title'),
            selections: [
                {
                    label: localeService.t('sheet.cf.ruleType.highlightCell'),
                    value: OPERATION.highlightCell,
                },
                {
                    label: localeService.t('sheet.cf.panel.rankAndAverage'),
                    value: OPERATION.rank,
                },
                {
                    label: localeService.t('sheet.cf.ruleType.formula'),
                    value: OPERATION.formula,
                },
                {
                    label: localeService.t('sheet.cf.ruleType.colorScale'),
                    value: OPERATION.colorScale,
                },
                {
                    label: localeService.t('sheet.cf.ruleType.dataBar'),
                    value: OPERATION.dataBar,
                },
                {
                    label: localeService.t('sheet.cf.menu.manageConditionalFormat'),
                    value: OPERATION.viewRule,
                }, {
                    label: localeService.t('sheet.cf.menu.createConditionalFormat'),
                    value: OPERATION.createRule,
                },
                {
                    label: localeService.t('sheet.cf.menu.clearRangeRules'),
                    value: OPERATION.clearRangeRules,
                },
                {
                    label: localeService.t('sheet.cf.menu.clearWorkSheetRules'),
                    value: OPERATION.clearWorkSheetRules,
                }],
        } as IMenuSelectorItem;
    };
};
