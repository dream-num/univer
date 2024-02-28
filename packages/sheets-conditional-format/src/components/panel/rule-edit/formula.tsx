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

import React, { useEffect, useState } from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { LocaleService } from '@univerjs/core';
import { Input } from '@univerjs/design';
import { RuleType, SubRuleType } from '../../../base/const';
import { ConditionalStyleEditor } from '../../conditional-style-editor';
import type { IAverageHighlightCell, IConditionalFormatRuleConfig, IHighlightCell, IRankHighlightCell } from '../../../models/type';
import stylesBase from '../index.module.less';
import { Preview } from '../../preview';
import styles from './index.module.less';
import type { IStyleEditorProps } from './type';

export const FormulaStyleEditor = (props: IStyleEditorProps) => {
    const { onChange, interceptorManager } = props;
    const localeService = useDependency(LocaleService);

    const rule = props.rule?.type === RuleType.highlightCell ? props.rule : undefined as IRankHighlightCell | IAverageHighlightCell | undefined;

    const [style, styleSet] = useState<IHighlightCell['style']>({});
    const [formula, formulaSet] = useState(() => {
        if (rule?.subType === SubRuleType.formula) {
            return rule.value;
        }
        return '';
    });

    const getResult = (config: {
        style: IHighlightCell['style'];
        formula: string;
    }) => {
        return { style: config.style,
                 value: formula,
                 type: RuleType.highlightCell,
                 subType: SubRuleType.formula };
    };
    useEffect(() => {
        const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().submit, {
            handler() {
                return getResult({ style, formula });
            },
        });
        return dispose as () => void;
    }, [style, formula, interceptorManager]);

    const _onChange = (config: {
        formula: string;
        style: IHighlightCell['style'];
    }) => {
        onChange(getResult(config));
    };
    return (
        <div>
            <div className={`${stylesBase.title} ${stylesBase.mTBase}`}>{localeService.t('sheet.cf.panel.styleRule')}</div>
            <div className={`${stylesBase.mTSm} ${stylesBase.mLXxs}`}>
                <Input
                    value={formula}
                    onChange={(v) => {
                        formulaSet(v);
                        _onChange({ style, formula: v });
                    }}
                />
            </div>

            <div className={`${styles.cfPreviewWrap} ${stylesBase.mLXxs}`}>
                <Preview rule={getResult({ style, formula }) as IConditionalFormatRuleConfig} />
            </div>
            <ConditionalStyleEditor
                style={rule?.style}
                className={`${stylesBase.mTSm} ${stylesBase.mLXxs}`}
                onChange={(v) => {
                    styleSet(v);
                    _onChange({ style: v, formula });
                }}
            />
        </div>
    );
};
