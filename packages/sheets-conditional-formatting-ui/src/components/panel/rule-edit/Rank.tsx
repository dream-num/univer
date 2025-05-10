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

import type { IAverageHighlightCell, IConditionalFormattingRuleConfig, IHighlightCell, IRankHighlightCell } from '@univerjs/sheets-conditional-formatting';
import type { IStyleEditorProps } from './type';
import { LocaleService } from '@univerjs/core';
import { Checkbox, InputNumber, Select } from '@univerjs/design';
import { CFNumberOperator, CFRuleType, CFSubRuleType } from '@univerjs/sheets-conditional-formatting';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { ConditionalStyleEditor } from '../../conditional-style-editor';
import { Preview } from '../../preview';
import { previewClassName } from './styles';

export const RankStyleEditor = (props: IStyleEditorProps) => {
    const { onChange, interceptorManager } = props;
    const localeService = useDependency(LocaleService);

    const rule = props.rule?.type === CFRuleType.highlightCell ? props.rule : undefined as IRankHighlightCell | IAverageHighlightCell | undefined;
    const options = [{ label: localeService.t('sheet.cf.panel.isNotBottom'), value: 'isNotBottom' }, { label: localeService.t('sheet.cf.panel.isBottom'), value: 'isBottom' }, { label: localeService.t('sheet.cf.panel.greaterThanAverage'), value: 'greaterThanAverage' }, { label: localeService.t('sheet.cf.panel.lessThanAverage'), value: 'lessThanAverage' }];

    const [type, setType] = useState(() => {
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
    const [value, setValue] = useState(() => {
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
    const [isPercent, setIsPercent] = useState(() => {
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

    const [style, setStyle] = useState<IHighlightCell['style']>({});

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
            <div
                className={`
                  univer-mt-4 univer-text-sm univer-text-gray-600
                  dark:univer-text-gray-200
                `}
            >
                {localeService.t('sheet.cf.panel.styleRule')}
            </div>
            <Select
                className="univer-mt-3 univer-w-full"
                value={type}
                options={options}
                onChange={(v) => {
                    setType(v);
                    _onChange({ type: v, isPercent, value, style });
                }}
            />
            {['isNotBottom', 'isBottom'].includes(type) && (
                <div className="univer-mt-3 univer-flex univer-items-center">
                    <InputNumber
                        min={1}
                        max={1000}
                        value={value}
                        onChange={(v) => {
                            const value = v || 0;
                            setValue(value);
                            _onChange({ type, isPercent, value, style });
                        }}
                    />
                    <div
                        className="univer-ml-3 univer-flex univer-items-center univer-text-xs"
                    >
                        <Checkbox
                            checked={isPercent}
                            onChange={(v) => {
                                setIsPercent(!!v);
                                _onChange({ type, isPercent: !!v, value, style });
                            }}
                        />
                        {localeService.t('sheet.cf.valueType.percent')}
                    </div>

                </div>
            )}
            <div className={previewClassName}>
                <Preview rule={getResult({ type, isPercent, value, style }) as IConditionalFormattingRuleConfig} />
            </div>
            <ConditionalStyleEditor
                style={rule?.style}
                className="univer-mt-3"
                onChange={(v) => {
                    setStyle(v);
                    _onChange({ type, isPercent, value, style: v });
                }}
            />
        </div>
    );
};
