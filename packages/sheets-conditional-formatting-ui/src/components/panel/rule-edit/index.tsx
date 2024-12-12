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

import type { IRange, Workbook } from '@univerjs/core';
import type { IRemoveSheetMutationParams } from '@univerjs/sheets';
import type { IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import type { IAddCfCommandParams } from '../../../commands/commands/add-cf.command';
import type { ISetCfCommandParams } from '../../../commands/commands/set-cf.command';

import type { IStyleEditorProps } from './type';
import { ICommandService, InterceptorManager, IUniverInstanceService, LocaleService, UniverInstanceType, useDependency } from '@univerjs/core';
import { Button, Select } from '@univerjs/design';
import { deserializeRangeWithSheet, serializeRange } from '@univerjs/engine-formula';
import { RemoveSheetMutation, setEndForRange, SetWorksheetActiveOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { CFRuleType, CFSubRuleType, ConditionalFormattingRuleModel } from '@univerjs/sheets-conditional-formatting';
import { RangeSelector } from '@univerjs/sheets-formula-ui';
import { useSidebarClick } from '@univerjs/ui';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AddCfCommand } from '../../../commands/commands/add-cf.command';

import { SetCfCommand } from '../../../commands/commands/set-cf.command';
import styleBase from '../index.module.less';
import { ColorScaleStyleEditor } from './colorScale';
import { DataBarStyleEditor } from './dataBar';
import { FormulaStyleEditor } from './formula';
import { HighlightCellStyleEditor } from './highlightCell';
import { IconSet } from './iconSet';
import styles from './index.module.less';
import { RankStyleEditor } from './rank';
import { beforeSubmit, submit } from './type';

interface IRuleEditProps {
    rule?: IConditionFormattingRule;
    onCancel: () => void;
}

const getUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
const getSubUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();

export const RuleEdit = (props: IRuleEditProps) => {
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const conditionalFormattingRuleModel = useDependency(ConditionalFormattingRuleModel);
    const selectionManagerService = useDependency(SheetsSelectionsService);
    const unitId = getUnitId(univerInstanceService);
    const subUnitId = getSubUnitId(univerInstanceService);

    const [isFocusRangeSelector, isFocusRangeSelectorSet] = useState(true);
    const rangeSelectorActionsRef = useRef<Parameters<typeof RangeSelector>[0]['actions']>({});
    const [errorText, errorTextSet] = useState<string | undefined>(undefined);
    const rangeResult = useRef<IRange[]>(props.rule?.ranges ?? []);

    const rangeString = useMemo(() => {
        let ranges = props.rule?.ranges;
        if (!ranges?.length) {
            ranges = selectionManagerService.getCurrentSelections()?.map((s) => s.range) ?? [];
        }
        rangeResult.current = ranges;
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
            case CFRuleType.highlightCell: {
                const subType = props.rule?.rule.subType;
                switch (subType) {
                    case CFSubRuleType.number:
                    case CFSubRuleType.text:
                    case CFSubRuleType.duplicateValues:
                    case CFSubRuleType.uniqueValues:
                    case CFSubRuleType.timePeriod: {
                        return '1';
                    }
                    case CFSubRuleType.average:
                    case CFSubRuleType.rank: {
                        return '2';
                    }
                    case CFSubRuleType.formula: {
                        return '5';
                    }
                }
                break;
            }
            case CFRuleType.dataBar: {
                return '3';
            }
            case CFRuleType.colorScale: {
                return '4';
            }
            case CFRuleType.iconSet: {
                return '6';
            }
        }
        return defaultType;
    });
    const result = useRef<Parameters<IStyleEditorProps['onChange']>>();
    const interceptorManager = useMemo(() => {
        const _interceptorManager = new InterceptorManager({ beforeSubmit, submit });
        return _interceptorManager;
    }, []);

    const StyleEditor = useMemo(() => {
        switch (ruleType) {
            case '1': {
                return HighlightCellStyleEditor;
            }
            case '2': {
                return RankStyleEditor;
            }
            case '3': {
                return DataBarStyleEditor;
            }
            case '4': {
                return ColorScaleStyleEditor;
            }
            case '5': {
                return FormulaStyleEditor;
            }
            case '6': {
                return IconSet;
            }
            default: {
                return HighlightCellStyleEditor;
            }
        }
    }, [ruleType]);

    useEffect(() => {
        // If the child table which  the rule being edited is deleted, exit edit mode
        const disposable = commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === RemoveSheetMutation.id) {
                const params = commandInfo.params as IRemoveSheetMutationParams;
                if (params.subUnitId === subUnitId && params.unitId === unitId) {
                    props.onCancel();
                }
            }
            if (commandInfo.id === SetWorksheetActiveOperation.id) {
                props.onCancel();
            }
        });
        return () => disposable.dispose();
    }, []);

    const onStyleChange = (config: unknown) => {
        result.current = config as Parameters<IStyleEditorProps['onChange']>;
    };

    const onRangeSelectorChange = (rangeString: string) => {
        const result = rangeString.split(',').filter((e) => !!e).map(deserializeRangeWithSheet).map((item) => item.range);
        rangeResult.current = result;
    };

    const handleSubmit = () => {
        if (errorText) {
            return;
        }
        const getRanges = () => {
            const worksheet = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet();
            if (!worksheet) {
                throw new Error('No active sheet found');
            }
            const ranges = rangeResult.current.map((range) => setEndForRange(range, worksheet.getRowCount(), worksheet.getColumnCount()));
            const result = ranges.filter((range) => !(Number.isNaN(range.startRow) || Number.isNaN(range.startColumn)));
            return result;
        };
        const ranges = getRanges();
        const beforeSubmitResult = interceptorManager.fetchThroughInterceptors(interceptorManager.getInterceptPoints().beforeSubmit)(true, null);
        if (beforeSubmitResult) {
            const result = interceptorManager.fetchThroughInterceptors(interceptorManager.getInterceptPoints().submit)(null, null);
            if (result) {
                // When you switch the child table, you need to fetch it again here, instead of using the
                const unitId = getUnitId(univerInstanceService);
                const subUnitId = getSubUnitId(univerInstanceService);
                if (!unitId || !subUnitId) {
                    throw new Error('No active sheet found');
                }
                let rule = {} as IConditionFormattingRule;
                if (props.rule && props.rule.cfId) {
                    rule = { ...props.rule, ranges, rule: result };
                    commandService.executeCommand(SetCfCommand.id, { unitId, subUnitId, rule } as ISetCfCommandParams);
                    props.onCancel();
                } else {
                    const cfId = conditionalFormattingRuleModel.createCfId(unitId, subUnitId);
                    rule = { cfId, ranges, rule: result, stopIfTrue: false };
                    commandService.executeCommand(AddCfCommand.id, { unitId, subUnitId, rule } as IAddCfCommandParams);
                    props.onCancel();
                }
            }
        }
    };

    const handleCancel = () => {
        props.onCancel();
    };

    const handleVerify = (v: boolean, rangeText: string) => {
        if (v) {
            if (rangeText.length < 1) {
                errorTextSet(localeService.t('sheet.cf.errorMessage.rangeError'));
            } else {
                errorTextSet(undefined);
            }
        } else {
            errorTextSet(localeService.t('sheet.cf.errorMessage.rangeError'));
        }
    };

    useSidebarClick((e: MouseEvent) => {
        const handleOutClick = rangeSelectorActionsRef.current?.handleOutClick;
        handleOutClick && handleOutClick(e, () => isFocusRangeSelectorSet(false));
    });

    return (
        <div className={styles.cfRuleStyleEditor}>
            <div className={styleBase.title}>{localeService.t('sheet.cf.panel.range')}</div>
            <div className={`
              ${styleBase.mTBase}
            `}
            >
                <RangeSelector
                    unitId={unitId}
                    errorText={errorText}
                    subUnitId={subUnitId}
                    initValue={rangeString}
                    onChange={onRangeSelectorChange}
                    onVerify={handleVerify}
                    onFocus={() => isFocusRangeSelectorSet(true)}
                    isFocus={isFocusRangeSelector}
                    actions={rangeSelectorActionsRef.current}
                />
            </div>
            <div className={styleBase.title}>{localeService.t('sheet.cf.panel.styleType')}</div>
            <div className={styleBase.mTBase}>
                <Select className={styles.width100} value={ruleType} options={options} onChange={(e) => ruleTypeSet(e)} />
            </div>
            <StyleEditor interceptorManager={interceptorManager} rule={props.rule?.rule as any} onChange={onStyleChange} />
            <div className={`
              ${styleBase.mTBase}
              ${styles.btnList}
            `}
            >
                <Button size="small" onClick={handleCancel}>{localeService.t('sheet.cf.panel.cancel')}</Button>
                <Button className={styleBase.mLSm} size="small" type="primary" onClick={handleSubmit}>{localeService.t('sheet.cf.panel.submit')}</Button>
            </div>
        </div>
    );
};
