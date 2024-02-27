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

import { LocaleService } from '@univerjs/core';
import { Button } from '@univerjs/design';
import type { IFunctionInfo } from '@univerjs/engine-formula';
import { IEditorService, ISidebarService } from '@univerjs/ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useState } from 'react';

import styles from './index.module.less';
import { InputParams } from './input-params/InputParams';
import { SelectFunction } from './select-function/SelectFunction';

export function MoreFunctions() {
    const [selectFunction, setSelectFunction] = useState<boolean>(true);
    const [inputParams, setInputParams] = useState<boolean>(false);
    const [params, setParams] = useState<string[]>([]);
    const [functionInfo, setFunctionInfo] = useState<IFunctionInfo | null>(null);

    const localeService = useDependency(LocaleService);
    const sidebarService = useDependency(ISidebarService);
    const editorService = useDependency(IEditorService);

    function handleClickNextPrev() {
        if (selectFunction) {
            // TODO@Dushusir: insert function
        }

        setSelectFunction(!selectFunction);
        setInputParams(!inputParams);
    }

    function handleConfirm() {
        // TODO@Dushusir: save function  `=${functionInfo?.functionName}(${params.join(',')})`
        editorService.setFormula(`=${functionInfo?.functionName}(`);
    }

    return (
        <div className={styles.formulaMoreFunctions}>
            {selectFunction && <SelectFunction onChange={setFunctionInfo} />}
            {inputParams && <InputParams functionInfo={functionInfo} onChange={setParams} />}
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
                {selectFunction && (
                    <Button type="primary" size="small" onClick={handleConfirm}>
                        {localeService.t('formula.moreFunctions.confirm')}
                    </Button>
                )}
            </div>
        </div>
    );
}
