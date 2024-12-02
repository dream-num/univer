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

import type { IAverageHighlightCell, IConditionalFormattingRuleConfig, IHighlightCell, IRankHighlightCell } from '@univerjs/sheets-conditional-formatting';
import type { IStyleEditorProps } from './type';
import { LocaleService, useDependency } from '@univerjs/core';
import { Checkbox, InputNumber, Select } from '@univerjs/design';
import { CFNumberOperator, CFRuleType, CFSubRuleType } from '@univerjs/sheets-conditional-formatting';
import React, { useEffect, useState } from 'react';
import { ConditionalStyleEditor } from '../../conditional-style-editor';
import { Preview } from '../../preview';
import stylesBase from '../index.module.less';
import styles from './index.module.less';

export const RankStyleEditor = (props: IStyleEditorProps) => {
    const { onChange, interceptorManager } = props;
    const localeService = useDependency(LocaleService);

    const rule = props.rule?.type === CFRuleType.highlightCell ? props.rule : undefined as IRankHighlightCell | IAverageHighlightCell | undefined;
    const options = [{ label: localeService.t('sheet.cf.panel.isNotBottom'), value: 'isNotBottom' }, { label: localeService.t('sheet.cf.panel.isBottom'), value: 'isBottom' },
        { label: localeService.t('sheet.cf.panel.greaterThanAverage'), value: 'greaterThanAverage' }, { label: localeService.t('sheet.cf.panel.lessThanAverage'), value: 'lessThanAverage' }];

    const [type, typeSet] = useState(() => {
        const defaultV = options[0].value;
        const type = rule?.type;
        if (!rule) {
            return defaultV;
        }
        switch (type) {
            case CFRuleType.highlightCell:{
                const subType = rule.subType;
                switch (subType) {
                    case CFSubRuleType.average:{
                        if ([CFNumberOperator.greaterThan, CFNumberOperator.greaterThanOrEqual].includes(rule.operator)) {
                            return 'greaterThanAverage';
                        }
                        if ([CFNumberOperator.lessThan, CFNumberOperator.lessThanOrEqual].includes(rule.operator)) {
                            return 'lessThanAverage';
                        }
                        return defaultV;
                    }
                    case CFSubRuleType.rank:{
                        if (rule.isBottom) {
                            return 'isBottom';
                        } else {
                            return 'isNotBottom';
                        }
                    }
                }
            }
        }
        return defaultV;
    });
    const [value, valueSet] = useState(() => {
        const defaultV = 10;
        const type = rule?.type;
        if (!rule) {
            return defaultV;
        }
        switch (type) {
            case CFRuleType.highlightCell:{
                const subType = rule.subType;
                switch (subType) {
                    case CFSubRuleType.rank:{
                        return rule.value || defaultV;
                    }
                }
            }
        }
        return defaultV;
    });
    const [isPercent, isPercentSet] = useState(() => {
        const defaultV = false;
        const type = rule?.type;
        if (!rule) {
            return defaultV;
        }
        switch (type) {
            case CFRuleType.highlightCell:{
                const subType = rule.subType;
                switch (subType) {
                    case CFSubRuleType.rank:{
                        return rule.isPercent || defaultV;
                    }
                }
            }
        }
        return defaultV;
    });

    const [style, styleSet] = useState<IHighlightCell['style']>({});

    const getResult = (config: {
        type: string;
        isPercent: boolean;
        value: number;
        style: IHighlightCell['style'];
    }) => {
        const { type, isPercent, value, style } = config;
        if (type === 'isNotBottom') {
            return { type: CFRuleType.highlightCell, subType: CFSubRuleType.rank, isPercent, isBottom: false, value, style };
        }
        if (type === 'isBottom') {
            return { type: CFRuleType.highlightCell, subType: CFSubRuleType.rank, isPercent, isBottom: true, value, style };
        }
        if (type === 'greaterThanAverage') {
            return { type: CFRuleType.highlightCell, subType: CFSubRuleType.average, operator: CFNumberOperator.greaterThan, style };
        }
        if (type === 'lessThanAverage') {
            return { type: CFRuleType.highlightCell, subType: CFSubRuleType.average, operator: CFNumberOperator.lessThan, style };
        }
    };
    useEffect(() => {
        const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().submit, {
            handler() {
                return getResult({ type, isPercent, value, style });
            },
        });
        return dispose as () => void;
    }, [type, isPercent, value, style, interceptorManager]);

    const _onChange = (config: {
        type: string;
        isPercent: boolean;
        value: number;
        style: IHighlightCell['style'];
    }) => {
        onChange(getResult(config));
    };
    return (
        <div>
            <div className={`
              ${stylesBase.title}
              ${stylesBase.mTBase}
            `}
            >
                {localeService.t('sheet.cf.panel.styleRule')}
            </div>
            <Select
                className={`
                  ${styles.width100}
                  ${stylesBase.mTSm}
                `}
                value={type}
                options={options}
                onChange={(v) => {
                    typeSet(v);
                    _onChange({ type: v, isPercent, value, style });
                }}
            />
            {['isNotBottom', 'isBottom'].includes(type) && (
                <div className={`
                  ${stylesBase.labelContainer}
                  ${stylesBase.mTSm}
                `}
                >
                    <InputNumber
                        min={1}
                        max={1000}
                        value={value}
                        onChange={(v) => {
                            const value = v || 0;
                            valueSet(value);
                            _onChange({ type, isPercent, value, style });
                        }}
                    />
                    <div className={`
                      ${stylesBase.mLSm}
                      ${stylesBase.labelContainer}
                      ${styles.text}
                    `}
                    >
                        <Checkbox
                            checked={isPercent}
                            onChange={(v) => {
                                isPercentSet(!!v);
                                _onChange({ type, isPercent: !!v, value, style });
                            }}
                        />
                        {localeService.t('sheet.cf.valueType.percent')}
                    </div>

                </div>
            )}
            <div className={`
              ${styles.cfPreviewWrap}
            `}
            >
                <Preview rule={getResult({ type, isPercent, value, style }) as IConditionalFormattingRuleConfig} />
            </div>
            <ConditionalStyleEditor
                style={rule?.style}
                className={`
                  ${stylesBase.mTSm}
                `}
                onChange={(v) => {
                    styleSet(v);
                    _onChange({ type, isPercent, value, style: v });
                }}
            />
        </div>
    );
};
