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
import type { IRange, IUnitRange } from '@univerjs/core';
import { ICommandService, InterceptorManager, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { serializeRange } from '@univerjs/engine-formula';
import { Button, Select } from '@univerjs/design';

import { RangeSelector } from '@univerjs/ui';
import { SelectionManagerService } from '@univerjs/sheets';
import type { IConditionFormatRule } from '../../../models/type';
import { ConditionalFormatRuleModel } from '../../../models/conditional-format-rule-model';
import { RuleType, SHEET_CONDITION_FORMAT_PLUGIN, SubRuleType } from '../../../base/const';
import type { IAddCfCommandParams } from '../../../commands/commands/add-cf.command';
import { addCfCommand } from '../../../commands/commands/add-cf.command';
import type { ISetCfCommandParams } from '../../../commands/commands/set-cf.command';
import { setCfCommand } from '../../../commands/commands/set-cf.command';

import styleBase from '../index.module.less';
import type { IStyleEditorProps } from './type';
import { beforeSubmit, submit } from './type';
import { ColorScaleStyleEditor } from './colorScale';
import { DataBarStyleEditor } from './dataBar';
import { RankStyleEditor } from './rank';
import { HighlightCellStyleEditor } from './highlightCell';
import { FormulaStyleEditor } from './formula';
import styles from './index.module.less';
import { IconSet } from './iconSet';

interface IRuleEditProps {
    rule?: IConditionFormatRule;
    onCancel: () => void;
}

const getUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
const getSubUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();

export const RuleEdit = (props: IRuleEditProps) => {
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const conditionalFormatRuleModel = useDependency(ConditionalFormatRuleModel);
    const selectionManagerService = useDependency(SelectionManagerService);

    const unitId = getUnitId(univerInstanceService);
    const subUnitId = getSubUnitId(univerInstanceService);

    const rangeResult = useRef<IRange[]>([]);
    const rangeString = useMemo(() => {
        let ranges = props.rule?.ranges;
        if (!ranges?.length) {
            ranges = selectionManagerService.getSelectionRanges() ?? [];
        }
        if (!ranges?.length) {
            return '';
        }
        return ranges.map((range) => {
            const v = serializeRange(range);
            return v === 'NaN' ? '' : v;
        }).filter((r) => !!r).join(',');
    }, [props.rule]);

    const options = [
        { label: localeService.t('sheet.cf.ruleType.highlightCell'), value: '1' },
        { label: localeService.t('sheet.cf.panel.rankAndAverage'), value: '2' },
        { label: localeService.t('sheet.cf.ruleType.dataBar'), value: '3' },
        { label: localeService.t('sheet.cf.ruleType.colorScale'), value: '4' },
        { label: localeService.t('sheet.cf.ruleType.formula'), value: '5' },
        { label: localeService.t('sheet.cf.ruleType.iconSet'), value: '6' }];

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
                    case SubRuleType.formula:{
                        return '5';
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
            case RuleType.iconSet:{
                return '6';
            }
        }
        return defaultType;
    });
    const result = useRef < Parameters<IStyleEditorProps['onChange']>>();
    const interceptorManager = useMemo(() => {
        const _interceptorManager = new InterceptorManager({ beforeSubmit, submit });
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
            case '5':{
                return FormulaStyleEditor;
            }
            case '6':{
                return IconSet;
            }
            default :{
                return HighlightCellStyleEditor;
            }
        }
    }, [ruleType]);

    const onStyleChange = (config: unknown) => {
        result.current = config as Parameters<IStyleEditorProps['onChange']>;
    };

    const onRangeSelectorChange = (ranges: IUnitRange[]) => {
        rangeResult.current = ranges.map((r) => r.range);
    };

    const handleSubmit = () => {
        const beforeSubmitResult = interceptorManager.fetchThroughInterceptors(interceptorManager.getInterceptPoints().beforeSubmit)(true, null);
        const getRanges = () => {
            const ranges = rangeResult.current;
            const isError = ranges.some((range) => Number.isNaN(range.startRow) || Number.isNaN(range.startColumn));
            return isError ? [] : ranges;
        };

        if (beforeSubmitResult) {
            const result = interceptorManager.fetchThroughInterceptors(interceptorManager.getInterceptPoints().submit)(null, null);
            const ranges = getRanges();
            if (result && ranges.length) {
                // When you switch the child table, you need to fetch it again here, instead of using the
                const unitId = getUnitId(univerInstanceService);
                const subUnitId = getSubUnitId(univerInstanceService);
                let rule = {} as IConditionFormatRule;
                if (props.rule && props.rule.cfId) {
                    rule = { ...props.rule, ranges, rule: result };
                    commandService.executeCommand(setCfCommand.id, { unitId, subUnitId, rule } as ISetCfCommandParams);
                    props.onCancel();
                } else {
                    const cfId = conditionalFormatRuleModel.createCfId(unitId, subUnitId);
                    rule = { cfId, ranges, rule: result, stopIfTrue: false };
                    commandService.executeCommand(addCfCommand.id, { unitId, subUnitId, rule } as IAddCfCommandParams);
                    props.onCancel();
                }
            }
        }
    };
    const handleCancel = () => {
        props.onCancel();
    };
    return (
        <div className={styles.cfRuleStyleEditor}>
            <div className={styleBase.title}>{localeService.t('sheet.cf.panel.range')}</div>
            <div className={`${styleBase.mTBase}`}>
                <RangeSelector placeholder="选择范围或者输入值" width={'100%' as unknown as number} openForSheetSubUnitId={subUnitId} openForSheetUnitId={unitId} value={rangeString} id={`${SHEET_CONDITION_FORMAT_PLUGIN}_rangeSelector`} onChange={onRangeSelectorChange} />
            </div>
            <div className={styleBase.title}>{localeService.t('sheet.cf.panel.styleType')}</div>
            <div className={styleBase.mTBase}>
                <Select className={styles.width100} value={ruleType} options={options} onChange={(e) => ruleTypeSet(e)} />
            </div>
            <StyleEditor interceptorManager={interceptorManager} rule={props.rule?.rule as any} onChange={onStyleChange} />
            <div className={`${styleBase.mTBase} ${styles.btnList}`}>
                <Button size="small" onClick={handleCancel}>{localeService.t('sheet.cf.panel.cancel')}</Button>
                <Button className={styleBase.mLSm} size="small" type="primary" onClick={handleSubmit}>{localeService.t('sheet.cf.panel.submit')}</Button>
            </div>
        </div>
    );
};
