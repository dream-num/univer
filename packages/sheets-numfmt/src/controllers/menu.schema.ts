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

import type { MenuSchemaType } from '@univerjs/ui';
import { RibbonStartGroup } from '@univerjs/ui';
import { SetCurrencyCommand } from '../commands/commands/set-currency.command';
import { AddDecimalMenuItem, CurrencyMenuItem, FactoryOtherMenuItem, PercentMenuItem, SubtractDecimalMenuItem } from '../menu/menu';
import { SubtractDecimalCommand } from '../commands/commands/subtract-decimal.command';
import { SetPercentCommand } from '../commands/commands/set-percent.command';
import { OpenNumfmtPanelOperator } from '../commands/operations/open.numfmt.panel.operation';
import { AddDecimalCommand } from '../commands/commands/add-decimal.command';

export const menuSchema: MenuSchemaType = {
    [RibbonStartGroup.FORMULAS_INSERT]: {
        [SetCurrencyCommand.id]: {
            order: 4,
            menuItemFactory: CurrencyMenuItem,
        },
        [AddDecimalCommand.id]: {
            order: 5,
            menuItemFactory: AddDecimalMenuItem,
        },
        [SubtractDecimalCommand.id]: {
            order: 6,
            menuItemFactory: SubtractDecimalMenuItem,
        },
        [SetPercentCommand.id]: {
            order: 7,
            menuItemFactory: PercentMenuItem,
        },
        [OpenNumfmtPanelOperator.id]: {
            order: 8,
            menuItemFactory: FactoryOtherMenuItem,
        },
    },
};
