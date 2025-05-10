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

import type { Workbook } from '@univerjs/core';
import type { IColorScale, IConditionalFormattingRuleConfig } from '@univerjs/sheets-conditional-formatting';
import type { IFormulaEditorRef } from '@univerjs/sheets-formula-ui';
import type { IStyleEditorProps } from './type';
import { IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { borderClassName, clsx, InputNumber, Select } from '@univerjs/design';
import { CFRuleType, CFValueType, createDefaultValueByValueType } from '@univerjs/sheets-conditional-formatting';
import { FormulaEditor } from '@univerjs/sheets-formula-ui';
import { useDependency, useSidebarClick } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ColorPicker } from '../../color-picker';
import { Preview } from '../../preview';
import { previewClassName } from './styles';

const createOptionItem = (text: string, localeService: LocaleService) => ({ label: localeService.t(`sheet.cf.valueType.${text}`), value: text });

const TextInput = (props: { id: string; type: CFValueType | 'none'; value: number | string; onChange: (v: number | string) => void; className: string }) => {
    const { type, className, onChange, id, value } = props;
    const univerInstanceService = useDependency(IUniverInstanceService);
    const unitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
    const subUnitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();
    const formulaInitValue = useMemo(() => {
        return String(value).startsWith('=') ? String(value) : '=';
    }, [value]);

    const config = useMemo(() => {
        if ([CFValueType.max, CFValueType.min, 'none'].includes(type as CFValueType)) {
            return { disabled: true };
        }
        if ([CFValueType.percent, CFValueType.percentile].includes(type as CFValueType)) {
            return {
                min: 0,
                max: 100,
            };
        }
        return {
            min: Number.MIN_SAFE_INTEGER,
            max: Number.MAX_SAFE_INTEGER,
        };
    }, [type]);

    const formulaEditorRef = useRef<IFormulaEditorRef>(null);
    const [isFocusFormulaEditor, setIsFocusFormulaEditor] = useState(false);

    useSidebarClick((e: MouseEvent) => {
        const isOutSide = formulaEditorRef.current?.isClickOutSide(e);
        isOutSide && setIsFocusFormulaEditor(false);
    });

    if (type === CFValueType.formula) {
        return (
            <div className="univer-ml-1 univer-w-full">
                <FormulaEditor
                    ref={formulaEditorRef}
                    className={clsx(`
                      univer-box-border univer-h-8 univer-w-full univer-cursor-pointer univer-items-center
                      univer-rounded-lg univer-bg-white univer-pt-2 univer-transition-colors
                      [&>div:first-child]:univer-px-2.5
                      [&>div]:univer-h-5 [&>div]:univer-ring-transparent
                      dark:univer-bg-gray-700 dark:univer-text-white
                      hover:univer-border-primary-600
                    `, borderClassName)}
                    initValue={formulaInitValue as any}
                    unitId={unitId}
                    subUnitId={subUnitId}
                    isFocus={isFocusFormulaEditor}
                    onChange={(v = '') => {
                        const formula = v || '';
                        onChange(formula);
                    }}
                    onFocus={() => setIsFocusFormulaEditor(true)}
                />
            </div>
        );
    } else {
        return <InputNumber className={className} value={Number(props.value) || 0} onChange={(v) => props.onChange(v || 0)} {...config} />;
    }
};
export const ColorScaleStyleEditor = (props: IStyleEditorProps) => {
    const { interceptorManager } = props;
    const localeService = useDependency(LocaleService);

    const rule = props.rule?.type === CFRuleType.colorScale ? props.rule : undefined as IColorScale | undefined;
    const commonOptions = [createOptionItem(CFValueType.num, localeService), createOptionItem(CFValueType.percent, localeService), createOptionItem(CFValueType.percentile, localeService), createOptionItem(CFValueType.formula, localeService)];
    const minOptions = [createOptionItem(CFValueType.min, localeService), ...commonOptions];
    const medianOptions = [createOptionItem('none', localeService), ...commonOptions];
    const maxOptions = [createOptionItem(CFValueType.max, localeService), ...commonOptions];

    const [minType, setMinType] = useState(() => {
        const defaultV = CFValueType.min;
        if (!rule) {
            return defaultV;
        }
        return rule.config[0]?.value.type || defaultV;
    });
    const [medianType, setMedianType] = useState<CFValueType | 'none'>(() => {
        const defaultV = 'none';
        if (!rule) {
            return defaultV;
        }
        if (rule.config.length !== 3) {
            return defaultV;
        }
        return rule.config[1]?.value.type || defaultV;
    });
    const [maxType, setMaxType] = useState(() => {
        const defaultV = CFValueType.max;
        if (!rule) {
            return defaultV;
        }
        return rule.config[rule.config.length - 1]?.value.type || defaultV;
    });

    const [minValue, setMinValue] = useState(() => {
        const defaultV = 10;
        if (!rule) {
            return defaultV;
        }
        const valueConfig = rule.config[0];
        return valueConfig?.value.value === undefined ? defaultV : valueConfig?.value.value;
    });
    const [medianValue, setMedianValue] = useState(() => {
        const defaultV = 50;
        if (!rule) {
            return defaultV;
        }
        if (rule.config.length !== 3) {
            return defaultV;
        }
        const v = rule.config[1]?.value.value;
        return v === undefined ? defaultV : v;
    });
    const [maxValue, setMaxValue] = useState(() => {
        const defaultV = 90;
        if (!rule) {
            return defaultV;
        }
        const v = rule.config[rule.config.length - 1]?.value.value;
        return v === undefined ? defaultV : v;
    });

    const [minColor, setMinColor] = useState(() => {
        const defaultV = '#d0d9fb';
        if (!rule) {
            return defaultV;
        }
        return rule.config[0]?.color || defaultV;
    });
    const [medianColor, setMedianColor] = useState(() => {
        const defaultV = '#7790f3';
        if (!rule) {
            return defaultV;
        }
        if (rule.config.length !== 3) {
            return defaultV;
        }
        return rule.config[1]?.color || defaultV;
    });
    const [maxColor, setMaxColor] = useState(() => {
        const defaultV = '#2e55ef';
        if (!rule) {
            return defaultV;
        }
        return rule.config[rule.config.length - 1]?.color || defaultV;
    });

    const getResult = useMemo(() => (option: {
        minType: typeof minType;
        medianType: typeof medianType;
        maxType: typeof maxType;
        minValue: number | string;
        medianValue: number | string;
        maxValue: number | string;
        minColor: string;
        medianColor: string;
        maxColor: string;
    }) => {
        const { minType, medianType, maxType, minValue, medianValue, maxValue, minColor, medianColor, maxColor } = option;
        const list = [];
        list.push({ color: minColor, value: { type: minType, value: minValue } });
        medianType !== 'none' && list.push({ color: medianColor, value: { type: medianType, value: medianValue } });
        list.push({ color: maxColor, value: { type: maxType, value: maxValue } });
        const config: IColorScale['config'] = list.map((item, index) => ({ ...item, index }));
        return { config, type: CFRuleType.colorScale };
    }, []);

    useEffect(() => {
        const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().submit, {
            handler() {
                return getResult({ minType, medianType, maxType, minValue, medianValue, maxValue, minColor, medianColor, maxColor });
            },
        });
        return dispose as () => void;
    }, [getResult, minType, medianType, maxType, minValue, medianValue, maxValue, minColor, medianColor, maxColor, interceptorManager]);

    const handleChange = (option: {
        minType: typeof minType;
        medianType: typeof medianType;
        maxType: typeof maxType;
        minValue: number | string;
        medianValue: number | string;
        maxValue: number | string;
        minColor: string;
        medianColor: string;
        maxColor: string;
    }) => {
        props.onChange(getResult(option));
    };
    return (
        <div>
            <div
                className={`
                  univer-mt-4 univer-text-sm univer-text-gray-600
                  dark:univer-text-gray-200
                `}
            >
                {localeService.t('sheet.cf.panel.styleRule')}
            </div>
            <div className={previewClassName}>
                <Preview rule={getResult({ minType, medianType, maxType, minValue, medianValue, maxValue, minColor, medianColor, maxColor }) as IConditionalFormattingRuleConfig} />
            </div>
            <div
                className={`
                  univer-mt-3 univer-text-xs univer-text-gray-600
                  dark:univer-text-gray-200
                `}
            >
                {localeService.t('sheet.cf.valueType.min')}
            </div>
            <div className="univer-mt-3 univer-flex univer-h-8 univer-items-center">
                <Select
                    className="univer-flex-shrink-0"
                    options={minOptions}
                    value={minType}
                    onChange={(v) => {
                        setMinType(v as CFValueType);
                        const value = createDefaultValueByValueType(v as CFValueType, 10);
                        setMinValue(value);
                        handleChange({
                            minType: v as CFValueType,
                            medianType,
                            maxType,
                            minValue: value,
                            medianValue,
                            maxValue,
                            minColor,
                            medianColor,
                            maxColor,
                        });
                    }}
                />
                <TextInput
                    id="min"
                    className="univer-ml-1"
                    value={minValue}
                    type={minType}
                    onChange={(v) => {
                        setMinValue(v);
                        handleChange({
                            minType,
                            medianType,
                            maxType,
                            minValue: v,
                            medianValue,
                            maxValue,
                            minColor,
                            medianColor,
                            maxColor,
                        });
                    }}
                />
                <ColorPicker
                    className="univer-ml-1"
                    color={minColor}
                    onChange={(v) => {
                        setMinColor(v);
                        handleChange({
                            minType,
                            medianType,
                            maxType,
                            minValue,
                            medianValue,
                            maxValue,
                            minColor: v,
                            medianColor,
                            maxColor,
                        });
                    }}
                />
            </div>
            <div
                className={`
                  univer-mt-3 univer-text-xs
                  univer-text-gray-600dark:univer-text-gray-200
                `}
            >
                {localeService.t('sheet.cf.panel.medianValue')}
            </div>
            <div className="univer-mt-3 univer-flex univer-h-8 univer-items-center">
                <Select
                    className="univer-flex-shrink-0"
                    options={medianOptions}
                    value={medianType}
                    onChange={(v) => {
                        setMedianType(v as CFValueType);
                        const value = createDefaultValueByValueType(v as CFValueType, 50);
                        setMedianValue(value);
                        handleChange({
                            minType,
                            medianType: v as CFValueType,
                            maxType,
                            minValue,
                            medianValue: value,
                            maxValue,
                            minColor,
                            medianColor,
                            maxColor,
                        });
                    }}
                />

                <TextInput
                    id="median"
                    className="univer-ml-1"
                    value={medianValue}
                    type={medianType}
                    onChange={(v) => {
                        setMedianValue(v);
                        handleChange({
                            minType,
                            medianType,
                            maxType,
                            minValue,
                            medianValue: v,
                            maxValue,
                            minColor,
                            medianColor,
                            maxColor,
                        });
                    }}
                />
                {medianType !== 'none' && (
                    <ColorPicker
                        className="univer-ml-1"
                        color={medianColor}
                        onChange={(v) => {
                            setMedianColor(v);
                            handleChange({
                                minType,
                                medianType,
                                maxType,
                                minValue,
                                medianValue,
                                maxValue,
                                minColor,
                                medianColor: v,
                                maxColor,
                            });
                        }}
                    />
                )}

            </div>
            <div
                className={`
                  univer-mt-3 univer-text-xs univer-text-gray-600
                  dark:univer-text-gray-200
                `}
            >
                {localeService.t('sheet.cf.valueType.max')}
            </div>
            <div className="univer-mt-3 univer-flex univer-h-8 univer-items-center">
                <Select
                    className="univer-flex-shrink-0"
                    options={maxOptions}
                    value={maxType}
                    onChange={(v) => {
                        setMaxType(v as CFValueType);
                        const value = createDefaultValueByValueType(v as CFValueType, 90);
                        setMaxValue(value);
                        handleChange({
                            minType,
                            medianType,
                            maxType: v as CFValueType,
                            minValue,
                            medianValue,
                            maxValue: value,
                            minColor,
                            medianColor,
                            maxColor,
                        });
                    }}
                />
                <TextInput
                    id="max"
                    className="univer-ml-1"
                    value={maxValue}
                    type={maxType}
                    onChange={(v) => {
                        setMaxValue(v);
                        handleChange({
                            minType,
                            medianType,
                            maxType,
                            minValue,
                            medianValue,
                            maxValue: v,
                            minColor,
                            medianColor,
                            maxColor,
                        });
                    }}
                />
                <ColorPicker
                    className="univer-ml-1"
                    color={maxColor}
                    onChange={(v) => {
                        setMaxColor(v);
                        handleChange({
                            minType,
                            medianType,
                            maxType,
                            minValue,
                            medianValue,
                            maxValue,
                            minColor,
                            medianColor,
                            maxColor: v,
                        });
                    }}
                />
            </div>
        </div>
    );
};
