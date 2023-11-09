import { InsertSheetCommand } from '@univerjs/base-sheets';
import { ICommandService } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { IncreaseSingle, MoreSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useEffect, useState } from 'react';

import { ISheetBarService } from '../../services/sheetbar/sheetbar.service';
import styles from './index.module.less';
import { SheetBarMenu } from './sheet-bar-menu/SheetBarMenu';
import { SheetBarTabs } from './sheet-bar-tabs/SheetBarTabs';
import { IScrollState } from './sheet-bar-tabs/utils/slide-tab-bar';

const SCROLL_WIDTH = 100;

export const SheetBar = () => {
    const [leftScrollState, setLeftScrollState] = useState(false);
    const [rightScrollState, setRightScrollState] = useState(false);

    const commandService = useDependency(ICommandService);
    const sheetbarService = useDependency(ISheetBarService);

    useEffect(() => {
        const subscription = sheetbarService.scroll$.subscribe((state: IScrollState) => {
            updateScrollButtonState(state);
        });

        return () => {
            subscription?.unsubscribe();
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
                <Button type="text" size="small" onClick={addSheet}>
                    <IncreaseSingle />
                </Button>
                {/* All sheets button */}
                <SheetBarMenu />
            </div>

            {/* All sheets tabs */}
            <SheetBarTabs />

            {/* Scroll arrows */}
            <div className={styles.sheetBarOptions}>
                <Button type="text" size="small" disabled={leftScrollState} onClick={handleScrollLeft}>
                    <MoreSingle style={{ transform: 'rotateZ(180deg)' }} />
                </Button>
                <Button type="text" size="small" disabled={rightScrollState} onClick={handleScrollRight}>
                    <MoreSingle />
                </Button>
            </div>
        </div>
    );
};
