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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { IUniverInstanceService, LocaleService } from '@univerjs/core';
import { InputNumber, Select } from '@univerjs/design';
import { TextEditor } from '@univerjs/ui';
import { RuleType, SHEET_CONDITION_FORMAT_PLUGIN, ValueType } from '../../../base/const';
import { ColorPicker } from '../../color-picker';
import type { IColorScale } from '../../../models/type';
import styles from '../index.module.less';
import type { IStyleEditorProps } from './type';

const createOptionItem = (text: string, localeService: LocaleService) => ({ label: localeService.t(`sheet.cf.valueType.${text}`), value: text });

const TextInput = (props: { id: string; type: ValueType | 'none';value: number | string;onChange: (v: number | string) => void; className: string }) => {
    const { type, className, onChange, id, value } = props;
    const univerInstanceService = useDependency(IUniverInstanceService);
    const unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
    const subUnitId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
    const _value = useRef(value);

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
    if (type === ValueType.formula) {
        const v = String(_value.current).startsWith('=') ? String(_value.current) || '' : '=';
        return (
            <TextEditor
                openForSheetSubUnitId={subUnitId}
                openForSheetUnitId={unitId}
                id={`${SHEET_CONDITION_FORMAT_PLUGIN}_colo_scale_${id}`}
                value={v}
                style={{ maxWidth: '50%' }}
                canvasStyle={{ fontSize: 10 }}
                onlyInputFormula={true}
                onChange={(v = '') => {
                    const formula = v || '';
                    onChange(formula);
                }}
            />
        );
    } else {
        return <InputNumber className={className} value={Number(props.value) || 0} onChange={(v) => props.onChange(v || 0)} {...config} />;
    }
};
export const ColorScaleStyleEditor = (props: IStyleEditorProps) => {
    const { interceptorManager } = props;
    const localeService = useDependency(LocaleService);

    const rule = props.rule?.type === RuleType.colorScale ? props.rule : undefined as IColorScale | undefined;
    const commonOptions = [createOptionItem(ValueType.num, localeService), createOptionItem(ValueType.percent, localeService), createOptionItem(ValueType.percentile, localeService), createOptionItem(ValueType.formula, localeService)];
    const minOptions = [createOptionItem(ValueType.min, localeService), ...commonOptions];
    const medianOptions = [createOptionItem('none', localeService), ...commonOptions];
    const maxOptions = [createOptionItem(ValueType.max, localeService), ...commonOptions];

    const [minType, minTypeSet] = useState(() => {
        const defaultV = ValueType.min;
        if (!rule) {
            return defaultV;
        }
        return rule.config[0]?.value.type || defaultV;
    });
    const [medianType, medianTypeSet] = useState<ValueType | 'none'>(() => {
        const defaultV = 'none';
        if (!rule) {
            return defaultV;
        }
        if (rule.config.length !== 3) {
            return defaultV;
        }
        return rule.config[1]?.value.type || defaultV;
    });
    const [maxType, maxTypeSet] = useState(() => {
        const defaultV = ValueType.max;
        if (!rule) {
            return defaultV;
        }
        return rule.config[rule.config.length - 1]?.value.type || defaultV;
    });

    const [minValue, minValueSet] = useState(() => {
        const defaultV = 10;
        if (!rule) {
            return defaultV;
        }
        const valueConfig = rule.config[0];
        return valueConfig?.value.value || defaultV;
    });
    const [medianValue, medianValueSet] = useState(() => {
        const defaultV = 10;
        if (!rule) {
            return defaultV;
        }
        if (rule.config.length !== 3) {
            return defaultV;
        }
        return rule.config[1]?.value.value || defaultV;
    });
    const [maxValue, maxValueSet] = useState(() => {
        const defaultV = 10;
        if (!rule) {
            return defaultV;
        }
        return rule.config[rule.config.length - 1]?.value.value || defaultV;
    });

    const [minColor, minColorSet] = useState(() => {
        const defaultV = '#ff0000';
        if (!rule) {
            return defaultV;
        }
        return rule.config[0]?.color || defaultV;
    });
    const [medianColor, medianColorSet] = useState(() => {
        const defaultV = '#fff';
        if (!rule) {
            return defaultV;
        }
        if (rule.config.length !== 3) {
            return defaultV;
        }
        return rule.config[1]?.color || defaultV;
    });
    const [maxColor, maxColorSet] = useState(() => {
        const defaultV = '#0000ff';
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
        minValue: number | string;
        medianValue: number | string;
        maxValue: number | string;
        minColor: string;
        medianColor: string;
        maxColor: string;
    }) => {
        props.onChange(getResult(option));
    };
    const isShowInput = (type: ValueType) => commonOptions.map((item) => item.value).includes(type);
    return (
        <div>
            <div className={styles.title}>{localeService.t('sheet.cf.panel.styleRule')}</div>
            <div className={styles.label}>{localeService.t('sheet.cf.valueType.min')}</div>
            <div className={`${styles.labelContainer} ${styles.mTSm}`}>
                <Select
                    className={styles.inputWidth}
                    options={minOptions}
                    value={minType}
                    onChange={(v) => {
                        minTypeSet(v as ValueType);
                        handleChange({ minType: v as ValueType, medianType, maxType, minValue, medianValue, maxValue, minColor, medianColor, maxColor });
                    }}
                />
                {isShowInput(minType) && (
                    <TextInput
                        id="min"
                        className={`${styles.inputWidth} ${styles.mLXxs}`}
                        value={minValue}
                        type={minType}
                        onChange={(v) => {
                            minValueSet(v);
                            handleChange({ minType, medianType, maxType, minValue: v, medianValue, maxValue, minColor, medianColor, maxColor });
                        }}
                    />
                )}

                <ColorPicker
                    className={styles.mLXxs}
                    color={minColor}
                    onChange={(v) => {
                        minColorSet(v);
                        handleChange({ minType, medianType, maxType, minValue, medianValue, maxValue, minColor: v, medianColor, maxColor });
                    }}
                />
            </div>
            <div className={styles.label}>{localeService.t('sheet.cf.panel.medianValue')}</div>
            <div className={`${styles.labelContainer} ${styles.mTSm}`}>
                <Select
                    className={styles.inputWidth}
                    options={medianOptions}
                    value={medianType}
                    onChange={(v) => {
                        medianTypeSet(v as ValueType);
                        handleChange({ minType, medianType: v as ValueType, maxType, minValue, medianValue, maxValue, minColor, medianColor, maxColor });
                    }}
                />
                {isShowInput(medianType as ValueType) && (
                    <TextInput
                        id="median"
                        className={`${styles.inputWidth} ${styles.mLXxs}`}
                        value={medianValue}
                        type={medianType}
                        onChange={(v) => {
                            medianValueSet(v);
                            handleChange({ minType, medianType, maxType, minValue, medianValue: v, maxValue, minColor, medianColor, maxColor });
                        }}
                    />
                )}
                {medianType !== 'none' && (
                    <ColorPicker
                        className={styles.mLXxs}
                        color={medianColor}
                        onChange={(v) => {
                            medianColorSet(v);
                            handleChange({ minType, medianType, maxType, minValue, medianValue, maxValue, minColor, medianColor: v, maxColor });
                        }}
                    />
                )}

            </div>
            <div className={styles.label}>{localeService.t('sheet.cf.valueType.max')}</div>
            <div className={`${styles.labelContainer} ${styles.mTSm}`}>
                <Select
                    className={styles.inputWidth}
                    options={maxOptions}
                    value={maxType}
                    onChange={(v) => {
                        maxTypeSet(v as ValueType);
                        handleChange({ minType, medianType, maxType: v as ValueType, minValue, medianValue, maxValue, minColor, medianColor, maxColor });
                    }}
                />
                {isShowInput(maxType) && (
                    <TextInput
                        id="max"
                        className={`${styles.inputWidth} ${styles.mLXxs}`}
                        value={maxValue}
                        type={maxType}
                        onChange={(v) => {
                            maxValueSet(v);
                            handleChange({ minType, medianType, maxType, minValue, medianValue, maxValue: v, minColor, medianColor, maxColor });
                        }}
                    />
                )}
                <ColorPicker
                    className={styles.mLXxs}
                    color={maxColor}
                    onChange={(v) => {
                        maxColorSet(v);
                        handleChange({ minType, medianType, maxType, minValue, medianValue, maxValue, minColor, medianColor, maxColor: v });
                    }}
                />
            </div>

        </div>
    );
};
