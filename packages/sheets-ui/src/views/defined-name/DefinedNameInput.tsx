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

import type { Nullable, Workbook } from '@univerjs/core';

import { AbsoluteRefType, IUniverInstanceService, LocaleService, Tools, UniverInstanceType, useDependency } from '@univerjs/core';
import { Button, Input, Radio, RadioGroup, Select } from '@univerjs/design';
import { IDefinedNamesService, type IDefinedNamesServiceParam, IFunctionService, isReferenceStrings, isReferenceStringWithEffectiveColumn, LexerTreeBuilder, operatorToken } from '@univerjs/engine-formula';
import { hasCJKText } from '@univerjs/engine-render';
import { ErrorSingle } from '@univerjs/icons';
import { SCOPE_WORKBOOK_VALUE_DEFINED_NAME } from '@univerjs/sheets';
import { ComponentManager, useSidebarClick } from '@univerjs/ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY, RANGE_SELECTOR_COMPONENT_KEY } from '../../common/keys';
import styles from './index.module.less';

export interface IDefinedNameInputProps extends Omit<IDefinedNamesServiceParam, 'id'> {
    inputId: string;
    type?: string;
    state: boolean;
    confirm?: (param: IDefinedNamesServiceParam) => void;
    cancel?: () => void;
    id?: string;
}

const widthStyle: React.CSSProperties = {
    width: '100%',
};

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

    const RangeSelector = useMemo(() => componentManager.get(RANGE_SELECTOR_COMPONENT_KEY), []);
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

    const rangeSelectorActionsRef = useRef<any>({});
    const [isFocusRangeSelector, isFocusRangeSelectorSet] = useState(false);

    const options = [{
        label: localeService.t('definedName.scopeWorkbook'),
        value: SCOPE_WORKBOOK_VALUE_DEFINED_NAME,
    }];

    const isFormula = (token: string) => {
        return !isReferenceStrings(token);
    };

    useEffect(() => {
        isFocusRangeSelectorSet(false);
    }, [subUnitId]);

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

    const formulaEditorActionsRef = useRef<any>({});
    const [isFocusFormulaEditor, isFocusFormulaEditorSet] = useState(false);

    useSidebarClick((e: MouseEvent) => {
        const handleOutClick = rangeSelectorActionsRef.current?.handleOutClick;
        handleOutClick && handleOutClick(e, () => isFocusRangeSelectorSet(false));
    });

    useSidebarClick((e: MouseEvent) => {
        const handleOutClick = formulaEditorActionsRef.current?.handleOutClick;
        handleOutClick && handleOutClick(e, () => isFocusFormulaEditorSet(false));
    });

    return (
        <div className={styles.definedNameInput} style={{ display: state ? 'block' : 'none' }}>
            <div>
                <Input placeholder={localeService.t('definedName.inputNamePlaceholder')} value={nameValue} allowClear onChange={setNameValue} affixWrapperStyle={widthStyle} />
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
                            initValue={formulaOrRefStringValue}
                            onChange={rangeSelectorChange}
                            isFocus={isFocusRangeSelector}
                            onFocus={() => isFocusRangeSelectorSet(true)}
                            actions={rangeSelectorActionsRef.current}
                            isSupportAcrossSheet
                        />
                    )
                )
                : (FormulaEditor && (
                    <FormulaEditor
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
                        actions={formulaEditorActionsRef.current}
                    />
                ))}
            <div>
                <Select style={widthStyle} value={localSheetIdValue} options={options} onChange={setLocalSheetIdValue} />
            </div>
            <div>
                <Input affixWrapperStyle={widthStyle} placeholder={localeService.t('definedName.inputCommentPlaceholder')} value={commentValue} onChange={setCommentValue} />
            </div>
            <div style={{ display: validString.length === 0 ? 'none' : 'flex' }} className={styles.definedNameInputValidation}>
                <span>
                    {validString}
                </span>
                <ErrorSingle />
            </div>
            <div>
                <Button onClick={() => {
                    cancel && cancel();
                }}
                >
                    {localeService.t('definedName.cancel')}
                </Button>
                <Button
                    style={{ marginLeft: 15 }}
                    type="primary"
                    onClick={confirmChange}
                >
                    {localeService.t('definedName.confirm')}
                </Button>
            </div>
        </div>
    );
};
