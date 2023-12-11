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

import { ICommandService } from '@univerjs/core';
import { IncreaseSingle, MoreSingle } from '@univerjs/icons';
import { InsertSheetCommand } from '@univerjs/sheets';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { ISheetBarService } from '../../services/sheet-bar/sheet-bar.service';
import styles from './index.module.less';
import { SheetBarButton } from './sheet-bar-button/SheetBarButton';
import { SheetBarMenu } from './sheet-bar-menu/SheetBarMenu';
import { SheetBarTabs } from './sheet-bar-tabs/SheetBarTabs';
import type { IScrollState } from './sheet-bar-tabs/utils/slide-tab-bar';

const SCROLL_WIDTH = 100;

export const SheetBar = () => {
    const [leftScrollState, setLeftScrollState] = useState(true);
    const [rightScrollState, setRightScrollState] = useState(true);

    const commandService = useDependency(ICommandService);
    const sheetbarService = useDependency(ISheetBarService);

    useEffect(() => {
        const subscription = sheetbarService.scroll$.subscribe((state: IScrollState) => {
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
            sheetbarService.setAddSheet(0);
        }, 0);
    };

    const handleScrollLeft = () => {
        sheetbarService.setScrollX(-SCROLL_WIDTH);
    };

    const handleScrollRight = () => {
        sheetbarService.setScrollX(SCROLL_WIDTH);
    };

    return (
        <div className={styles.sheetBar}>
            <div className={styles.sheetBarOptions}>
                {/* Add sheet button */}
                <SheetBarButton onClick={addSheet}>
                    <IncreaseSingle />
                </SheetBarButton>
                {/* All sheets button */}
                <SheetBarMenu />
            </div>

            {/* All sheets tabs */}
            <SheetBarTabs />

            {/* Scroll arrows */}
            {(!leftScrollState || !rightScrollState) && (
                <div className={`${styles.sheetBarOptions} ${styles.sheetBarOptionsDivider}`}>
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
