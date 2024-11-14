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

import type { Workbook } from '@univerjs/core';
import { IUniverInstanceService, UniverInstanceType, useDependency } from '@univerjs/core';
import { ContextMenuPosition, IMenuManagerService, ToolbarItem, useObservable } from '@univerjs/ui';
import React, { useMemo } from 'react';

import { useActiveWorkbook } from '../../components/hook';
import { CountBar } from '../count-bar/CountBar';
import { EditorContainer } from '../editor-container/EditorContainer';
import { FormulaBar } from '../formula-bar/FormulaBar';
import { OperateContainer } from '../operate-container/OperateContainer';
import { SheetBar } from '../sheet-bar/SheetBar';
import { StatusBar } from '../status-bar/StatusBar';
import styles from './index.module.less';

export function RenderSheetFooter() {
    const menuManagerService = useDependency(IMenuManagerService);

    const workbook = useActiveWorkbook();
    const footerMenus = menuManagerService.getMenuByPositionKey(ContextMenuPosition.FOOTER_MENU);

    if (!workbook) return null;
    return (
        <section className={styles.sheetContainer} data-range-selector>
            <SheetBar />
            <StatusBar />
            {footerMenus.map((item) => item.children?.map((child) => (
                child?.item && (
                    <ToolbarItem
                        key={child.key}
                        align={{
                            offset: [-32, 18],
                        }}
                        {...child.item}
                    />
                )
            )))}
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
    const hasWorkbook = !!workbook;
    return useMemo(
        () => univerInstanceService.getAllUnitsForType(UniverInstanceType.UNIVER_SHEET).length > 0,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [univerInstanceService, hasWorkbook]
    );
}
