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

import type { IScrollState } from './sheet-bar-tabs/utils/slide-tab-bar';
import { ICommandService, IPermissionService } from '@univerjs/core';
import { IncreaseSingle, MoreSingle } from '@univerjs/icons';
import { InsertSheetCommand, WorkbookCreateSheetPermission, WorkbookEditablePermission } from '@univerjs/sheets';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { useActiveWorkbook } from '../../components/hook';
import { ISheetBarService } from '../../services/sheet-bar/sheet-bar.service';
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

    useEffect(() => {
        const subscription = sheetBarService.scroll$.subscribe((state: IScrollState) => {
            updateScrollButtonState(state);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const updateScrollButtonState = (state: IScrollState) => {
        const { leftEnd, rightEnd } = state;
        setLeftScrollState(leftEnd);
        setRightScrollState(rightEnd);
    };

    // Complete the _addSheet, handleScrollLeft, and handleScrollRight functions
    const addSheet = () => {
        commandService.executeCommand(InsertSheetCommand.id);
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
            <div className="univer-flex univer-items-center univer-pl-2">
                {/* Add sheet button */}
                <SheetBarButton
                    className="univer-mr-2"
                    onClick={addSheet}
                    disabled={!(workbookCreateSheetPermission?.value && workbookEditablePermission?.value)}
                >
                    <IncreaseSingle />
                </SheetBarButton>
                {/* All sheets button */}
                <SheetBarMenu />
            </div>

            {/* All sheets tabs */}
            <SheetBarTabs />

            {/* Scroll arrows */}
            {(!leftScrollState || !rightScrollState) && (
                <div
                    className={`
                      univer-relative univer-flex univer-items-center univer-px-2
                      after:univer-absolute after:univer-right-0 after:univer-top-1/2 after:univer-h-4 after:univer-w-px
                      after:-univer-translate-y-1/2 after:univer-bg-gray-200 after:univer-content-[""]
                    `}
                >
                    <SheetBarButton disabled={leftScrollState} onClick={handleScrollLeft}>
                        <MoreSingle className="univer-rotate-180" />
                    </SheetBarButton>
                    <SheetBarButton disabled={rightScrollState} onClick={handleScrollRight}>
                        <MoreSingle />
                    </SheetBarButton>
                </div>
            )}
        </div>
    );
};
