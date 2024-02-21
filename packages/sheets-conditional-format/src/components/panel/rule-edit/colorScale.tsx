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

import React, { useEffect, useMemo, useState } from 'react';
import { InputNumber, Select } from '@univerjs/design';
import { RuleType, ValueType } from '../../../base/const';
import { ColorPicker } from '../../color-picker';
import type { IColorScale } from '../../../models/type';
import type { IStyleEditorProps } from './type';

const createOptionItem = (text: string) => ({ label: text, value: text });

const TextInput = (props: { type: string;value: number;onChange: (v: number) => void }) => {
    const { type } = props;
    const config = useMemo(() => {
        if ([ValueType.max, ValueType.min, 'none'].includes(type as ValueType)) {
            return { disabled: true };
        }
        if ([ValueType.percent, ValueType.percentile].includes(type as ValueType)) {
            return {
                min: 0, max: 100,
            };
        }
        return {};
    }, [type]);
    return <InputNumber value={props.value} onChange={(v) => props.onChange(v || 0)} {...config} />;
};
export const ColorScaleStyleEditor = (props: IStyleEditorProps) => {
    const { interceptorManager } = props;
    const rule = props.rule?.type === RuleType.colorScale ? props.rule : undefined as IColorScale | undefined;
    const commonOptions = [createOptionItem(ValueType.num), createOptionItem(ValueType.percent), createOptionItem(ValueType.percentile)];
    const minOptions = [createOptionItem(ValueType.min), ...commonOptions];
    const medianOptions = [createOptionItem('none'), ...commonOptions];
    const maxOptions = [createOptionItem(ValueType.max), ...commonOptions];

    const [minType, minTypeSet] = useState(() => {
        const defaultV = ValueType.min;
        if (!rule) {
            return defaultV;
        }
        return rule.config[0].value.type;
    });
    const [medianType, medianTypeSet] = useState<ValueType | 'none'>(() => {
        const defaultV = 'none';
        if (!rule) {
            return defaultV;
        }
        if (rule.config.length !== 3) {
            return defaultV;
        }
        return rule.config[1].value.type;
    });
    const [maxType, maxTypeSet] = useState(() => {
        const defaultV = ValueType.max;
        if (!rule) {
            return defaultV;
        }
        return rule.config[rule.config.length - 1].value.type;
    });

    const [minValue, minValueSet] = useState(() => {
        const defaultV = 10;
        if (!rule) {
            return defaultV;
        }
        return rule.config[0].value.value || defaultV;
    });
    const [medianValue, medianValueSet] = useState(() => {
        const defaultV = 10;
        if (!rule) {
            return defaultV;
        }
        if (rule.config.length !== 3) {
            return defaultV;
        }
        return rule.config[1].value.value || defaultV;
    });
    const [maxValue, maxValueSet] = useState(() => {
        const defaultV = 10;
        if (!rule) {
            return defaultV;
        }
        return rule.config[rule.config.length - 1].value.value || defaultV;
    });

    const [minColor, minColorSet] = useState(() => {
        const defaultV = '#ff0000';
        if (!rule) {
            return defaultV;
        }
        return rule.config[0].color || defaultV;
    });
    const [medianColor, medianColorSet] = useState(() => {
        const defaultV = '#fff';
        if (!rule) {
            return defaultV;
        }
        if (rule.config.length !== 3) {
            return defaultV;
        }
        return rule.config[1].color || defaultV;
    });
    const [maxColor, maxColorSet] = useState(() => {
        const defaultV = '#0000ff';
        if (!rule) {
            return defaultV;
        }
        return rule.config[rule.config.length - 1].color || defaultV;
    });

    const getResult = useMemo(() => (option: {
        minType: typeof minType;
        medianType: typeof medianType;
        maxType: typeof maxType;
        minValue: number;
        medianValue: number;
        maxValue: number;
        minColor: string;
        medianColor: string;
        maxColor: string;
    }) => {
        const { minType,
                medianType,
                maxType,
                minValue,
                medianValue,
                maxValue,
                minColor,
                medianColor,
                maxColor } = option;
        const list = [];
        list.push({ color: minColor, value: { type: minType, value: minValue } });
        medianType !== 'none' && list.push({ color: medianColor, value: { type: medianType, value: medianValue } });
        list.push({ color: maxColor, value: { type: maxType, value: maxValue } });
        const config: IColorScale['config'] = list.map((item, index) => ({ ...item, index }));
        return { config, type: RuleType.colorScale };
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
        minValue: number;
        medianValue: number;
        maxValue: number;
        minColor: string;
        medianColor: string;
        maxColor: string;
    }) => {
        props.onChange(getResult(option));
    };
    const isShowInput = (type: ValueType) => commonOptions.map((item) => item.value).includes(type);
    return (
        <div>

            <div>样式设置</div>
            <div>最小值</div>
            <Select
                options={minOptions}
                value={minType}
                onChange={(v) => {
                    minTypeSet(v as ValueType);
                    handleChange({ minType: v as ValueType, medianType, maxType, minValue, medianValue, maxValue, minColor, medianColor, maxColor });
                }}
            />
            {isShowInput(minType) && (
                <TextInput
                    value={minValue}
                    type={minType}
                    onChange={(v) => {
                        minValueSet(v);
                        handleChange({ minType, medianType, maxType, minValue: v, medianValue, maxValue, minColor, medianColor, maxColor });
                    }}
                />
            )}

            <ColorPicker
                color={minColor}
                onChange={(v) => {
                    minColorSet(v);
                    handleChange({ minType, medianType, maxType, minValue, medianValue, maxValue, minColor: v, medianColor, maxColor });
                }}
            />
            <div>中间值</div>
            <Select
                options={medianOptions}
                value={medianType}
                onChange={(v) => {
                    medianTypeSet(v as ValueType);
                    handleChange({ minType, medianType: v as ValueType, maxType, minValue, medianValue, maxValue, minColor, medianColor, maxColor });
                }}
            />
            {isShowInput(medianType as ValueType) && (
                <TextInput
                    value={medianValue}
                    type={medianType}
                    onChange={(v) => {
                        medianValueSet(v);
                        handleChange({ minType, medianType, maxType, minValue, medianValue: v, maxValue, minColor, medianColor, maxColor });
                    }}
                />
            )}
            <ColorPicker
                disable={medianType === 'none'}
                color={medianColor}
                onChange={(v) => {
                    medianColorSet(v);
                    handleChange({ minType, medianType, maxType, minValue, medianValue, maxValue, minColor, medianColor: v, maxColor });
                }}
            />
            <div>最大值</div>
            <Select
                options={maxOptions}
                value={maxType}
                onChange={(v) => {
                    maxTypeSet(v as ValueType);
                    handleChange({ minType, medianType, maxType: v as ValueType, minValue, medianValue, maxValue, minColor, medianColor, maxColor });
                }}
            />
            {isShowInput(maxType) && (
                <TextInput
                    value={maxValue}
                    type={maxType}
                    onChange={(v) => {
                        maxValueSet(v);
                        handleChange({ minType, medianType, maxType, minValue, medianValue, maxValue: v, minColor, medianColor, maxColor });
                    }}
                />
            )}
            <ColorPicker
                color={maxColor}
                onChange={(v) => {
                    maxColorSet(v);
                    handleChange({ minType, medianType, maxType, minValue, medianValue, maxValue, minColor, medianColor, maxColor: v });
                }}
            />

        </div>
    );
};
