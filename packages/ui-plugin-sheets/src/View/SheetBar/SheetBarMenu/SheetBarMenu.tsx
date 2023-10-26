import {
    InsertSheetMutation,
    RemoveSheetMutation,
    SetWorksheetActivateCommand,
    SetWorksheetActivateMutation,
    SetWorksheetHideMutation,
    SetWorksheetNameMutation,
    SetWorksheetOrderMutation,
    SetWorksheetShowCommand,
} from '@univerjs/base-sheets';
import { Dropdown2, joinClassNames } from '@univerjs/base-ui';
import { BooleanNumber, ICommandInfo, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { Selectedo24, SwitchSheet28 } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import styles from './index.module.less';

export interface ISheetBarMenuItem {
    label?: string;
    hidden?: boolean;
    selected?: boolean;
    index?: string;
    sheetId?: string;
}

export interface ISheetBarMenuProps {
    style?: React.CSSProperties;
    onClick?: (e?: MouseEvent) => void;
}

export function SheetBarMenu(props: ISheetBarMenuProps) {
    const [menu, setMenu] = useState<ISheetBarMenuItem[]>([]);

    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();

    const handleClick = (item: ISheetBarMenuItem) => {
        const { sheetId } = item;
        if (!sheetId) return;

        if (item.hidden) {
            commandService.executeCommand(SetWorksheetShowCommand.id, {
                value: sheetId,
            });
        } else if (!item.selected) {
            commandService.executeCommand(SetWorksheetActivateCommand.id, {
                workbookId: workbook.getUnitId(),
                worksheetId: sheetId,
            });
        }
    };

    useEffect(() => {
        statusInit();

        const disposable = setupStatusUpdate();
        return () => {
            // Clean up disposable when the component unmounts
            disposable.dispose();
        };
    }, []);

    const setupStatusUpdate = () =>
        commandService.onCommandExecuted((commandInfo: ICommandInfo<object>) => {
            switch (commandInfo.id) {
                case SetWorksheetHideMutation.id:
                case RemoveSheetMutation.id:
                case SetWorksheetNameMutation.id:
                case InsertSheetMutation.id:
                case SetWorksheetOrderMutation.id:
                case SetWorksheetActivateMutation.id:
                    statusInit();
                    break;
                default:
                    break;
            }
        });

    const statusInit = () => {
        const sheets = workbook.getSheets();
        const worksheetMenuItems = sheets.map((sheet, index) => ({
            label: sheet.getName(),
            index: `${index}`,
            sheetId: sheet.getSheetId(),
            hidden: sheet.isSheetHidden() === BooleanNumber.TRUE,
            selected: sheet.getStatus() === BooleanNumber.TRUE,
        }));

        setMenu(worksheetMenuItems);
    };

    const { style } = props;

    return (
        <Dropdown2
            placement="topLeft"
            trigger={['click']}
            overlay={
                <ul className={styles.sheetBarMenu} style={{ ...style }}>
                    {menu.map((item) => (
                        <li
                            key={item.index}
                            onClick={() => handleClick(item)}
                            className={joinClassNames(styles.sheetBarMenuItem)}
                        >
                            <span className={styles.sheetBarMenuItemIcon}>{item.selected ? <Selectedo24 /> : ''}</span>
                            <span
                                className={
                                    item.hidden
                                        ? `${styles.sheetBarMenuItemTitle} ${styles.sheetBarMenuItemHide}`
                                        : `${styles.sheetBarMenuItemTitle}`
                                }
                            >
                                {item.label}
                            </span>
                        </li>
                    ))}
                </ul>
            }
        >
            <Button type="text" size="small">
                <SwitchSheet28 />
            </Button>
        </Dropdown2>
    );
}
