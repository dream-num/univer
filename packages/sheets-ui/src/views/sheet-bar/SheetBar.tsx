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

import type { IUniverSheetsUIConfig } from '../../config/config';
import type { IScrollState } from '../../services/sheet-bar/type';
import {
    DEFAULT_WORKSHEET_COLUMN_COUNT,
    DEFAULT_WORKSHEET_ROW_COUNT,
    ICommandService,
    IPermissionService,
    throttle,
} from '@univerjs/core';
import { IncreaseIcon, MoreLeftIcon, MoreRightIcon } from '@univerjs/icons';
import { InsertSheetCommand, WorkbookCreateSheetPermission, WorkbookEditablePermission } from '@univerjs/sheets';
import { useConfigValue, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../../config/config';
import { ISheetBarService } from '../../services/sheet-bar/sheet-bar.service';
import { useActiveWorkbook } from '../hook';
import { SheetBarButton } from './sheet-bar-button/SheetBarButton';
import { SheetBarMenu } from './sheet-bar-menu/SheetBarMenu';
import { SheetBarTabs } from './sheet-bar-tabs/SheetBarTabs';

const SCROLL_WIDTH = 100;

export const SheetBar = () => {
    const [leftScrollState, setLeftScrollState] = useState(true);
    const [rightScrollState, setRightScrollState] = useState(true);

    const commandService = useDependency(ICommandService);
    const sheetBarService = useDependency(ISheetBarService);
    const permissionService = useDependency(IPermissionService);

    const workbook = useActiveWorkbook()!;
    const unitId = workbook.getUnitId();

    const workbookEditablePermission = useObservable(permissionService.getPermissionPoint$(new WorkbookEditablePermission(unitId)?.id));
    const workbookCreateSheetPermission = useObservable(permissionService.getPermissionPoint$(new WorkbookCreateSheetPermission(unitId)?.id));

    const config = useConfigValue<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
    const {
        show: addSheetButtonShow = true,
        defaultRowCount = DEFAULT_WORKSHEET_ROW_COUNT,
        defaultColumnCount = DEFAULT_WORKSHEET_COLUMN_COUNT,
    } = (config?.footer || {}).addSheetButtonConfig || {};

    const updateScrollButtonState = (state: IScrollState) => {
        const { leftEnd, rightEnd } = state;
        setLeftScrollState(leftEnd);
        setRightScrollState(rightEnd);
    };

    useEffect(() => {
        const subscription = sheetBarService.scroll$.subscribe(throttle((state: IScrollState) => {
            updateScrollButtonState(state);
        }, 100));

        return () => {
            subscription.unsubscribe();
        };
    }, [sheetBarService.scroll$]);

    // Complete the _addSheet, handleScrollLeft, and handleScrollRight functions
    const addSheet = () => {
        commandService.executeCommand(InsertSheetCommand.id, {
            sheet: {
                rowCount: defaultRowCount,
                columnCount: defaultColumnCount,
            },
        });
        setTimeout(() => {
            sheetBarService.setAddSheet(0);
        }, 0);
    };

    const handleScrollLeft = () => {
        sheetBarService.setScrollX(-SCROLL_WIDTH);
    };

    const handleScrollRight = () => {
        sheetBarService.setScrollX(SCROLL_WIDTH);
    };

    return (
        <div className="univer-relative univer-flex univer-h-full univer-min-w-0 univer-flex-1">
            <div className="univer-flex univer-items-center">
                {/* Add sheet button */}
                {addSheetButtonShow && (
                    <SheetBarButton
                        className="univer-mr-2"
                        onClick={addSheet}
                        disabled={!(workbookCreateSheetPermission?.value && workbookEditablePermission?.value)}
                    >
                        <IncreaseIcon />
                    </SheetBarButton>
                )}
                {/* All sheets button */}
                <SheetBarMenu />
            </div>

            {/* All sheets tabs */}
            <SheetBarTabs />

            {/* Scroll arrows */}
            {(!leftScrollState || !rightScrollState) && (
                <div
                    data-u-comp="sheet-bar-scroll-buttons"
                    className={`
                      univer-relative univer-flex univer-items-center univer-px-2
                      after:univer-absolute after:univer-right-0 after:univer-top-1/2 after:univer-h-4 after:univer-w-px
                      after:-univer-translate-y-1/2 after:univer-bg-gray-200 after:univer-content-[""]
                      rtl:univer-flex-row-reverse
                      rtl:after:univer-left-0 rtl:after:univer-right-auto
                    `}
                >
                    <SheetBarButton disabled={leftScrollState} onClick={handleScrollLeft}>
                        <MoreLeftIcon />
                    </SheetBarButton>
                    <SheetBarButton disabled={rightScrollState} onClick={handleScrollRight}>
                        <MoreRightIcon />
                    </SheetBarButton>
                </div>
            )}
        </div>
    );
};
