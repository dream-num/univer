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
import { IUniverInstanceService, LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { IncreaseSingle } from '@univerjs/icons';
import { Radio, RadioGroup } from '@univerjs/design';
import styles from './index.module.less';

/**
 * Floating editor's container.
 */
export const DefinedNameContainer = () => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();
    const localeService = useDependency(LocaleService);

    const [editState, setEditState] = useState(false);

    if (workbook == null) {
        return;
    }

    const unitId = workbook.getUnitId();

    const sheetId = workbook.getActiveSheet().getSheetId();

    return (
        <>
            <div style={{ display: editState ? 'none' : 'unset' }}>
                <div className={styles.definedNameContainerAddButton}>
                    <IncreaseSingle />
                    <span className={styles.definedNameContainerAddButtonText}>{localeService.t('definedName.addButton')}</span>
                </div>
            </div>

        </>

    );
};
