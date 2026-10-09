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

import type { LocaleService } from '@univerjs/core';
import type { IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import type { LocaleKey } from '../locale/types';
import { CFRuleType, CFSubRuleType } from '@univerjs/sheets-conditional-formatting';

/** Returns the localized description used by the built-in conditional formatting rule list. */
export function getRuleDescribe(rule: IConditionFormattingRule, localeService: LocaleService): string {
    const ruleConfig = rule.rule;
    switch (ruleConfig.type) {
        case CFRuleType.colorScale: {
            return localeService.t<LocaleKey>('sheets-conditional-formatting-ui.ruleType.colorScale');
        }
        case CFRuleType.dataBar: {
            return localeService.t<LocaleKey>('sheets-conditional-formatting-ui.ruleType.dataBar');
        }
        case CFRuleType.iconSet: {
            return localeService.t<LocaleKey>('sheets-conditional-formatting-ui.ruleType.iconSet');
        }
        case CFRuleType.highlightCell: {
            switch (ruleConfig.subType) {
                case CFSubRuleType.average: {
                    const operator = ruleConfig.operator;
                    return localeService.t<LocaleKey>(`sheets-conditional-formatting-ui.preview.describe.${operator}`, localeService.t<LocaleKey>('sheets-conditional-formatting-ui.subRuleType.average'));
                }
                case CFSubRuleType.duplicateValues: {
                    return localeService.t<LocaleKey>('sheets-conditional-formatting-ui.subRuleType.duplicateValues');
                }
                case CFSubRuleType.uniqueValues: {
                    return localeService.t<LocaleKey>('sheets-conditional-formatting-ui.subRuleType.uniqueValues');
                }
                case CFSubRuleType.number: {
                    const operator = ruleConfig.operator;
                    const values = Array.isArray(ruleConfig.value)
                        ? ruleConfig.value.map((value) => String(value))
                        : [String(ruleConfig.value ?? '')];
                    return localeService.t<LocaleKey>(`sheets-conditional-formatting-ui.preview.describe.${operator}`, ...values);
                }
                case CFSubRuleType.text: {
                    const operator = ruleConfig.operator;
                    return localeService.t<LocaleKey>(`sheets-conditional-formatting-ui.preview.describe.${operator}`, ruleConfig.value || '');
                }

                case CFSubRuleType.timePeriod: {
                    const operator = ruleConfig.operator;
                    return localeService.t<LocaleKey>(`sheets-conditional-formatting-ui.preview.describe.${operator}`);
                }
                case CFSubRuleType.rank: {
                    if (ruleConfig.isPercent) {
                        return localeService.t<LocaleKey>(ruleConfig.isBottom
                            ? 'sheets-conditional-formatting-ui.preview.describe.bottomNPercent'
                            : 'sheets-conditional-formatting-ui.preview.describe.topNPercent', String(ruleConfig.value));
                    }
                    return localeService.t<LocaleKey>(ruleConfig.isBottom
                        ? 'sheets-conditional-formatting-ui.preview.describe.bottomN'
                        : 'sheets-conditional-formatting-ui.preview.describe.topN', String(ruleConfig.value));
                }
                case CFSubRuleType.formula: {
                    return localeService.t<LocaleKey>('sheets-conditional-formatting-ui.ruleType.formula');
                }
            }
        }
    }
}
