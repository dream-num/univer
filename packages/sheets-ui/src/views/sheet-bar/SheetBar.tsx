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

import type { IScrollState } from './sheet-bar-tabs/utils/slide-tab-bar';
import { ICommandService, IPermissionService, useDependency } from '@univerjs/core';
import { IncreaseSingle, MoreSingle } from '@univerjs/icons';
import { InsertSheetCommand, WorkbookCreateSheetPermission, WorkbookEditablePermission } from '@univerjs/sheets';

import { useObservable } from '@univerjs/ui';
import React, { useEffect, useState } from 'react';
import { useActiveWorkbook } from '../../components/hook';
import { ISheetBarService } from '../../services/sheet-bar/sheet-bar.service';
import styles from './index.module.less';
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
        <div className={styles.sheetBar}>
            <div className={styles.sheetBarOptions}>
                {/* Add sheet button */}
                <SheetBarButton onClick={addSheet} disabled={!(workbookCreateSheetPermission?.value && workbookEditablePermission?.value)}>
                    <IncreaseSingle />
                </SheetBarButton>
                {/* All sheets button */}
                <SheetBarMenu />
            </div>

            {/* All sheets tabs */}
            <SheetBarTabs />

            {/* Scroll arrows */}
            {(!leftScrollState || !rightScrollState) && (
                <div className={`
                  ${styles.sheetBarOptions}
                  ${styles.sheetBarOptionsDivider}
                `}
                >
                    <SheetBarButton disabled={leftScrollState} onClick={handleScrollLeft}>
                        <MoreSingle style={{ transform: 'rotateZ(180deg)' }} />
                    </SheetBarButton>
                    <SheetBarButton disabled={rightScrollState} onClick={handleScrollRight}>
                        <MoreSingle />
                    </SheetBarButton>
                </div>
            )}
        </div>
    );
};
