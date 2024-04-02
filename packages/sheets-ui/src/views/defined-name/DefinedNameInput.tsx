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

import { RangeSelector, TextEditor } from '@univerjs/ui';
import type { IUnitRange, Nullable } from '@univerjs/core';
import { AbsoluteRefType, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { Button, Input, Radio, RadioGroup, Select } from '@univerjs/design';
import { IDefinedNamesService, type IDefinedNamesServiceParam, IFunctionService, isReferenceString, LexerTreeBuilder, operatorToken, serializeRangeToRefString } from '@univerjs/engine-formula';
import { ErrorSingle } from '@univerjs/icons';
import styles from './index.module.less';
import { SCOPE_WORKBOOK_VALUE } from './component-name';

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
        localSheetId = SCOPE_WORKBOOK_VALUE,
        hidden = false, // 是否对用户隐藏，与excel兼容，暂时用不上。
        id,

    } = props;
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();
    const localeService = useDependency(LocaleService);
    const definedNamesService = useDependency(IDefinedNamesService);
    const functionService = useDependency(IFunctionService);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);

    if (workbook == null) {
        return;
    }

    const unitId = workbook.getUnitId();

    const sheetId = workbook.getActiveSheet().getSheetId();

    const [nameValue, setNameValue] = useState(name);
    const [formulaOrRefStringValue, setFormulaOrRefStringValue] = useState(formulaOrRefString);
    const [commentValue, setCommentValue] = useState(comment);
    const [localSheetIdValue, setLocalSheetIdValue] = useState(localSheetId);

    const [validString, setValidString] = useState('');

    const [typeValue, setTypeValue] = useState(type);

    const [validFormulaOrRange, setValidFormulaOrRange] = useState(true);

    const [updateFormulaOrRefStringValue, setUpdateFormulaOrRefStringValue] = useState(formulaOrRefString);

    const options = [{
        label: localeService.t('definedName.scopeWorkbook'),
        value: SCOPE_WORKBOOK_VALUE,
    }];

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
        setUpdateFormulaOrRefStringValue(formulaOrRefStringCache);

        setValidString('');
    }, [state]);

    const isFormula = (token: string) => {
        return !token.split(',').every((refString) => {
            return isReferenceString(refString.trim());
        });
    };

    workbook.getSheetOrders().forEach((sheetId) => {
        const sheet = workbook.getSheetBySheetId(sheetId);
        options.push({
            label: sheet?.getName() || '',
            value: sheetId,
        });
    });

    const convertRangeToString = (ranges: IUnitRange[]) => {
        const refs = ranges.map((range) => {
            return serializeRangeToRefString({
                ...range,
                sheetName: workbook.getSheetBySheetId(range.sheetId)?.getName() || '',
            });
        });

        return refs.join(',');
    };

    const rangeSelectorChange = (ranges: IUnitRange[]) => {
        setUpdateFormulaOrRefStringValue(convertRangeToString(ranges));
    };

    const formulaEditorChange = (value: Nullable<string>) => {
        setUpdateFormulaOrRefStringValue(value || '');
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

        if (updateFormulaOrRefStringValue.length === 0) {
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

        confirm && confirm({
            id: id || '',
            name: nameValue,
            formulaOrRefString: lexerTreeBuilder.convertRefersToAbsolute(updateFormulaOrRefStringValue, AbsoluteRefType.ALL, AbsoluteRefType.ALL),
            comment: commentValue,
            localSheetId: localSheetIdValue,
        });
    };

    const typeValueChange = (value: string | number | boolean) => {
        const type = value as string;
        if (type === 'formula' && formulaOrRefStringValue.substring(0, 1) !== operatorToken.EQUALS) {
            setUpdateFormulaOrRefStringValue(`${operatorToken.EQUALS}`);
            setFormulaOrRefStringValue(`${operatorToken.EQUALS}`);
        } else if (formulaOrRefStringValue.substring(0, 1) === operatorToken.EQUALS) {
            setUpdateFormulaOrRefStringValue('');
            setFormulaOrRefStringValue('');
        }
        setTypeValue(type);
    };

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
            <div style={{ display: typeValue === 'range' ? 'block' : 'none' }}>
                <RangeSelector value={formulaOrRefStringValue} onValid={setValidFormulaOrRange} onChange={rangeSelectorChange} placeholder={localeService.t('definedName.inputRangePlaceholder')} id={`${inputId}-rangeSelector`} width="99%" openForSheetUnitId={unitId} />
            </div>
            <div style={{ display: typeValue === 'range' ? 'none' : 'block' }}>
                <TextEditor value={formulaOrRefStringValue} onValid={setValidFormulaOrRange} onChange={formulaEditorChange} id={`${inputId}-editor`} placeholder={localeService.t('definedName.inputFormulaPlaceholder')} openForSheetUnitId={unitId} onlyInputFormula={true} style={{ width: '99%' }} canvasStyle={{ fontSize: 10 }} />
            </div>
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
