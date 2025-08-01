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

import type { IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import { useState } from 'react';
import { RuleEdit } from './rule-edit';
import { RuleList } from './rule-list';

interface IConditionFormattingPanelProps { rule?: IConditionFormattingRule };

export const ConditionFormattingPanel = (props: IConditionFormattingPanelProps) => {
    const [currentEditRule, setCurrentEditRule] = useState<IConditionFormattingRule | undefined>(props.rule);
    const [isShowRuleEditor, setIsShowRuleEditor] = useState(!!props.rule);

    const createCfRule = () => {
        setIsShowRuleEditor(true);
    };

    const handleCancel = () => {
        setIsShowRuleEditor(false);
        setCurrentEditRule(undefined);
    };

    const handleRuleClick = (rule: IConditionFormattingRule) => {
        setCurrentEditRule(rule);
        setIsShowRuleEditor(true);
    };

    return (
        <div className="univer-flex univer-h-full univer-flex-col univer-justify-between univer-py-4">
            {isShowRuleEditor
                ? (
                    <RuleEdit onCancel={handleCancel} rule={currentEditRule} />
                )
                : (
                    <RuleList onClick={handleRuleClick} onCreate={createCfRule} />
                )}
        </div>
    );
};
