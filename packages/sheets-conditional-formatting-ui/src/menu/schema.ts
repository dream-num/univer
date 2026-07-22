/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
import { RibbonDataGroup, RibbonInsertGroup } from '@univerjs/ui';
import { AddDataBarConditionalRuleCommand } from '../commands/commands/add-data-bar-cf.command';
import { AddIconSetConditionalRuleCommand } from '../commands/commands/add-icon-set-cf.command';
import { OpenConditionalFormattingOperator } from '../commands/operations/open-conditional-formatting-panel';
import { FactoryManageConditionalFormattingRule } from './manage-rule';
import { quickDataBarMenuFactory, quickIconSetMenuFactory } from './quick-insert.menu';

export const menuSchema: MenuSchemaType = {
    [RibbonInsertGroup.CELL]: {
        [AddDataBarConditionalRuleCommand.id]: {
            order: 3,
            menuItemFactory: quickDataBarMenuFactory,
        },
        [AddIconSetConditionalRuleCommand.id]: {
            order: 4,
            menuItemFactory: quickIconSetMenuFactory,
        },
    },
    [RibbonDataGroup.RULES]: {
        [OpenConditionalFormattingOperator.id]: {
            order: 1,
            gridLayout: { row: 2, column: 1, showLabel: true },
            menuItemFactory: FactoryManageConditionalFormattingRule,
        },
    },
};
