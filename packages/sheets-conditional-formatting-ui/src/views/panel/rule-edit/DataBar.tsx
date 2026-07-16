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
import type { IDataBar, IValueConfig } from '@univerjs/sheets-conditional-formatting';
import type { IFormulaEditorRef } from '@univerjs/sheets-formula-ui';
import type { LocaleKey } from '../../../locale/types';
import type { IStyleEditorProps } from './type';
import { IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { borderClassName, Checkbox, clsx, InputNumber, Radio, RadioGroup, Select } from '@univerjs/design';
import {
    CFRuleType,
    CFValueType,
    createDefaultValueByValueType,
    defaultDataBarNativeColor,
    defaultDataBarPositiveColor,
} from '@univerjs/sheets-conditional-formatting';
import { FormulaEditor } from '@univerjs/sheets-formula-ui';
import { useDependency, useSidebarClick } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ColorPicker } from '../../ColorPicker';
import { Preview } from '../../Preview';
import { previewClassName } from './styles';

const createOptionItem = (text: CFValueType): { label: LocaleKey; value: CFValueType } => ({
    label: `sheets-conditional-formatting-ui.valueType.${text}`,
    value: text,
});

const InputText = (props: { disabled?: boolean; id: string; className?: string; type: CFValueType; value: string | number; onChange: (v: string | number) => void }) => {
    const { onChange, className, value, type, id, disabled = false } = props;
    const univerInstanceService = useDependency(IUniverInstanceService);
    const unitId = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
    const subUnitId = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();

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
            <div className="univer-w-full">
                <FormulaEditor
                    ref={formulaEditorRef}
                    className={clsx(`
                      univer-box-border univer-h-8 univer-w-full univer-cursor-pointer univer-items-center
                      univer-rounded-lg univer-bg-white univer-pt-2 univer-transition-colors
                      hover:univer-border-primary-600
                      dark:!univer-bg-gray-700 dark:!univer-text-white
                      [&>div:first-child]:univer-px-2.5
                      [&>div]:univer-h-5 [&>div]:univer-ring-transparent
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
    const [isGradient, setIsGradient] = useState(() => {
        const defaultV = '0';
        if (!rule) {
            return defaultV;
        }
        return rule.config?.isGradient ? '1' : '0';
    });
    const [positiveColor, setPositiveColor] = useState(() => {
        if (!rule) {
            return defaultDataBarPositiveColor;
        }
        return rule.config?.positiveColor || defaultDataBarPositiveColor;
    });
    const [nativeColor, setNativeColor] = useState(() => {
        if (!rule) {
            return defaultDataBarNativeColor;
        }
        return rule.config?.nativeColor || defaultDataBarNativeColor;
    });
    const commonOptionDefinitions = [
        createOptionItem(CFValueType.num),
        createOptionItem(CFValueType.percent),
        createOptionItem(CFValueType.percentile),
        createOptionItem(CFValueType.formula),
    ];
    const minOptions = [createOptionItem(CFValueType.min), ...commonOptionDefinitions].map((option) => ({ ...option, label: localeService.t(option.label) }));
    const maxOptions = [createOptionItem(CFValueType.max), ...commonOptionDefinitions].map((option) => ({ ...option, label: localeService.t(option.label) }));
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
    const [minValue, setMinValue] = useState(() => {
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
    }): IDataBar => {
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

    const handleChange = (option: {
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
        setPositiveColor(color);

        handleChange({
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
        setNativeColor(color);
        handleChange({
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
        return commonOptionDefinitions.map((item) => item.value).includes(type as CFValueType);
    };

    return (
        <div>
            <div
                className={`
                  univer-mt-4 univer-text-sm univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                {localeService.t<LocaleKey>('sheets-conditional-formatting-ui.panel.styleRule')}
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
                    })}
                />
            </div>
            <div>
                <div
                    className={`
                      univer-mt-3 univer-text-sm univer-text-gray-600
                      dark:!univer-text-gray-200
                    `}
                >
                    {localeService.t<LocaleKey>('sheets-conditional-formatting-ui.panel.fillType')}
                </div>

                <div className="univer-mt-3 univer-flex univer-items-center univer-gap-3">
                    <RadioGroup
                        value={isGradient}
                        onChange={(v) => {
                            setIsGradient(v as string);
                            handleChange({
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
                            <span className="univer-text-xs">{localeService.t<LocaleKey>('sheets-conditional-formatting-ui.panel.pureColor')}</span>
                        </Radio>
                        <Radio value="1">
                            <span className="univer-text-xs">{localeService.t<LocaleKey>('sheets-conditional-formatting-ui.panel.gradient')}</span>
                        </Radio>
                    </RadioGroup>
                    <div className="univer-flex univer-items-center univer-text-xs">
                        <Checkbox
                            checked={!isShowValue}
                            onChange={(v) => {
                                setIsShowValue(!v);
                                handleChange({
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
                        {localeService.t<LocaleKey>('sheets-conditional-formatting-ui.panel.onlyShowDataBar')}
                    </div>
                </div>
            </div>
            <div>
                <div
                    className={`
                      univer-mt-3 univer-text-sm univer-text-gray-600
                      dark:!univer-text-gray-200
                    `}
                >
                    {localeService.t<LocaleKey>('sheets-conditional-formatting-ui.panel.colorSet')}
                </div>
                <div className="univer-mt-3 univer-flex univer-items-center univer-gap-2">
                    <div className="univer-flex univer-items-center">
                        <div className="univer-text-xs">
                            {localeService.t<LocaleKey>('sheets-conditional-formatting-ui.panel.native')}
                        </div>
                        <ColorPicker
                            color={nativeColor}
                            onChange={handleNativeColorChange}
                        />
                    </div>
                    <div className="univer-flex univer-items-center univer-gap-3">
                        <div className="univer-text-xs">
                            {localeService.t<LocaleKey>('sheets-conditional-formatting-ui.panel.positive')}
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
                      dark:!univer-text-gray-200
                    `}
                >
                    {localeService.t<LocaleKey>('sheets-conditional-formatting-ui.valueType.min')}
                </div>
                <div className="univer-mt-3 univer-flex univer-items-center univer-gap-2">
                    <Select
                        className="univer-w-1/2 univer-flex-shrink-0"
                        options={minOptions}
                        value={minValueType}
                        onChange={(v) => {
                            setMinValueType(v as CFValueType);
                            const value = createDefaultValueByValueType(v as CFValueType, 10);
                            setMinValue(value);
                            handleChange({
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
                        disabled={!isShowInput(minValueType)}
                        type={minValueType}
                        value={minValue}
                        onChange={(v) => {
                            setMinValue(v || 0);
                            handleChange({
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
                      dark:!univer-text-gray-200
                    `}
                >
                    {localeService.t<LocaleKey>('sheets-conditional-formatting-ui.valueType.max')}
                </div>
                <div className="univer-mt-3 univer-flex univer-items-center univer-gap-2">
                    <Select
                        className="univer-w-1/2 univer-flex-shrink-0"
                        options={maxOptions}
                        value={maxValueType}
                        onChange={(v) => {
                            setMaxValueType(v as CFValueType);
                            const value = createDefaultValueByValueType(v as CFValueType, 90);
                            setMaxValue(value);
                            handleChange({
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
                        disabled={!isShowInput(maxValueType)}
                        id="max"
                        type={maxValueType}
                        value={maxValue}
                        onChange={(v) => {
                            setMaxValue(v || 0);
                            handleChange({
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
