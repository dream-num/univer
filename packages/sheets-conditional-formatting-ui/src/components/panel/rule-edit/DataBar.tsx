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
import type { IConditionalFormattingRuleConfig, IValueConfig } from '@univerjs/sheets-conditional-formatting';
import type { IFormulaEditorRef } from '@univerjs/sheets-formula-ui';
import type { IStyleEditorProps } from './type';
import { IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { borderClassName, Checkbox, clsx, InputNumber, Radio, RadioGroup, Select } from '@univerjs/design';
import { CFRuleType, CFValueType, createDefaultValueByValueType, defaultDataBarNativeColor, defaultDataBarPositiveColor } from '@univerjs/sheets-conditional-formatting';
import { FormulaEditor } from '@univerjs/sheets-formula-ui';
import { useDependency, useSidebarClick } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ColorPicker } from '../../color-picker';
import { Preview } from '../../preview';
import { previewClassName } from './styles';

const createOptionItem = (text: CFValueType, localeService: LocaleService) => ({ label: localeService.t(`sheet.cf.valueType.${text}`), value: text });

const InputText = (props: { disabled?: boolean; id: string; className: string; type: CFValueType; value: string | number; onChange: (v: string | number) => void }) => {
    const { onChange, className, value, type, id, disabled = false } = props;
    const univerInstanceService = useDependency(IUniverInstanceService);
    const unitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
    const subUnitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();

    const formulaEditorRef = useRef<IFormulaEditorRef>(null);
    const [isFocusFormulaEditor, setIsFocusFormulaEditor] = useState(false);

    useSidebarClick((e: MouseEvent) => {
        const isOutSide = formulaEditorRef.current?.isClickOutSide(e);
        isOutSide && setIsFocusFormulaEditor(false);
    });

    const _value = useRef(value);
    const config = useMemo(() => {
        if ([CFValueType.percentile, CFValueType.percent].includes(type)) {
            return {
                max: 100,
                min: 0,
            };
        }
        return {
            min: Number.MIN_SAFE_INTEGER,
            max: Number.MAX_SAFE_INTEGER,
        };
    }, [type]);

    if (type === CFValueType.formula) {
        const v = String(_value.current).startsWith('=') ? String(_value.current) || '' : '=';
        return (
            <div className="univer-ml-3 univer-w-full">
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
                    initValue={v as any}
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
    }
    return (
        <InputNumber
            className={className}
            value={Number(value) || 0}
            disabled={disabled}
            onChange={(v) => {
                onChange(v || 0);
            }}
            {...config}
        />
    );
};
export const DataBarStyleEditor = (props: IStyleEditorProps) => {
    const { interceptorManager } = props;
    const localeService = useDependency(LocaleService);

    const rule = props.rule?.type === CFRuleType.dataBar ? props.rule : undefined;
    const [isGradient, isGradientSet] = useState(() => {
        const defaultV = '0';
        if (!rule) {
            return defaultV;
        }
        return rule.config?.isGradient ? '1' : '0';
    });
    const [positiveColor, positiveColorSet] = useState(() => {
        if (!rule) {
            return defaultDataBarPositiveColor;
        }
        return rule.config?.positiveColor || defaultDataBarPositiveColor;
    });
    const [nativeColor, nativeColorSet] = useState(() => {
        if (!rule) {
            return defaultDataBarNativeColor;
        }
        return rule.config?.nativeColor || defaultDataBarNativeColor;
    });
    const commonOptions = [createOptionItem(CFValueType.num, localeService), createOptionItem(CFValueType.percent, localeService), createOptionItem(CFValueType.percentile, localeService), createOptionItem(CFValueType.formula, localeService)];
    const minOptions = [createOptionItem(CFValueType.min, localeService), ...commonOptions];
    const maxOptions = [createOptionItem(CFValueType.max, localeService), ...commonOptions];
    const [minValueType, setMinValueType] = useState<CFValueType>(() => {
        const defaultV = minOptions[0].value as CFValueType;
        if (!rule) {
            return defaultV;
        }
        return rule.config?.min.type || defaultV;
    });
    const [maxValueType, setMaxValueType] = useState<CFValueType>(() => {
        const defaultV = maxOptions[0].value as CFValueType;
        if (!rule) {
            return defaultV;
        }
        return rule.config?.max.type || defaultV;
    });
    const [minValue, minValueSet] = useState(() => {
        const defaultV = 0;
        if (!rule) {
            return defaultV;
        }
        const value = rule.config?.min || {};
        if (value.type === CFValueType.formula) {
            return value.value || '=';
        }
        return value.value || defaultV;
    });
    const [maxValue, setMaxValue] = useState(() => {
        const defaultV = 100;
        if (!rule) {
            return defaultV;
        }
        const value = rule.config?.max || {};
        if (value.type === CFValueType.formula) {
            return value.value || '=';
        }
        return value.value === undefined ? defaultV : value.value;
    });

    const [isShowValue, setIsShowValue] = useState(() => {
        const defaultV = true;
        if (!rule) {
            return defaultV;
        }
        return rule.isShowValue === undefined ? defaultV : !!rule.isShowValue;
    });

    const getResult = (option: {
        minValueType: CFValueType;
        minValue: number | string;
        maxValueType: CFValueType;
        maxValue: number | string;
        isGradient: string;
        positiveColor: string;
        isShowValue: boolean;
        nativeColor: string;
    }) => {
        const config: {
            min: IValueConfig;
            max: IValueConfig;
            isGradient: boolean;
            positiveColor: string;
            nativeColor: string;
        } = {
            min: { type: option.minValueType, value: option.minValue },
            max: { type: option.maxValueType, value: option.maxValue },
            isGradient: option.isGradient === '1',
            positiveColor: option.positiveColor || defaultDataBarPositiveColor,
            nativeColor: option.nativeColor || defaultDataBarNativeColor,
        };
        return { config, type: CFRuleType.dataBar, isShowValue: option.isShowValue };
    };
    useEffect(() => {
        const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().submit, {
            handler() {
                return getResult({ isGradient, minValue, minValueType, maxValue, maxValueType, positiveColor, nativeColor, isShowValue });
            },
        });
        return dispose as () => void;
    }, [isGradient, minValue, minValueType, maxValue, maxValueType, positiveColor, nativeColor, interceptorManager, isShowValue]);

    const _handleChange = (option: {
        minValueType: CFValueType;
        minValue: number | string;
        maxValueType: CFValueType;
        maxValue: number | string;
        isGradient: string;
        positiveColor: string;
        isShowValue: boolean;
        nativeColor: string;
    }) => {
        props.onChange(getResult(option));
    };

    const handlePositiveColorChange = (color: string) => {
        positiveColorSet(color);

        _handleChange({
            isGradient,
            minValue,
            minValueType,
            maxValue,
            maxValueType,
            positiveColor: color,
            nativeColor,
            isShowValue,
        });
    };
    const handleNativeColorChange = (color: string) => {
        nativeColorSet(color);
        _handleChange({
            isGradient,
            minValue,
            minValueType,
            maxValue,
            maxValueType,
            positiveColor,
            nativeColor: color,
            isShowValue,
        });
    };

    const isShowInput = (type: string) => {
        return commonOptions.map((item) => item.value).includes(type as CFValueType);
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
                <Preview
                    rule={getResult({
                        isGradient,
                        minValue,
                        minValueType,
                        maxValue,
                        maxValueType,
                        positiveColor,
                        nativeColor,
                        isShowValue,
                    }) as IConditionalFormattingRuleConfig}
                />
            </div>
            <div>
                <div
                    className={`
                      univer-mt-3 univer-text-sm univer-text-gray-600
                      dark:univer-text-gray-200
                    `}
                >
                    {localeService.t('sheet.cf.panel.fillType')}
                </div>

                <div className="univer-ml-1 univer-mt-3 univer-flex univer-items-center">
                    <RadioGroup
                        value={isGradient}
                        onChange={(v) => {
                            isGradientSet(v as string);
                            _handleChange({
                                isGradient: v as string,
                                minValue,
                                minValueType,
                                maxValue,
                                maxValueType,
                                positiveColor,
                                nativeColor,
                                isShowValue,
                            });
                        }}
                    >
                        <Radio value="0">
                            <span className="univer-text-xs">{localeService.t('sheet.cf.panel.pureColor')}</span>
                        </Radio>
                        <Radio value="1">
                            <span className="univer-text-xs">{localeService.t('sheet.cf.panel.gradient')}</span>
                        </Radio>
                    </RadioGroup>
                    <div className="univer-ml-6 univer-flex univer-items-center univer-text-xs">
                        <Checkbox
                            checked={!isShowValue}
                            onChange={(v) => {
                                setIsShowValue(!v);
                                _handleChange({
                                    isGradient: v as string,
                                    minValue,
                                    minValueType,
                                    maxValue,
                                    maxValueType,
                                    positiveColor,
                                    nativeColor,
                                    isShowValue: !v,
                                });
                            }}
                        />
                        {localeService.t('sheet.cf.panel.onlyShowDataBar')}
                    </div>
                </div>
            </div>
            <div>
                <div
                    className={`
                      univer-mt-3 univer-text-sm univer-text-gray-600
                      dark:univer-text-gray-200
                    `}
                >
                    {localeService.t('sheet.cf.panel.colorSet')}
                </div>
                <div className="univer-ml-1 univer-mt-3 univer-flex univer-items-center">
                    <div className="univer-flex univer-items-center">
                        <div className="univer-text-xs">
                            {localeService.t('sheet.cf.panel.native')}
                        </div>
                        <ColorPicker
                            color={nativeColor}
                            onChange={handleNativeColorChange}
                        />
                    </div>
                    <div className="univer-ml-3 univer-flex univer-items-center">
                        <div className="univer-text-xs">
                            {localeService.t('sheet.cf.panel.positive')}
                        </div>
                        <ColorPicker
                            color={positiveColor}
                            onChange={handlePositiveColorChange}
                        />
                    </div>
                </div>

            </div>
            <div>
                <div
                    className={`
                      univer-mt-3 univer-text-sm univer-text-gray-600
                      dark:univer-text-gray-200
                    `}
                >
                    {localeService.t('sheet.cf.valueType.min')}
                </div>
                <div className="univer-mt-3 univer-flex univer-items-center">
                    <Select
                        className="univer-w-1/2 univer-flex-shrink-0"
                        options={minOptions}
                        value={minValueType}
                        onChange={(v) => {
                            setMinValueType(v as CFValueType);
                            const value = createDefaultValueByValueType(v as CFValueType, 10);
                            minValueSet(value);
                            _handleChange({
                                isGradient,
                                minValue: value,
                                minValueType: v as CFValueType,
                                maxValue,
                                maxValueType,
                                positiveColor,
                                nativeColor,
                                isShowValue,
                            });
                        }}
                    />

                    <InputText
                        id="min"
                        className="univer-ml-3"
                        disabled={!isShowInput(minValueType)}
                        type={minValueType}
                        value={minValue}
                        onChange={(v) => {
                            minValueSet(v || 0);
                            _handleChange({
                                isGradient,
                                minValue: v || 0,
                                minValueType,
                                maxValue,
                                maxValueType,
                                positiveColor,
                                nativeColor,
                                isShowValue,
                            });
                        }}
                    />
                </div>
                <div
                    className={`
                      univer-mt-3 univer-text-sm univer-text-gray-600
                      dark:univer-text-gray-200
                    `}
                >
                    {localeService.t('sheet.cf.valueType.max')}
                </div>
                <div className="univer-mt-3 univer-flex univer-items-center">
                    <Select
                        className="univer-w-1/2 univer-flex-shrink-0"
                        options={maxOptions}
                        value={maxValueType}
                        onChange={(v) => {
                            setMaxValueType(v as CFValueType);
                            const value = createDefaultValueByValueType(v as CFValueType, 90);
                            setMaxValue(value);
                            _handleChange({
                                isGradient,
                                minValue,
                                minValueType,
                                maxValue: value,
                                maxValueType: v as CFValueType,
                                positiveColor,
                                nativeColor,
                                isShowValue,
                            });
                        }}
                    />
                    <InputText
                        className="univer-ml-3"
                        disabled={!isShowInput(maxValueType)}
                        id="max"
                        type={maxValueType}
                        value={maxValue}
                        onChange={(v) => {
                            setMaxValue(v || 0);
                            _handleChange({
                                isGradient,
                                minValue,
                                minValueType,
                                maxValue: v || 0,
                                maxValueType,
                                positiveColor,
                                nativeColor,
                                isShowValue,
                            });
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
