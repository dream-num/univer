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
import type { Workbook } from '@univerjs/core';
import { createInternalEditorID, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { TextEditor } from '@univerjs/ui';
import { CFRuleType, CFSubRuleType, SHEET_CONDITIONAL_FORMATTING_PLUGIN } from '@univerjs/sheets-conditional-formatting';
import type { IAverageHighlightCell, IConditionalFormattingRuleConfig, IHighlightCell, IRankHighlightCell } from '@univerjs/sheets-conditional-formatting';
import { ConditionalStyleEditor } from '../../conditional-style-editor';
import stylesBase from '../index.module.less';
import { Preview } from '../../preview';
import styles from './index.module.less';
import type { IStyleEditorProps } from './type';

export const FormulaStyleEditor = (props: IStyleEditorProps) => {
    const { onChange, interceptorManager } = props;
    const localeService = useDependency(LocaleService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const worksheet = workbook.getActiveSheet();

    const rule = props.rule?.type === CFRuleType.highlightCell ? props.rule : undefined as IRankHighlightCell | IAverageHighlightCell | undefined;

    const [style, styleSet] = useState<IHighlightCell['style']>({});
    const [formula, formulaSet] = useState(() => {
        if (rule?.subType === CFSubRuleType.formula) {
            return rule.value;
        }
        return '=';
    });

    const getResult = (config: {
        style: IHighlightCell['style'];
        formula: string;
    }) => {
        return { style: config.style,
                 value: formula,
                 type: CFRuleType.highlightCell,
                 subType: CFSubRuleType.formula };
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
            <div className={`${stylesBase.mTSm}`}>
                <TextEditor
                    id={createInternalEditorID(`${SHEET_CONDITIONAL_FORMATTING_PLUGIN}_formula`)}
                    openForSheetSubUnitId={worksheet.getSheetId()}
                    openForSheetUnitId={workbook.getUnitId()}
                    value={formula}
                    canvasStyle={{ fontSize: 10 }}
                    onlyInputFormula={true}
                    onChange={(v = '') => {
                        const formula = v || '';
                        formulaSet(formula);
                        _onChange({ style, formula });
                    }}
                />
            </div>

            <div className={`${styles.cfPreviewWrap} `}>
                <Preview rule={getResult({ style, formula }) as IConditionalFormattingRuleConfig} />
            </div>
            <ConditionalStyleEditor
                style={rule?.style}
                className={`${stylesBase.mTSm} `}
                onChange={(v) => {
                    styleSet(v);
                    _onChange({ style: v, formula });
                }}
            />
        </div>
    );
};
