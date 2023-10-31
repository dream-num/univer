import { InsertSheetCommand } from '@univerjs/base-sheets';
import { ICommandService } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { AddWorksheet28, ScrollBarLeft12, ScrollBarRight12 } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useEffect, useState } from 'react';

import { ISheetBarService } from '../../services/sheetbar/sheetbar.service';
import styles from './index.module.less';
import { SheetBarMenu } from './SheetBarMenu/SheetBarMenu';
import { SheetBarTabs } from './SheetBarTabs/SheetBarTabs';
import { IScrollState } from './SheetBarTabs/utils/slide-tab-bar';

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
                    <AddWorksheet28 />
                </Button>
                {/* All sheets button */}
                <SheetBarMenu />
            </div>
        );
    }

    /**
     * Update worksheet info.
     *
     * This method could be triggered when
     */
    private _updateSheetBarStatus(): void {
        const injector = this.context.injector!;
        const univerInstanceService = injector.get(IUniverInstanceService);
        const commandService = injector.get(ICommandService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheets = workbook.getSheets();

        const worksheetMenuItems = sheets.map((sheet, index) => ({
            label: sheet.getName(),
            index: `${index}`,
            sheetId: sheet.getSheetId(),
            hide: sheet.isSheetHidden() === BooleanNumber.TRUE,
            selected: sheet.getStatus() === BooleanNumber.TRUE,
            onClick: (e?: MouseEvent) => {
                const worksheetId = sheet.getSheetId();
                commandService.executeCommand(SetWorksheetShowCommand.id, {
                    workbookId: workbook.getUnitId(),
                    worksheetId,
                });
            },
        }));

        const sheetListItems = sheets
            .filter((sheet) => !sheet.isSheetHidden())
            .map((sheet, index) => ({
                sheetId: sheet.getSheetId(),
                label: sheet.getName(),
                index: `${index}`,
                selected: sheet.getStatus() === BooleanNumber.TRUE,
                color: (sheet.getTabColor() as string) ?? undefined,
                onMouseDown: () => {
                    const worksheetId = sheet.getSheetId();
                    this.setState({
                        activeKey: worksheetId,
                    });

            {/* All sheets tabs */}
            <SheetBarTabs />

            {/* Scroll arrows */}
            <div className={`${styles.sheetBarOptions} ${styles.sheetBarScrollButton}`}>
                <Button type="text" size="small" disabled={leftScrollState} onClick={handleScrollLeft}>
                    <ScrollBarLeft12 />
                </Button>
                <Button type="text" size="small" disabled={rightScrollState} onClick={handleScrollRight}>
                    <ScrollBarRight12 />
                </Button>
            </div>
        );
    }
}
