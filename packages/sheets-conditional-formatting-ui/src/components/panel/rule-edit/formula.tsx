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
import type { IAverageHighlightCell, IConditionalFormattingRuleConfig, IHighlightCell, IRankHighlightCell } from '@univerjs/sheets-conditional-formatting';
import type { IStyleEditorProps } from './type';
import { IUniverInstanceService, LocaleService, UniverInstanceType, useDependency } from '@univerjs/core';
import { CFRuleType, CFSubRuleType } from '@univerjs/sheets-conditional-formatting';
import { FormulaEditor } from '@univerjs/sheets-formula-ui';
import { useSidebarClick } from '@univerjs/ui';
import React, { useEffect, useRef, useState } from 'react';
import { ConditionalStyleEditor } from '../../conditional-style-editor';
import { Preview } from '../../preview';
import stylesBase from '../index.module.less';
import styles from './index.module.less';

export const FormulaStyleEditor = (props: IStyleEditorProps) => {
    const { onChange, interceptorManager } = props;
    const localeService = useDependency(LocaleService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const worksheet = workbook.getActiveSheet();

    const rule = props.rule?.type === CFRuleType.highlightCell ? props.rule : undefined as IRankHighlightCell | IAverageHighlightCell | undefined;

    const divEleRef = useRef<HTMLDivElement>(null);
    const [isFocusFormulaEditor, isFocusFormulaEditorSet] = useState(false);
    const formulaEditorActionsRef = useRef<Parameters<typeof FormulaEditor>[0]['actions']>({});
    const [style, styleSet] = useState<IHighlightCell['style']>({});
    const [formula, formulaSet] = useState(() => {
        if (rule?.subType === CFSubRuleType.formula) {
            return rule.value;
        }
        return '=';
    });
    const [formulaError, formulaErrorSet] = useState<string | undefined>(undefined);

    const getResult = (config: {
        style: IHighlightCell['style'];
        formula: string;
    }) => {
        return {
            style: config.style,
            value: formula,
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.formula,
        };
    };
    useEffect(() => {
        const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().submit, {
            handler() {
                return getResult({ style, formula });
            },
        });
        return dispose as () => void;
    }, [style, formula, interceptorManager]);

    useEffect(() => {
        const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().beforeSubmit, {
            handler: (v, _c, next) => {
                if (formulaError || formula.length === 1 || !formula.startsWith('=')) {
                    formulaErrorSet(localeService.t('sheet.cf.errorMessage.formulaError'));
                    return false;
                }
                return next(v);
            },
        });
        return dispose as () => void;
    }, [formulaError, formula]);

    const _onChange = (config: {
        formula: string;
        style: IHighlightCell['style'];
    }) => {
        onChange(getResult(config));
    };

    useSidebarClick((e: MouseEvent) => {
        const handleOutClick = formulaEditorActionsRef.current?.handleOutClick;
        handleOutClick && handleOutClick(e, () => isFocusFormulaEditorSet(false));
    });

    return (
        <div ref={divEleRef}>
            <div className={`
              ${stylesBase.title}
              ${stylesBase.mTBase}
            `}
            >
                {localeService.t('sheet.cf.panel.styleRule')}
            </div>
            <div className={`
              ${stylesBase.mTSm}
            `}
            >

                <FormulaEditor
                    onChange={(formula) => {
                        formulaSet(formula);
                        _onChange({ style, formula });
                    }}
                    onVerify={(result, formula) => {
                        if (!result || formula.length === 1) {
                            formulaErrorSet(localeService.t('sheet.cf.errorMessage.formulaError'));
                        } else {
                            formulaErrorSet(undefined);
                        }
                    }}
                    errorText={formulaError}
                    onFocus={() => { isFocusFormulaEditorSet(true); }}
                    actions={formulaEditorActionsRef.current}
                    isFocus={isFocusFormulaEditor}
                    initValue={formula as any}
                    unitId={workbook.getUnitId()}
                    subUnitId={worksheet?.getSheetId()}
                >
                </FormulaEditor>

            </div>

            <div className={`
              ${styles.cfPreviewWrap}
            `}
            >
                <Preview rule={getResult({ style, formula }) as IConditionalFormattingRuleConfig} />
            </div>
            <ConditionalStyleEditor
                style={rule?.style}
                className={`
                  ${stylesBase.mTSm}
                `}
                onChange={(v) => {
                    styleSet(v);
                    _onChange({ style: v, formula });
                }}
            />
        </div>
    );
};
