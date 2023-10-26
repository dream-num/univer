import { SetWorksheetShowCommand } from '@univerjs/base-sheets';
import { Button, Dropdown2, Icon, joinClassNames } from '@univerjs/base-ui';
import { BooleanNumber, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { IBaseSheetBarProps } from '../SheetBarTabs/SheetBarItem';
import styles from './index.module.less';

export interface ISheetBarMenuItem {
    label?: string;
    hide?: boolean;
    selected?: boolean;
    index?: string;
    sheetId?: string;
    onClick?: (e?: React.MouseEvent) => void;
}

export interface ISheetBarMenuProps {
    style?: React.CSSProperties;
    onClick?: (e?: MouseEvent) => void;
}

export function SheetBarMenu(props: ISheetBarMenuProps) {
    // const [showMenu, setShowMenu] = useState(show);
    const [menu, setMenu] = useState<IBaseSheetBarProps[]>([]);

    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();

    const handleClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>, item: ISheetBarMenuItem) => {
        e.stopPropagation();
        if (item.onClick) {
            item.onClick(e);
        }
    };

    useEffect(() => {
        statusInit();
    }, []);

    const statusInit = () => {
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

        // TODO: update state to the component, including active sheet index

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
                            onClick={(e) => handleClick(e, item)}
                            className={joinClassNames(styles.sheetBarMenuItem)}
                        >
                            <span className={styles.sheetBarMenuIcon}>{item.selected ? '✔' : ''}</span>
                            <span className={styles.sheetBarMenuTitle}>{item.label}</span>
                        </li>
                    ))}
                </ul>
            }
        >
            <Button className={styles.sheetBarOptionsButton} onClick={() => {}}>
                <Icon.MenuIcon style={{ fontSize: '20px' }} />
            </Button>
        </Dropdown2>
    );
}

function EffIcon(props: { item: ISheetBarMenuItem }) {
    if (props.item.hide) {
        return <Icon.HideIcon />;
    }
    if (props.item.selected) {
        return <span className={styles.sheetBarMenuSvg}> ✔ </span>;
    }
    return <></>;
}
