import { IFunctionInfo } from '@univerjs/base-formula-engine';
import { ISidebarService } from '@univerjs/base-ui';
import { LocaleService } from '@univerjs/core';
import { Button } from '@univerjs/design';
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

    function handleClickNextPrev() {
        if (selectFunction) {
            // TODO@Dushusir: insert function
        }

        setSelectFunction(!selectFunction);
        setInputParams(!inputParams);
    }

    function handleConfirm() {
        // TODO@Dushusir: save function  `=${functionInfo?.functionName}(${params.join(',')})`
    }

    return (
        <div className={styles.formulaMoreFunctions}>
            {selectFunction && <SelectFunction onChange={setFunctionInfo}></SelectFunction>}
            {inputParams && <InputParams functionInfo={functionInfo} onChange={setParams}></InputParams>}
            <div className={styles.formulaMoreFunctionsOperation}>
                {selectFunction && (
                    <Button type="primary" onClick={handleClickNextPrev}>
                        {localeService.t('formula.moreFunctions.next')}
                    </Button>
                )}
                {inputParams && (
                    <Button onClick={handleClickNextPrev}>{localeService.t('formula.moreFunctions.prev')}</Button>
                )}
                {inputParams && (
                    <Button type="primary" onClick={handleConfirm}>
                        {localeService.t('formula.moreFunctions.confirm')}
                    </Button>
                )}
            </div>
        </div>
    );
}
