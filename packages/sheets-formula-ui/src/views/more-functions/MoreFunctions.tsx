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

import type { IFunctionInfo } from '@univerjs/engine-formula';
import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, IUniverInstanceService, LocaleService, useDependency } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { IEditorBridgeService, useActiveWorkbook } from '@univerjs/sheets-ui';
import React, { useState } from 'react';
import styles from './index.module.less';
import { InputParams } from './input-params/InputParams';
import { SelectFunction } from './select-function/SelectFunction';

export function MoreFunctions() {
    const workbook = useActiveWorkbook();
    const [selectFunction, setSelectFunction] = useState<boolean>(true);
    const [inputParams, setInputParams] = useState<boolean>(false);
    // const [params, setParams] = useState<string[]>([]); // TODO@Dushusir: bind setParams to InputParams's onChange
    const [functionInfo, setFunctionInfo] = useState<IFunctionInfo | null>(null);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const localeService = useDependency(LocaleService);
    const editorService = useDependency(IEditorService);
    const univerInstanceService = useDependency(IUniverInstanceService);

    function handleClickNextPrev() {
        if (selectFunction) {
            // TODO@Dushusir: insert function
        }

        setSelectFunction(!selectFunction);
        setInputParams(!inputParams);
    }

    function handleConfirm() {
        const sheetTarget = getSheetCommandTarget(univerInstanceService);
        if (!sheetTarget) return;
        editorBridgeService.changeVisible({
            visible: true,
            unitId: sheetTarget.unitId,
            eventType: DeviceInputEventType.Dblclick,
        });
        const editor = editorService.getEditor(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        const formulaEditor = editorService.getEditor(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
        const formulaText = `=${functionInfo?.functionName}(`;
        editor?.replaceText(formulaText);
        formulaEditor?.replaceText(formulaText, false);
    }

    return (
        <div className={styles.formulaMoreFunctions}>
            {selectFunction && <SelectFunction onChange={setFunctionInfo} />}
            {inputParams && <InputParams functionInfo={functionInfo} onChange={() => {}} />}
            <div className={styles.formulaMoreFunctionsOperation}>
                {/* TODO@Dushusir: open input params after range selector refactor */}
                {inputParams && (
                    <Button type="primary" size="small" onClick={handleClickNextPrev}>
                        {localeService.t('formula.moreFunctions.next')}
                    </Button>
                )}
                {inputParams && (
                    <Button size="small" onClick={handleClickNextPrev}>
                        {localeService.t('formula.moreFunctions.prev')}
                    </Button>
                )}
                {selectFunction && !!workbook && (
                    <Button type="primary" size="small" onClick={handleConfirm}>
                        {localeService.t('formula.moreFunctions.confirm')}
                    </Button>
                )}
            </div>
        </div>
    );
}
