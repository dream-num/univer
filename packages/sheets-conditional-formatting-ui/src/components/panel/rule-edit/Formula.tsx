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
import type { IAverageHighlightCell, IConditionalFormattingRuleConfig, IHighlightCell, IRankHighlightCell } from '@univerjs/sheets-conditional-formatting';
import type { IFormulaEditorRef } from '@univerjs/sheets-formula-ui';
import type { IStyleEditorProps } from './type';
import { IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { borderClassName, clsx } from '@univerjs/design';
import { CFRuleType, CFSubRuleType } from '@univerjs/sheets-conditional-formatting';
import { FormulaEditor } from '@univerjs/sheets-formula-ui';
import { useDependency, useSidebarClick } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { ConditionalStyleEditor } from '../../conditional-style-editor';
import { Preview } from '../../preview';
import { previewClassName } from './styles';

export const FormulaStyleEditor = (props: IStyleEditorProps) => {
    const { onChange, interceptorManager } = props;
    const localeService = useDependency(LocaleService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const worksheet = workbook.getActiveSheet();

    const rule = props.rule?.type === CFRuleType.highlightCell ? props.rule : undefined as IRankHighlightCell | IAverageHighlightCell | undefined;

    const divEleRef = useRef<HTMLDivElement>(null);
    const [isFocusFormulaEditor, setIsFocusFormulaEditor] = useState(false);
    const formulaEditorRef = useRef<IFormulaEditorRef>(null);
    const [style, setStyle] = useState<IHighlightCell['style']>({});
    const [formula, setFormula] = useState(() => {
        if (rule?.subType === CFSubRuleType.formula) {
            return rule.value;
        }
        return '=';
    });
    const [formulaError, setFormulaError] = useState<string | undefined>(undefined);

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
                    setFormulaError(localeService.t('sheet.cf.errorMessage.formulaError'));
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
        const isOutSide = formulaEditorRef.current?.isClickOutSide(e);
        isOutSide && setIsFocusFormulaEditor(false);
    });

    return (
        <div ref={divEleRef}>
            <div
                className={`
                  univer-mt-4 univer-text-sm univer-text-gray-600
                  dark:univer-text-gray-200
                `}
            >
                {localeService.t('sheet.cf.panel.styleRule')}
            </div>
            <div className="univer-mt-3">
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
                    errorText={formulaError}
                    isFocus={isFocusFormulaEditor}
                    initValue={formula as any}
                    unitId={workbook.getUnitId()}
                    subUnitId={worksheet?.getSheetId()}
                    onFocus={() => { setIsFocusFormulaEditor(true); }}
                    onChange={(formula) => {
                        setFormula(formula);
                        _onChange({ style, formula });
                    }}
                    onVerify={(result, formula) => {
                        if (!result || formula.length === 1) {
                            setFormulaError(localeService.t('sheet.cf.errorMessage.formulaError'));
                        } else {
                            setFormulaError(undefined);
                        }
                    }}
                />
            </div>

            <div className={previewClassName}>
                <Preview rule={getResult({ style, formula }) as IConditionalFormattingRuleConfig} />
            </div>
            <ConditionalStyleEditor
                style={rule?.style}
                className="univer-mt-3"
                onChange={(v) => {
                    setStyle(v);
                    _onChange({ style: v, formula });
                }}
            />
        </div>
    );
};
