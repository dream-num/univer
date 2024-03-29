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

import React, { useState } from 'react';

import { RangeSelector, TextEditor } from '@univerjs/ui';
import type { IUnitRange } from '@univerjs/core';
import { IUniverInstanceService, LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { Button, Input, Radio, RadioGroup, Select } from '@univerjs/design';
import { type IDefinedNamesServiceParam, serializeRangeToRefString } from '@univerjs/engine-formula';
import styles from './index.module.less';

export interface IDefinedNameInputProps extends IDefinedNamesServiceParam {
    type?: string;
    state: boolean;
    key: string;
    confirm?: (param: IDefinedNamesServiceParam) => void;
    cancel?: () => void;
}

const editorStyle: React.CSSProperties = {
    width: '100%',
};

export const DefinedNameInput = (props: IDefinedNameInputProps) => {
    const {
        key,
        state = false,
        type = 'range',
        confirm,
        cancel,
        name,
        formulaOrRefString,
        comment = '',
        localSheetId = 'AllDefaultWorkbook',
        hidden = false, // 是否对用户隐藏，与excel兼容，暂时用不上。

    } = props;
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();
    const localeService = useDependency(LocaleService);

    if (workbook == null) {
        return;
    }

    const unitId = workbook.getUnitId();

    const sheetId = workbook.getActiveSheet().getSheetId();

    const [stateValue, setStateValue] = useState(state);
    const [nameValue, setNameValue] = useState(name);
    const [formulaOrRefStringValue, setFormulaOrRefStringValue] = useState(formulaOrRefString);
    const [commentValue, setCommentValue] = useState(comment);
    const [localSheetIdValue, setLocalSheetIdValue] = useState(localSheetId);

    const [typeValue, setTypeValue] = useState(type);

    const options = [{
        label: localeService.t('definedName.scopeWorkbook'),
        value: 'AllDefaultWorkbook',
    }];

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

    return (
        <div key={key} style={{ display: stateValue ? 'unset' : 'none' }}>
            <div>
                <Input value={nameValue} allowClear onChange={setNameValue} />
            </div>
            <div>
                <RadioGroup value={typeValue} onChange={(value) => { setTypeValue(value.toString()); }}>
                    <Radio value="range">{localeService.t('definedName.ratioRange')}</Radio>
                    <Radio value="formula">{localeService.t('definedName.ratioFormula')}</Radio>
                </RadioGroup>
            </div>
            <div style={{ display: typeValue === 'range' ? 'unset' : 'none' }}>
                <RangeSelector value={formulaOrRefStringValue} onChange={(ranges) => { setFormulaOrRefStringValue(convertRangeToString(ranges)); }} placeholder="please input value" id="test-rangeSelector-1" width={280} openForSheetUnitId={unitId} openForSheetSubUnitId={sheetId} />
            </div>
            <div style={{ display: typeValue === 'range' ? 'none' : 'unset' }}>
                <TextEditor value={`=${formulaOrRefStringValue}`} onChange={(value) => { setFormulaOrRefStringValue(value || ''); }} id="test-editor-2" placeholder="please input value" openForSheetUnitId={unitId} openForSheetSubUnitId={sheetId} onlyInputFormula={true} style={editorStyle} canvasStyle={{ fontSize: 10 }} />
            </div>
            <div>
                <Select value={localSheetIdValue} options={options} onChange={setLocalSheetIdValue} />
            </div>
            <div>
                <Input value={commentValue} onChange={setCommentValue} />
            </div>
            <div>
                <Button onClick={() => {
                    setStateValue(false);
                    cancel && cancel();
                }}
                >
                    default button
                </Button>
                <Button
                    type="primary"
                    onClick={() => {
                        setStateValue(false);
                        confirm && confirm({
                            name: nameValue,
                            formulaOrRefString: formulaOrRefStringValue,
                            comment: commentValue,
                            localSheetId: localSheetIdValue,
                        });
                    }}
                >
                    primary button
                </Button>
            </div>
        </div>
    );
};
