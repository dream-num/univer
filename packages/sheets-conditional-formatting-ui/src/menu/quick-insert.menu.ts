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

import type { IAccessor } from '@univerjs/core';
import type { IIconSet } from '@univerjs/sheets-conditional-formatting';
import type { IMenuSelectorItem } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import { UniverInstanceType } from '@univerjs/core';
import {
    RangeProtectionPermissionEditPoint,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
} from '@univerjs/sheets';
import {
    CFNumberOperator,
    CFRuleType,
    CFValueType,
    ClearRangeCfCommand,
    defaultDataBarNativeColor,
    defaultDataBarPositiveColor,
    IIconSetType,
} from '@univerjs/sheets-conditional-formatting';
import { getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { AddDataBarConditionalRuleCommand } from '../commands/commands/add-data-bar-cf.command';
import { AddIconSetConditionalRuleCommand } from '../commands/commands/add-icon-set-cf.command';
import { CF_MENU_OPERATION, OpenConditionalFormattingOperator } from '../commands/operations/open-conditional-formatting-panel';

const DATA_BAR_PARAMS = {
    min: { type: CFValueType.min },
    max: { type: CFValueType.max },
    nativeColor: defaultDataBarNativeColor,
    positiveColor: defaultDataBarPositiveColor,
    isGradient: false,
    isShowValue: true,
};

function createIconSetParams(iconType: IIconSetType): { config: IIconSet['config']; isShowValue: boolean } {
    return {
        config: [
            {
                iconType,
                iconId: '0',
                operator: CFNumberOperator.greaterThanOrEqual,
                value: { type: CFValueType.percent, value: 67 },
            },
            {
                iconType,
                iconId: '1',
                operator: CFNumberOperator.greaterThanOrEqual,
                value: { type: CFValueType.percent, value: 33 },
            },
            {
                iconType,
                iconId: '2',
                operator: CFNumberOperator.lessThanOrEqual,
                value: { type: CFValueType.percent, value: Number.MAX_SAFE_INTEGER },
            },
        ],
        isShowValue: true,
    };
}

function getQuickConditionalFormattingMenuState(accessor: IAccessor) {
    return {
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
}

export function quickDataBarMenuFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    return {
        id: AddDataBarConditionalRuleCommand.id,
        type: MenuItemType.BUTTON_SELECTOR,
        icon: 'DataBarIcon',
        tooltip: 'sheets-conditional-formatting-ui.ruleType.dataBar',
        params: DATA_BAR_PARAMS,
        selectionsCommandId: AddDataBarConditionalRuleCommand.id,
        selections: [
            {
                label: 'sheets-conditional-formatting-ui.ruleType.dataBar',
                value: CFRuleType.dataBar,
                params: DATA_BAR_PARAMS,
            },
            {
                id: OpenConditionalFormattingOperator.id,
                label: 'sheets-conditional-formatting-ui.menu.createConditionalFormatting',
                value: CF_MENU_OPERATION.dataBar,
                params: { value: CF_MENU_OPERATION.dataBar },
            },
            {
                id: ClearRangeCfCommand.id,
                label: 'sheets-conditional-formatting-ui.menu.clearRangeRules',
                value: CFRuleType.dataBar,
                params: { types: [CFRuleType.dataBar] },
            },
        ],
        ...getQuickConditionalFormattingMenuState(accessor),
    };
}

export function quickIconSetMenuFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    const ratingParams = createIconSetParams(IIconSetType.threeStars);

    return {
        id: AddIconSetConditionalRuleCommand.id,
        type: MenuItemType.BUTTON_SELECTOR,
        icon: 'RatingIcon',
        tooltip: 'sheets-conditional-formatting-ui.ruleType.iconSet',
        params: ratingParams,
        selectionsCommandId: AddIconSetConditionalRuleCommand.id,
        selections: [
            {
                label: 'sheets-conditional-formatting-ui.iconSet.rank',
                value: IIconSetType.threeStars,
                params: ratingParams,
            },
            {
                label: 'sheets-conditional-formatting-ui.iconSet.shape',
                value: IIconSetType.threeTrafficLights1,
                params: createIconSetParams(IIconSetType.threeTrafficLights1),
            },
            {
                label: 'sheets-conditional-formatting-ui.iconSet.direction',
                value: IIconSetType.threeArrows,
                params: createIconSetParams(IIconSetType.threeArrows),
            },
            {
                id: OpenConditionalFormattingOperator.id,
                label: 'sheets-conditional-formatting-ui.menu.createConditionalFormatting',
                value: CF_MENU_OPERATION.icon,
                params: { value: CF_MENU_OPERATION.icon },
            },
            {
                id: ClearRangeCfCommand.id,
                label: 'sheets-conditional-formatting-ui.menu.clearRangeRules',
                value: CFRuleType.iconSet,
                params: { types: [CFRuleType.iconSet] },
            },
        ],
        ...getQuickConditionalFormattingMenuState(accessor),
    };
}
