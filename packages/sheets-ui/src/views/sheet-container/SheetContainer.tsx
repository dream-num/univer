/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
import type { IUniverSheetsUIConfig } from '../../controllers/config.schema';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { ContextMenuPosition, IMenuManagerService, ToolbarItem, useConfigValue, useDependency, useObservable } from '@univerjs/ui';
import { useMemo } from 'react';
import { useActiveWorkbook } from '../../components/hook';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../../controllers/config.schema';
import { AutoFillPopupMenu } from '../auto-fill-popup-menu/AutoFillPopupMenu';
import { EditorContainer } from '../editor-container/EditorContainer';
import { FormulaBar } from '../formula-bar/FormulaBar';
import { SheetBar } from '../sheet-bar/SheetBar';
import { SheetZoomSlider } from '../sheet-slider/CountBar';
import { StatusBar } from '../status-bar/StatusBar';

export const SHEET_FOOTER_BAR_HEIGHT = 36;

export function RenderSheetFooter() {
    const config = useConfigValue<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
    const menuManagerService = useDependency(IMenuManagerService);
    const showFooter = config?.footer ?? true;
    const workbook = useActiveWorkbook();
    if (!workbook || !showFooter) return null;

    const footerMenus = menuManagerService.getMenuByPositionKey(ContextMenuPosition.FOOTER_MENU);
    const { sheetBar = true, statisticBar = true, menus = true, zoomSlider = true } = config?.footer || {};
    if (!sheetBar && !statisticBar && !menus && !zoomSlider) return null;

    return (
        <section
            className={`
              univer-box-border univer-flex univer-items-center univer-justify-between univer-bg-white univer-px-5
              univer-text-gray-900
              dark:univer-bg-gray-900 dark:univer-text-gray-200
            `}
            style={{
                height: SHEET_FOOTER_BAR_HEIGHT,
            }}
            data-range-selector
        >
            {sheetBar && <SheetBar />}
            {statisticBar && <StatusBar />}
            {menus && footerMenus.length && (
                <div className="univer-box-border univer-flex univer-gap-2 univer-px-2">
                    {footerMenus.map((item) => item.children?.map((child) => (
                        child?.item && (
                            <ToolbarItem
                                key={child.key}
                                {...child.item}
                            />
                        )
                    )))}
                </div>
            )}
            {zoomSlider && <SheetZoomSlider />}
        </section>
    );
}

export function RenderSheetHeader() {
    const config = useConfigValue<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
    const hasWorkbook = useHasWorkbook();
    if (!hasWorkbook) return null;

    if (config?.formulaBar !== false) {
        return <FormulaBar />;
    }

    return null;
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
            <AutoFillPopupMenu />
        </>
    );
}

function useHasWorkbook(): boolean {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = useObservable(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), null, false, []);
    const hasWorkbook = !!workbook;
    return useMemo(
        () => univerInstanceService.getAllUnitsForType(UniverInstanceType.UNIVER_SHEET).length > 0,

        [univerInstanceService, hasWorkbook]
    );
}
