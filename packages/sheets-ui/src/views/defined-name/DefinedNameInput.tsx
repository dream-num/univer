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

import type { Nullable, Workbook } from '@univerjs/core';
import type { IDefinedNamesServiceParam } from '@univerjs/engine-formula';
import type { IRangeSelectorProps } from '../../basics/editor/range';
import { AbsoluteRefType, IUniverInstanceService, LocaleService, Tools, UniverInstanceType } from '@univerjs/core';
import { borderBottomClassName, borderClassName, Button, clsx, Input, Radio, RadioGroup, Select } from '@univerjs/design';
import { IDefinedNamesService, IFunctionService, isReferenceStrings, isReferenceStringWithEffectiveColumn, LexerTreeBuilder, operatorToken } from '@univerjs/engine-formula';
import { hasCJKText } from '@univerjs/engine-render';
import { ErrorSingle } from '@univerjs/icons';
import { SCOPE_WORKBOOK_VALUE_DEFINED_NAME } from '@univerjs/sheets';
import { ComponentManager, useDependency, useSidebarClick } from '@univerjs/ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY, RANGE_SELECTOR_COMPONENT_KEY } from '../../common/keys';

export interface IDefinedNameInputProps extends Omit<IDefinedNamesServiceParam, 'id'> {
    inputId: string;
    type?: string;
    state: boolean;
    confirm?: (param: IDefinedNamesServiceParam) => void;
    cancel?: () => void;
    id?: string;
}

