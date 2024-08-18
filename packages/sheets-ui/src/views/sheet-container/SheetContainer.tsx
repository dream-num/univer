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

import { IUniverInstanceService, UniverInstanceType, useDependency } from '@univerjs/core';
import type { Workbook } from '@univerjs/core';
import React, { useMemo } from 'react';
import { ComponentContainer, useComponentsOfPart, useObservable } from '@univerjs/ui';

import { CountBar } from '../count-bar/CountBar';
import { EditorContainer } from '../editor-container/EditorContainer';
import { FormulaBar } from '../formula-bar/FormulaBar';
import { OperateContainer } from '../operate-container/OperateContainer';
import { SheetBar } from '../sheet-bar/SheetBar';
import { StatusBar } from '../status-bar/StatusBar';
import { useActiveWorkbook } from '../../components/hook';
import { SheetsUIPart } from '../../consts/ui-name';
import styles from './index.module.less';

export function RenderSheetFooter() {
    const workbook = useActiveWorkbook();
    if (!workbook) return null;

    const sheetsFooterComponents = useComponentsOfPart(SheetsUIPart.SHEETS_FOOTER);

    return (
        <section className={styles.sheetContainer} data-range-selector>
            <SheetBar />
            <ComponentContainer components={sheetsFooterComponents} key="sheets-footer" />
            <StatusBar />
            <CountBar />
        </section>
    );
}

export function RenderSheetHeader() {
    const hasWorkbook = useHasWorkbook();
    if (!hasWorkbook) return null;

    return (
        <FormulaBar />
    );
}

/**
 * @deprecated We should not write into this component anymore.
 */
export function RenderSheetContent() {
    const hasWorkbook = useHasWorkbook();
    if (!hasWorkbook) return null;

    return (
        <>
            <EditorContainer />
            <OperateContainer />
        </>
    );
}

function useHasWorkbook(): boolean {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = useObservable(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), null, false, []);
    return useMemo(
        () => univerInstanceService.getAllUnitsForType(UniverInstanceType.UNIVER_SHEET).length > 0,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [univerInstanceService, workbook]
    );
}
