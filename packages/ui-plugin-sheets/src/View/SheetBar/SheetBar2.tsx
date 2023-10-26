import { InsertSheetCommand } from '@univerjs/base-sheets';
import { Button, Icon, ITabRef } from '@univerjs/base-ui';
import { ICommandService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useRef } from 'react';

import styles from './index.module.less';
import { SheetBarMenu } from './SheetBarMenu/SheetBarMenu';
import { IBaseSheetBarProps } from './SheetBarTabs/SheetBarItem';
import { SheetBarTabs } from './SheetBarTabs/SheetBarTabs';

const SCROLL_WIDTH = 100;

export const SheetBar2 = (props: IBaseSheetBarProps) => {
    const sheetBarContentRef = useRef<ITabRef>(null);

    const commandService = useDependency(ICommandService);

    // Complete the _addSheet, handleScrollLeft, and handleScrollRight functions
    const _addSheet = () => {
        commandService.executeCommand(InsertSheetCommand.id, {});
    };

    const handleScrollLeft = () => {
        if (sheetBarContentRef.current) {
            sheetBarContentRef.current.scrollContent(-SCROLL_WIDTH);
        }
    };

    const handleScrollRight = () => {
        if (sheetBarContentRef.current) {
            sheetBarContentRef.current.scrollContent(SCROLL_WIDTH);
        }
    };

    return (
        <div className={styles.sheetBar}>
            <div className={styles.sheetBarOptions}>
                {/* Add sheet button */}
                <Button
                    className={styles.sheetBarOptionsButton}
                    onClick={() => {
                        // Call the _addSheet function here
                    }}
                >
                    <Icon.Math.AddIcon style={{ fontSize: '20px' }} />
                </Button>
                {/* All sheets button */}
                <SheetBarMenu />
            </div>

            {/* All sheets tabs */}
            <SheetBarTabs />

            {/* Scroll arrows */}
            <div className={`${styles.sheetBarOptions} ${styles.sheetBarScrollButton}`}>
                <Button className={styles.sheetBarOptionsButton} onClick={handleScrollLeft}>
                    <Icon.NextIcon rotate={90} style={{ padding: '5px' }} />
                </Button>
                <Button className={styles.sheetBarOptionsButton} onClick={handleScrollRight}>
                    <Icon.NextIcon rotate={-90} style={{ padding: '5px' }} />
                </Button>
            </div>
        </div>
    );
};