export const DefinedNameInput = (props: IDefinedNameInputProps) => {
    const {
        inputId,
        state = false,
        type = 'range',
        confirm,
        cancel,
        name,
        formulaOrRefString,
        comment = '',
        localSheetId = SCOPE_WORKBOOK_VALUE_DEFINED_NAME,
        hidden = false, // 是否对用户隐藏，与excel兼容，暂时用不上。
        id,

    } = props;
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const localeService = useDependency(LocaleService);
    const definedNamesService = useDependency(IDefinedNamesService);
    const functionService = useDependency(IFunctionService);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);
    const componentManager = useDependency(ComponentManager);

    const RangeSelector: React.ComponentType<IRangeSelectorProps> = useMemo(() => componentManager.get(RANGE_SELECTOR_COMPONENT_KEY), []) as any;
    const FormulaEditor = useMemo(() => componentManager.get(EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY), []);
    if (workbook == null) {
        return;
    }

    const unitId = useMemo(() => workbook.getUnitId(), []);

    const subUnitId = useMemo(() => workbook.getActiveSheet().getSheetId(), []);

    const [nameValue, setNameValue] = useState(name);

    const [formulaOrRefStringValue, setFormulaOrRefStringValue] = useState(formulaOrRefString);

    const [commentValue, setCommentValue] = useState(comment);

    const [localSheetIdValue, setLocalSheetIdValue] = useState(localSheetId);

    const [validString, setValidString] = useState('');

    const [typeValue, setTypeValue] = useState(type);

    const [validFormulaOrRange, setValidFormulaOrRange] = useState(true);

    const options = [{
        label: localeService.t('definedName.scopeWorkbook'),
        value: SCOPE_WORKBOOK_VALUE_DEFINED_NAME,
    }];

    const isFormula = (token: string) => {
        return !isReferenceStrings(token);
    };

    useEffect(() => {
        setValidFormulaOrRange(true);
        setNameValue(name);
        setCommentValue(comment);
        setLocalSheetIdValue(localSheetId);
        let formulaOrRefStringCache = formulaOrRefString;
        if (formulaOrRefString.substring(0, 1) === operatorToken.EQUALS) {
            setTypeValue('formula');
        } else if (isFormula(formulaOrRefString)) {
            setTypeValue('formula');
            formulaOrRefStringCache = operatorToken.EQUALS + formulaOrRefString;
        } else {
            setTypeValue('range');
        }

        setFormulaOrRefStringValue(formulaOrRefStringCache);

        setValidString('');
    }, [state]);

    workbook.getSheetOrders().forEach((sheetId) => {
        const sheet = workbook.getSheetBySheetId(sheetId);
        options.push({
            label: sheet?.getName() || '',
            value: sheetId,
        });
    });

    const rangeSelectorChange = (rangesText: string) => {
        setFormulaOrRefStringValue(rangesText);
    };

    const formulaEditorChange = (value: Nullable<string>) => {
        setFormulaOrRefStringValue(value || '');
    };

    const confirmChange = () => {
        if (nameValue.length === 0) {
            setValidString(localeService.t('definedName.nameEmpty'));
            return;
        }

        if (definedNamesService.getValueByName(unitId, nameValue) != null && (id == null || id.length === 0)) {
            setValidString(localeService.t('definedName.nameDuplicate'));
            return;
        }

        if (!Tools.isValidParameter(nameValue) || isReferenceStringWithEffectiveColumn(nameValue) || (!Tools.isStartValidPosition(nameValue) && !hasCJKText(nameValue.substring(0, 1)))) {
            setValidString(localeService.t('definedName.nameInvalid'));
            return;
        }

        const sheetNames = workbook.getSheetOrders().map((sheetId) => {
            return workbook.getSheetBySheetId(sheetId)?.getName() || '';
        });

        if (sheetNames.includes(nameValue)) {
            setValidString(localeService.t('definedName.nameSheetConflict'));
            return;
        }

        if (formulaOrRefStringValue.length === 0) {
            setValidString(localeService.t('definedName.formulaOrRefStringEmpty'));
            return;
        }

        if (!validFormulaOrRange) {
            setValidString(localeService.t('definedName.formulaOrRefStringInvalid'));
            return;
        }

        if (functionService.hasExecutor(nameValue.toUpperCase())) {
            setValidString(localeService.t('definedName.nameConflict'));
            return;
        }

        const currentSheetName = workbook.getActiveSheet().getName();
        confirm && confirm({
            id: id || '',
            name: nameValue,
            formulaOrRefString: lexerTreeBuilder.convertRefersToAbsolute(formulaOrRefStringValue, AbsoluteRefType.ALL, AbsoluteRefType.ALL, currentSheetName),
            comment: commentValue,
            localSheetId: localSheetIdValue,
        });
    };

    const typeValueChange = (value: string | number | boolean) => {
        const type = value as string;
        if (type === 'formula') {
            if (formulaOrRefString[0] === operatorToken.EQUALS) {
                setFormulaOrRefStringValue(formulaOrRefString);
            } else {
                setFormulaOrRefStringValue(`${operatorToken.EQUALS}`);
            }
        } else {
            if (formulaOrRefString[0] === operatorToken.EQUALS) {
                setFormulaOrRefStringValue('');
            } else {
                setFormulaOrRefStringValue(formulaOrRefString);
            }
        }
        setTypeValue(type);
    };

    const formulaEditorRef = useRef<any>(null);
    const [isFocusFormulaEditor, isFocusFormulaEditorSet] = useState(false);

    useSidebarClick((e: MouseEvent) => {
        const isOutSide = formulaEditorRef.current?.isClickOutSide(e);
        isOutSide && isFocusFormulaEditorSet(false);
    });

    return (
        <div
            className={clsx('univer-grid univer-space-y-2 univer-pb-1', borderBottomClassName, {
                'univer-hidden': !state,
            })}
        >
            <div>
                <Input
                    className="univer-w-full"
                    placeholder={localeService.t('definedName.inputNamePlaceholder')}
                    value={nameValue}
                    allowClear
                    onChange={setNameValue}
                />
            </div>
            <div>
                <RadioGroup value={typeValue} onChange={typeValueChange}>
                    <Radio value="range">{localeService.t('definedName.ratioRange')}</Radio>
                    <Radio value="formula">{localeService.t('definedName.ratioFormula')}</Radio>
                </RadioGroup>
            </div>
            {typeValue === 'range'
                ? (
                    RangeSelector && (
                        <RangeSelector
                            unitId={unitId}
                            subUnitId={subUnitId}
                            initialValue={formulaOrRefStringValue}
                            onChange={(_, text) => rangeSelectorChange(text)}
                            supportAcrossSheet
                        />
                    )
                )
                : (FormulaEditor && (
                    <div
                        className={`
                          univer-relative univer-mt-4 univer-h-full univer-rounded univer-px-1.5 univer-transition-all
                          univer-duration-150
                        `}
                    >
                        <div className="univer-relative univer-h-8 univer-select-none">
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
                                initValue={formulaOrRefStringValue as any}
                                unitId={unitId}
                                subUnitId={subUnitId}
                                isFocus={isFocusFormulaEditor}
                                isSupportAcrossSheet
                                onChange={(v = '') => {
                                    const formula = v || '';
                                    formulaEditorChange(formula);
                                }}
                                onVerify={(res: boolean) => {
                                    setValidFormulaOrRange(res);
                                }}
                                onFocus={() => isFocusFormulaEditorSet(true)}
                            />
                        </div>
                    </div>
                ))}
            <div>
                <Select
                    className="univer-w-full"
                    value={localSheetIdValue}
                    options={options}
                    onChange={setLocalSheetIdValue}
                />
            </div>
            <div>
                <Input
                    className="univer-w-full"
                    placeholder={localeService.t('definedName.inputCommentPlaceholder')}
                    value={commentValue}
                    onChange={setCommentValue}
                />
            </div>
            <div
                className={clsx('univer-items-center univer-text-sm univer-text-red-500', {
                    'univer-hidden': validString.length === 0,
                    'univer-flex': validString.length !== 0,
                })}
            >
                <span className="univer-mr-0.5">
                    {validString}
                </span>
                <ErrorSingle />
            </div>
            <div>
                <Button
                    onClick={() => {
                        cancel?.();
                    }}
                >
                    {localeService.t('definedName.cancel')}
                </Button>
                <Button
                    style={{ marginLeft: 15 }}
                    variant="primary"
                    onClick={confirmChange}
                >
                    {localeService.t('definedName.confirm')}
                </Button>
            </div>
        </div>
    );
};
