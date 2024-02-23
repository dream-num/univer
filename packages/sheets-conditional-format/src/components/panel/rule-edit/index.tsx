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

import React, { useMemo, useRef, useState } from 'react';
import { ICommandService, InterceptorManager, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { Button, Select } from '@univerjs/design';
import { SelectionManagerService } from '@univerjs/sheets';
import { RangeSelector } from '@univerjs/sheets-ui';
import type { IConditionFormatRule } from '../../../models/type';
import { ConditionalFormatRuleModel } from '../../../models/conditional-format-rule-model';
import { RuleType, SubRuleType } from '../../../base/const';
import { addConditionalRuleMutation } from '../../../commands/mutations/addConditionalRule.mutation';
import { setConditionalRuleMutation } from '../../../commands/mutations/setConditionalRule.mutation';

import type { IStyleEditorProps } from './type';
import { beforeSubmit, submit } from './type';
import { ColorScaleStyleEditor } from './colorScale';
import { DataBarStyleEditor } from './dataBar';
import { RankStyleEditor } from './rank';
import { HighlightCellStyleEditor } from './highlightCell';

interface IRuleEditProps {
    rule?: IConditionFormatRule;
    onCancel: () => void;
}

export const RuleEdit = (props: IRuleEditProps) => {
    const localeService = useDependency(LocaleService);
    const selectionManagerService = useDependency(SelectionManagerService);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const conditionalFormatRuleModel = useDependency(ConditionalFormatRuleModel);

    const options = [
        { label: localeService.t('sheet.cf.ruleType.highlightCell'), value: '1' },
        { label: localeService.t('sheet.cf.panel.rankAndAverage'), value: '2' },
        { label: localeService.t('sheet.cf.ruleType.dataBar'), value: '3' },
        { label: localeService.t('sheet.cf.ruleType.colorScale'), value: '4' }];

    const [ruleType, ruleTypeSet] = useState(() => {
        const type = props.rule?.rule.type;
        const defaultType = options[0].value;
        if (!type) {
            return defaultType;
        }
        switch (type) {
            case RuleType.highlightCell:{
                const subType = props.rule?.rule.subType;
                switch (subType) {
                    case SubRuleType.number:
                    case SubRuleType.text:
                    case SubRuleType.duplicateValues:
                    case SubRuleType.uniqueValues:
                    case SubRuleType.timePeriod:{
                        return '1';
                    }
                    case SubRuleType.average:
                    case SubRuleType.rank:{
                        return '2';
                    }
                }
                break;
            }
            case RuleType.dataBar:{
                return '3';
            }
            case RuleType.colorScale:{
                return '4';
            }
        }
        return defaultType;
    });
    const result = useRef < Parameters<IStyleEditorProps['onChange']>>();
    const interceptorManager = useMemo(() => {
        const _interceptorManager = new InterceptorManager({ beforeSubmit, submit });
        // 默认返回 true
        _interceptorManager.intercept(_interceptorManager.getInterceptPoints().beforeSubmit, {
            priority: -1,
            handler: (v) => v,
        });
        _interceptorManager.intercept(_interceptorManager.getInterceptPoints().submit, {
            priority: -1,
            handler: (v) => null,
        });
        return _interceptorManager;
    }, []);

    const StyleEditor = useMemo(() => {
        switch (ruleType) {
            case '1':{
                return HighlightCellStyleEditor;
            }
            case '2':{
                return RankStyleEditor;
            }
            case '3':{
                return DataBarStyleEditor;
            }
            case '4':{
                return ColorScaleStyleEditor;
            }
            default :{
                return HighlightCellStyleEditor;
            }
        }
    }, [ruleType]);

    const onStyleChange = (config: Parameters<IStyleEditorProps['onChange']>) => {
        result.current = config;
    };

    const onRangeSelectorActive = (isActive: boolean) => {
    };
    const onRangeSelectorChange = (range: string) => {
    };

    const handleSubmit = () => {
        const beforeSubmitResult = interceptorManager.fetchThroughInterceptors(interceptorManager.getInterceptPoints().beforeSubmit)(true, null);
        const getRanges = () => {
            const selections = selectionManagerService.getSelections();
            return selections && selections.map((selection) => selection.range);
        };

        if (beforeSubmitResult) {
            const result = interceptorManager.fetchThroughInterceptors(interceptorManager.getInterceptPoints().submit)(null, null);
            const ranges = getRanges();
            const unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
            const subUnitId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
            if (result && ranges) {
                let rule = {} as IConditionFormatRule;
                if (props.rule && props.rule.cfId) {
                    rule = { ...props.rule, ranges, rule: result };
                    commandService.executeCommand(setConditionalRuleMutation.id, { unitId, subUnitId, rule });
                } else {
                    const cfId = conditionalFormatRuleModel.createCfId(unitId, subUnitId);
                    rule = { cfId, ranges, rule: result, stopIfTrue: false };
                    commandService.executeCommand(addConditionalRuleMutation.id, { unitId, subUnitId, rule });
                    props.onCancel();
                }
            }
        }
    };
    const handleCancel = () => {
        props.onCancel();
    };
    return (
        <div>
            <div>{localeService.t('sheet.cf.panel.range')}</div>
            <div>
                <RangeSelector onActive={onRangeSelectorActive} onChange={onRangeSelectorChange} />
            </div>
            <div>{localeService.t('sheet.cf.panel.styleType')}</div>
            <div>
                <Select key="style" value={ruleType} options={options} onChange={(e) => ruleTypeSet(e)} />
            </div>
            <StyleEditor interceptorManager={interceptorManager} rule={props.rule?.rule as any} onChange={onStyleChange} />
            <div>
                <Button size="small" onClick={handleSubmit}>{localeService.t('sheet.cf.panel.submit')}</Button>
                <Button size="small" onClick={handleCancel}>{localeService.t('sheet.cf.panel.cancel')}</Button>
            </div>
        </div>
    );
};
