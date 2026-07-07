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

import type { IRange, Workbook } from '@univerjs/core';
import type { IRemoveSheetMutationParams } from '@univerjs/sheets';
import type {
    IAddCfCommandParams,
    IConditionFormattingRule,
    ISetCfCommandParams,
} from '@univerjs/sheets-conditional-formatting';
import type { LocaleKey } from '../../locale/types';
import type { IStyleEditorProps } from './rule-edit/type';
import {
    ICommandService,
    InterceptorManager,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceType,
} from '@univerjs/core';
import { Button, Select } from '@univerjs/design';
import { deserializeRangeWithSheet, serializeRange } from '@univerjs/engine-formula';
import {
    RemoveSheetMutation,
    setEndForRange,
    SetWorksheetActiveOperation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import {
    AddCfCommand,
    CFRuleType,
    CFSubRuleType,
    ConditionalFormattingRuleModel,
    SetCfCommand,
} from '@univerjs/sheets-conditional-formatting';
import { RangeSelector } from '@univerjs/sheets-formula-ui';
import { useDependency } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ColorScaleStyleEditor } from './rule-edit/ColorScale';
import { DataBarStyleEditor } from './rule-edit/DataBar';
import { FormulaStyleEditor } from './rule-edit/Formula';
import { HighlightCellStyleEditor } from './rule-edit/HighlightCell';
import { IconSet } from './rule-edit/IconSet';
import { RankStyleEditor } from './rule-edit/Rank';
import { beforeSubmit, submit } from './rule-edit/type';

interface IRuleEditProps {
    rule?: IConditionFormattingRule;
    onCancel: () => void;
}

const getUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
const getSubUnitId = (univerInstanceService: IUniverInstanceService) => univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();

export const RuleEdit = (props: IRuleEditProps) => {
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const conditionalFormattingRuleModel = useDependency(ConditionalFormattingRuleModel);
    const selectionManagerService = useDependency(SheetsSelectionsService);
    const unitId = getUnitId(univerInstanceService);
    const subUnitId = getSubUnitId(univerInstanceService);

    const [errorText, setErrorText] = useState<string | undefined>(undefined);
    const rangeResult = useRef<IRange[]>(props.rule?.ranges ?? []);
    const rangeSelectorTouched = useRef(false);

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
        { label: localeService.t<LocaleKey>('sheets-conditional-formatting-ui.ruleType.highlightCell'), value: '1' },
        { label: localeService.t<LocaleKey>('sheets-conditional-formatting-ui.panel.rankAndAverage'), value: '2' },
        { label: localeService.t<LocaleKey>('sheets-conditional-formatting-ui.ruleType.dataBar'), value: '3' },
        { label: localeService.t<LocaleKey>('sheets-conditional-formatting-ui.ruleType.colorScale'), value: '4' },
        { label: localeService.t<LocaleKey>('sheets-conditional-formatting-ui.ruleType.formula'), value: '5' },
        { label: localeService.t<LocaleKey>('sheets-conditional-formatting-ui.ruleType.iconSet'), value: '6' },
    ];

    const [ruleType, setRuleType] = useState(() => {
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
    const result = useRef<Parameters<IStyleEditorProps['onChange']>>(undefined);
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
        if (!rangeSelectorTouched.current && rangeString.length < 1 && rangeResult.current.length > 0) {
            return;
        }

        rangeSelectorTouched.current = true;
        const result = rangeString.split(',').filter((e) => !!e).map(deserializeRangeWithSheet).map((item) => item.range);
        rangeResult.current = result;
    };

    const handleSubmit = () => {
        const getRanges = () => {
            const worksheet = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet();
            if (!worksheet) {
                throw new Error('No active sheet found');
            }
            const ranges = rangeResult.current.map((range) => setEndForRange(range, worksheet.getRowCount(), worksheet.getColumnCount()));
            const result = ranges.filter((range) => !(Number.isNaN(range.startRow) || Number.isNaN(range.startColumn)));
            return result;
        };
        const ranges = getRanges();
        if (ranges.length < 1) {
            setErrorText(localeService.t<LocaleKey>('sheets-conditional-formatting-ui.errorMessage.rangeError'));
            return;
        }
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
        if (!rangeSelectorTouched.current && !v && rangeText.length < 1) {
            setErrorText(undefined);
            return;
        }

        if (v) {
            if (rangeText.length < 1) {
                setErrorText(localeService.t<LocaleKey>('sheets-conditional-formatting-ui.errorMessage.rangeError'));
            } else {
                setErrorText(undefined);
            }
        } else {
            setErrorText(localeService.t<LocaleKey>('sheets-conditional-formatting-ui.errorMessage.rangeError'));
        }
    };
    return (
        <div>
            <div
                className={`
                  univer-mt-4 univer-text-sm univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                {localeService.t<LocaleKey>('sheets-conditional-formatting-ui.panel.range')}
            </div>
            <div className="univer-mt-4">
                <RangeSelector
                    unitId={unitId}
                    subUnitId={subUnitId}
                    initialValue={rangeString}
                    onChange={(_, text) => onRangeSelectorChange(text)}
                    onVerify={handleVerify}
                />
                {errorText && <div className="univer-mt-1 univer-text-xs univer-text-red-500">{errorText}</div>}
            </div>
            <div
                className={`
                  univer-mt-4 univer-text-sm univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                {localeService.t<LocaleKey>('sheets-conditional-formatting-ui.panel.styleType')}
            </div>
            <Select
                className="univer-mt-4 univer-w-full"
                value={ruleType}
                options={options}
                onChange={(e) => setRuleType(e)}
            />
            <StyleEditor
                interceptorManager={interceptorManager}
                rule={props.rule?.rule as any}
                onChange={onStyleChange}
            />
            <div className="univer-mt-4 univer-flex univer-justify-end univer-gap-2">
                <Button onClick={handleCancel}>{localeService.t<LocaleKey>('sheets-conditional-formatting-ui.panel.cancel')}</Button>
                <Button variant="primary" onClick={handleSubmit}>
                    {localeService.t<LocaleKey>('sheets-conditional-formatting-ui.panel.submit')}
                </Button>
            </div>
        </div>
    );
};
