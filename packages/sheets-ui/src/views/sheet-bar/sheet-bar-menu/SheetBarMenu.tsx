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

import type { ICommandInfo } from '@univerjs/core';
import { BooleanNumber, DisposableCollection, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { Dropdown } from '@univerjs/design';
import { CheckMarkSingle, ConvertSingle, EyelashSingle } from '@univerjs/icons';
import {
    InsertSheetMutation,
    RemoveSheetMutation,
    SetWorksheetActivateCommand,
    SetWorksheetActiveOperation,
    SetWorksheetHideMutation,
    SetWorksheetNameMutation,
    SetWorksheetOrderMutation,
    SetWorksheetShowCommand,
} from '@univerjs/sheets';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { ISheetBarService } from '../../../services/sheet-bar/sheet-bar.service';
import { SheetBarButton } from '../sheet-bar-button/SheetBarButton';
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
    const { style } = props;
    const [menu, setMenu] = useState<ISheetBarMenuItem[]>([]);
    const [visible, setVisible] = useState(false);

    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const sheetBarService = useDependency(ISheetBarService);
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
                unitId: workbook.getUnitId(),
                subUnitId: sheetId,
            });
        }

        setVisible(false);
    };

    useEffect(() => {
        statusInit();

        const _disposables = new DisposableCollection();

        _disposables.add(setupStatusUpdate());
        _disposables.add(
            sheetBarService.registerSheetBarMenuHandler({
                handleSheetBarMenu,
            })
        );

        return () => {
            // Clean up disposable when the component unmounts
            _disposables.dispose();
        };
    }, []);

    const setupStatusUpdate = () =>
        commandService.onCommandExecuted((commandInfo: ICommandInfo) => {
            switch (commandInfo.id) {
                case SetWorksheetHideMutation.id:
                case RemoveSheetMutation.id:
                case SetWorksheetNameMutation.id:
                case InsertSheetMutation.id:
                case SetWorksheetOrderMutation.id:
                case SetWorksheetActiveOperation.id:
                    statusInit();
                    break;
                default:
                    break;
            }
        });

    const statusInit = () => {
        const sheets = workbook.getSheets();
        const activeSheet = workbook.getActiveSheet();
        const worksheetMenuItems = sheets.map((sheet, index) => ({
            label: sheet.getName(),
            index: `${index}`,
            sheetId: sheet.getSheetId(),
            hidden: sheet.isSheetHidden() === BooleanNumber.TRUE,
            selected: activeSheet === sheet,
        }));

        setMenu(worksheetMenuItems);
    };

    function handleSheetBarMenu() {
        setVisible(true);
    }

    const onVisibleChange = (visible: boolean) => {
        setVisible(visible);
    };

    return (
        <Dropdown
            placement="topLeft"
            trigger={['click']}
            overlay={(
                <ul className={styles.sheetBarMenu} style={{ ...style }}>
                    {menu.map((item) => (
                        <li
                            key={item.index}
                            onClick={() => handleClick(item)}
                            className={item.selected
                                ? `${styles.sheetBarMenuItem} ${styles.sheetBarMenuItemSelect}`
                                : item.hidden
                                    ? `${styles.sheetBarMenuItem} ${styles.sheetBarMenuItemHide}`
                                    : styles.sheetBarMenuItem}
                        >
                            <span className={styles.sheetBarMenuItemIcon}>
                                {item.selected
                                    ? (
                                        <CheckMarkSingle />
                                    )
                                    : item.hidden
                                        ? (
                                            <EyelashSingle />
                                        )
                                        : (
                                            <CheckMarkSingle />
                                        )}
                            </span>
                            <span className={styles.sheetBarMenuItemLabel}>{item.label}</span>
                        </li>
                    ))}
                </ul>
            )}
            visible={visible}
            onVisibleChange={onVisibleChange}
        >
            <SheetBarButton>
                <ConvertSingle />
            </SheetBarButton>
        </Dropdown>
    );
}
