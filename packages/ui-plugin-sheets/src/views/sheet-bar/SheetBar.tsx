import { InsertSheetCommand } from '@univerjs/base-sheets';
import { ICommandService } from '@univerjs/core';
import { Divider } from '@univerjs/design';
import { IncreaseSingle, MoreSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useEffect, useState } from 'react';

import { ISheetBarService } from '../../services/sheet-bar/sheet-bar.service';
import styles from './index.module.less';
import { SheetBarButton } from './sheet-bar-button/SheetBarButton';
import { SheetBarMenu } from './sheet-bar-menu/SheetBarMenu';
import { SheetBarTabs } from './sheet-bar-tabs/SheetBarTabs';
import { IScrollState } from './sheet-bar-tabs/utils/slide-tab-bar';

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
                <div className={styles.sheetBarOptions}>
                    <SheetBarButton disabled={leftScrollState} onClick={handleScrollLeft}>
                        <MoreSingle style={{ transform: 'rotateZ(180deg)' }} />
                    </SheetBarButton>
                    <SheetBarButton disabled={rightScrollState} onClick={handleScrollRight}>
                        <MoreSingle />
                    </SheetBarButton>
                    <Divider length={16} color="rgb(var(--grey-400))" />
                </div>
            )}
        </div>
    );
};
