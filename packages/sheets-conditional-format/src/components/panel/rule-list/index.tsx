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

import React, { useMemo, useState } from 'react';
import { Select } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { IUniverInstanceService, Rectangle } from '@univerjs/core';
import { SelectionManagerService } from '@univerjs/sheets';
import { serializeRange } from '@univerjs/engine-formula';
import { ConditionalFormatRuleModel } from '../../../models/conditional-format-rule-model';
import styles from '../index.module.less';
import type { IConditionFormatRule } from '../../../models/type';

interface IRuleListProps {
    onClick: (rule: IConditionFormatRule) => void;
};
export const RuleList = (props: IRuleListProps) => {
    const { onClick } = props;
    const conditionalFormatRuleModel = useDependency(ConditionalFormatRuleModel);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const selectionManagerService = useDependency(SelectionManagerService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();
    const unitId = workbook.getUnitId();
    const worksheet = workbook.getActiveSheet();
    const subUnitId = worksheet.getSheetId();
    const [selectValue, selectValueSet] = useState('2');
    const selectOption = [{ label: '所选择单元格', value: '1' }, { label: '整张工作表', value: '2' }];
    const ruleList = useMemo(() => {
        const ruleList = conditionalFormatRuleModel.getSubunitRules(unitId, subUnitId);
        if (!ruleList || !ruleList.length) {
            return [];
        }
        if (selectValue === '1') {
            const selection = selectionManagerService.getLast();
            if (!selection) {
                return [];
            }
            const range = selection.range;
            const _ruleList = ruleList.filter((rule) => {
                return rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, range));
            });
            return _ruleList;
        } else if (selectValue === '2') {
            return ruleList;
        }
        return [];
    }, [selectValue, subUnitId]);

    return (
        <>
            <div>
                <div>
                    管理
                    <span className={styles.select}>
                        <Select options={selectOption} value={selectValue} onChange={(v) => { selectValueSet(v); }} />
                    </span>

                    的规则
                </div>
                <div>
                    {ruleList.map((rule) => {
                        return (
                            <div className={styles.cfRuleItem} key={`cfId_${rule.cfId}`} onClick={() => onClick(rule)}>
                                <div>
                                    <div>rule描述</div>
                                    <div>{rule.ranges.map((range) => serializeRange(range)).join(',')}</div>
                                </div>
                                <div className={styles.preview}>预览 </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};
