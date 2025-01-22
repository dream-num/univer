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

import type { Workbook } from '@univerjs/core';
import type { IColorScale, IConditionalFormattingRuleConfig } from '@univerjs/sheets-conditional-formatting';
import type { IStyleEditorProps } from './type';

import { IUniverInstanceService, LocaleService, UniverInstanceType, useDependency } from '@univerjs/core';
import { InputNumber, Select } from '@univerjs/design';
import { CFRuleType, CFValueType, createDefaultValueByValueType } from '@univerjs/sheets-conditional-formatting';
import { FormulaEditor } from '@univerjs/sheets-formula-ui';
import { useSidebarClick } from '@univerjs/ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ColorPicker } from '../../color-picker';
import { Preview } from '../../preview';
import stylesBase from '../index.module.less';
import styles from './index.module.less';

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
                min: 0, max: 100,
            };
        }
        return {
            min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER,
        };
    }, [type]);

    const formulaEditorActionsRef = useRef<Parameters<typeof FormulaEditor>[0]['actions']>({});
    const [isFocusFormulaEditor, isFocusFormulaEditorSet] = useState(false);

    useSidebarClick((e: MouseEvent) => {
        const handleOutClick = formulaEditorActionsRef.current?.handleOutClick;
        handleOutClick && handleOutClick(e, () => isFocusFormulaEditorSet(false));
    });

    if (type === CFValueType.formula) {
        return (
            <div style={{ width: '100%', marginLeft: 4 }}>
                <FormulaEditor
                    initValue={formulaInitValue as any}
                    unitId={unitId}
                    subUnitId={subUnitId}
                    isFocus={isFocusFormulaEditor}
                    onChange={(v = '') => {
                        const formula = v || '';
                        onChange(formula);
                    }}
                    onFocus={() => isFocusFormulaEditorSet(true)}
                    actions={formulaEditorActionsRef.current}
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

    const [minType, minTypeSet] = useState(() => {
        const defaultV = CFValueType.min;
        if (!rule) {
            return defaultV;
        }
        return rule.config[0]?.value.type || defaultV;
    });
    const [medianType, medianTypeSet] = useState<CFValueType | 'none'>(() => {
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
        const defaultV = CFValueType.max;
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
        return valueConfig?.value.value === undefined ? defaultV : valueConfig?.value.value;
    });
    const [medianValue, medianValueSet] = useState(() => {
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
    const [maxValue, maxValueSet] = useState(() => {
        const defaultV = 90;
        if (!rule) {
            return defaultV;
        }
        const v = rule.config[rule.config.length - 1]?.value.value;
        return v === undefined ? defaultV : v;
    });

    const [minColor, minColorSet] = useState(() => {
        const defaultV = '#d0d9fb';
        if (!rule) {
            return defaultV;
        }
        return rule.config[0]?.color || defaultV;
    });
    const [medianColor, medianColorSet] = useState(() => {
        const defaultV = '#7790f3';
        if (!rule) {
            return defaultV;
        }
        if (rule.config.length !== 3) {
            return defaultV;
        }
        return rule.config[1]?.color || defaultV;
    });
    const [maxColor, maxColorSet] = useState(() => {
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
            <div className={stylesBase.title}>{localeService.t('sheet.cf.panel.styleRule')}</div>
            <div className={`
              ${styles.cfPreviewWrap}
            `}
            >
                <Preview rule={getResult({ minType, medianType, maxType, minValue, medianValue, maxValue, minColor, medianColor, maxColor }) as IConditionalFormattingRuleConfig} />
            </div>
            <div className={stylesBase.label}>{localeService.t('sheet.cf.valueType.min')}</div>
            <div className={`
              ${stylesBase.labelContainer}
              ${stylesBase.mTSm}
            `}
            >
                <Select
                    style={{ flexShrink: 0 }}
                    options={minOptions}
                    value={minType}
                    onChange={(v) => {
                        minTypeSet(v as CFValueType);
                        const value = createDefaultValueByValueType(v as CFValueType, 10);
                        minValueSet(value);
                        handleChange({ minType: v as CFValueType, medianType, maxType, minValue: value, medianValue, maxValue, minColor, medianColor, maxColor });
                    }}
                />
                <TextInput
                    id="min"
                    className={`
                      ${stylesBase.mLXxs}
                    `}
                    value={minValue}
                    type={minType}
                    onChange={(v) => {
                        minValueSet(v);
                        handleChange({ minType, medianType, maxType, minValue: v, medianValue, maxValue, minColor, medianColor, maxColor });
                    }}
                />
                <ColorPicker
                    className={stylesBase.mLXxs}
                    color={minColor}
                    onChange={(v) => {
                        minColorSet(v);
                        handleChange({ minType, medianType, maxType, minValue, medianValue, maxValue, minColor: v, medianColor, maxColor });
                    }}
                />
            </div>
            <div className={stylesBase.label}>{localeService.t('sheet.cf.panel.medianValue')}</div>
            <div className={`
              ${stylesBase.labelContainer}
              ${stylesBase.mTSm}
            `}
            >
                <Select
                    style={{ flexShrink: 0 }}
                    options={medianOptions}
                    value={medianType}
                    onChange={(v) => {
                        medianTypeSet(v as CFValueType);
                        const value = createDefaultValueByValueType(v as CFValueType, 50);
                        medianValueSet(value);
                        handleChange({ minType, medianType: v as CFValueType, maxType, minValue, medianValue: value, maxValue, minColor, medianColor, maxColor });
                    }}
                />

                <TextInput
                    id="median"
                    className={`
                      ${stylesBase.mLXxs}
                    `}
                    value={medianValue}
                    type={medianType}
                    onChange={(v) => {
                        medianValueSet(v);
                        handleChange({ minType, medianType, maxType, minValue, medianValue: v, maxValue, minColor, medianColor, maxColor });
                    }}
                />
                {medianType !== 'none' && (
                    <ColorPicker
                        className={stylesBase.mLXxs}
                        color={medianColor}
                        onChange={(v) => {
                            medianColorSet(v);
                            handleChange({ minType, medianType, maxType, minValue, medianValue, maxValue, minColor, medianColor: v, maxColor });
                        }}
                    />
                )}

            </div>
            <div className={stylesBase.label}>{localeService.t('sheet.cf.valueType.max')}</div>
            <div className={`
              ${stylesBase.labelContainer}
              ${stylesBase.mTSm}
            `}
            >
                <Select
                    style={{ flexShrink: 0 }}
                    options={maxOptions}
                    value={maxType}
                    onChange={(v) => {
                        maxTypeSet(v as CFValueType);
                        const value = createDefaultValueByValueType(v as CFValueType, 90);
                        maxValueSet(value);
                        handleChange({ minType, medianType, maxType: v as CFValueType, minValue, medianValue, maxValue: value, minColor, medianColor, maxColor });
                    }}
                />
                <TextInput
                    id="max"
                    className={`
                      ${stylesBase.mLXxs}
                    `}
                    value={maxValue}
                    type={maxType}
                    onChange={(v) => {
                        maxValueSet(v);
                        handleChange({ minType, medianType, maxType, minValue, medianValue, maxValue: v, minColor, medianColor, maxColor });
                    }}
                />
                <ColorPicker
                    className={stylesBase.mLXxs}
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
