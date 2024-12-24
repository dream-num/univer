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

import type { ICommandInfo, Workbook } from '@univerjs/core';
import { BooleanNumber, DisposableCollection, ICommandService, IUniverInstanceService, UniverInstanceType, useDependency } from '@univerjs/core';
import { DropdownLegacy } from '@univerjs/design';
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
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { useObservable } from '@univerjs/ui';
import React, { useCallback, useEffect, useState } from 'react';

import { ISheetBarService } from '../../../services/sheet-bar/sheet-bar.service';
import { SheetBarButton } from '../sheet-bar-button/SheetBarButton';
import styles from './index.module.less';

export interface ISheetBarMenuItem {
    label?: React.ReactNode;
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
    const worksheetProtectionRuleModel = useDependency(WorksheetProtectionRuleModel);
    const workbook = useObservable(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), null, false, []);

    const handleClick = (item: ISheetBarMenuItem) => {
        const { sheetId } = item;
        if (!sheetId || !workbook) return;

        if (item.hidden) {
            commandService.executeCommand(SetWorksheetShowCommand.id, {
                unitId: workbook.getUnitId(),
                subUnitId: sheetId,
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

    const statusInit = useCallback(() => {
        if (!workbook) return;

        const sheets = workbook.getSheets();
        const activeSheet = workbook.getActiveSheet();
        const worksheetMenuItems = sheets.map((sheet, index) => {
            return {
                label: sheet.getName(),
                index: `${index}`,
                sheetId: sheet.getSheetId(),
                hidden: sheet.isSheetHidden() === BooleanNumber.TRUE,
                selected: activeSheet === sheet,
            };
        });

        setMenu(worksheetMenuItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workbook, worksheetProtectionRuleModel]);

    const setupStatusUpdate = useCallback(() =>
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
        }), [commandService, statusInit]);

    function handleSheetBarMenu() {
        setVisible(true);
    }

    const onVisibleChange = (visible: boolean) => {
        setVisible(visible);
    };

    useEffect(() => {
        statusInit();

        const disposables = new DisposableCollection();
        disposables.add(setupStatusUpdate());
        disposables.add(sheetBarService.registerSheetBarMenuHandler({ handleSheetBarMenu }));

        return () => disposables.dispose();
    }, [setupStatusUpdate, sheetBarService, statusInit, workbook]);

    return (
        <DropdownLegacy
            placement="topLeft"
            trigger={['click']}
            overlay={(
                <ul className={styles.sheetBarMenu} style={{ ...style }}>
                    {menu.map((item) => (
                        <li
                            key={item.index}
                            onClick={() => handleClick(item)}
                            className={item.selected
                                ? `
                                  ${styles.sheetBarMenuItem}
                                  ${styles.sheetBarMenuItemSelect}
                                `
                                : item.hidden
                                    ? `
                                      ${styles.sheetBarMenuItem}
                                      ${styles.sheetBarMenuItemHide}
                                    `
                                    : styles.sheetBarMenuItem}
                        >
                            <span className={styles.sheetBarMenuItemIcon}>
                                {item.selected
                                    ? <CheckMarkSingle />
                                    : item.hidden
                                        ? <EyelashSingle />
                                        : <CheckMarkSingle />}
                            </span>
                            <div className={styles.sheetBarMenuItemLabel}>{item.label}</div>
                        </li>
                    ))}
                </ul>
            )}
            visible={visible}
            onVisibleChange={onVisibleChange}
        >
            <div>
                <SheetBarButton>
                    <ConvertSingle />
                </SheetBarButton>
            </div>
        </DropdownLegacy>
    );
}
