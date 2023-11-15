import { ISidebarService } from '@univerjs/base-ui';
import { LocaleService } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useState } from 'react';

import styles from './index.module.less';
import { InputParams } from './InputParams';
import { SelectFunction } from './select-function/SelectFunction';

export function MoreFunctions() {
    const [selectFunction, setSelectFunction] = useState<boolean>(true);
    const [inputParams, setInputParams] = useState<boolean>(false);

    const localeService = useDependency(LocaleService);
    const sidebarService = useDependency(ISidebarService);

    function handleClickNextPrev() {
        setSelectFunction(!selectFunction);
        setInputParams(!inputParams);
    }

    function handleConfirm() {
        sidebarService.close();
    }

    return (
        <div className={styles.formulaMoreFunctions}>
            {selectFunction && <SelectFunction></SelectFunction>}
            {inputParams && <InputParams></InputParams>}
            <div>
                {selectFunction && (
                    <Button type="primary" onClick={handleClickNextPrev}>
                        {localeService.t('formula.moreFunctions.next')}
                    </Button>
                )}
                {inputParams && (
                    <Button type="text" onClick={handleClickNextPrev}>
                        {localeService.t('formula.moreFunctions.prev')}
                    </Button>
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
