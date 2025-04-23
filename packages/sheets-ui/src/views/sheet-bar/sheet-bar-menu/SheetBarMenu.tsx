/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
import type { IDropdownMenuProps } from '@univerjs/design';
import { BooleanNumber, DisposableCollection, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { clsx, DropdownMenu } from '@univerjs/design';
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
import { useDependency, useObservable } from '@univerjs/ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ISheetBarService } from '../../../services/sheet-bar/sheet-bar.service';
import { SheetBarButton } from '../sheet-bar-button/SheetBarButton';

export interface ISheetBarMenuItem {
    label?: React.ReactNode;
    hidden?: boolean;
    selected?: boolean;
    index?: string;
    sheetId?: string;
}

export function SheetBarMenu() {
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

    const items: IDropdownMenuProps['items'] = useMemo(() => menu.map((item) => ({
        type: 'item',
        children: (
            <div className="univer-relative univer-box-border univer-pl-6">
                {(item.selected || item.hidden) && (
                    <span className="univer-absolute univer-left-1 univer-top-0.5">
                        {item.selected && <CheckMarkSingle className="univer-size-4 univer-text-primary-600" />}
                        {item.hidden && <EyelashSingle className="univer-size-4 univer-text-gray-400" />}
                    </span>
                )}

                <span
                    className={clsx({
                        'univer-text-primary-600': item.selected,
                    })}
                >
                    {item.label}
                </span>
            </div>
        ),
        onSelect: () => {
            handleClick(item);
        },
    })), [menu]);

    return (
        <DropdownMenu
            align="start"
            items={items}
            open={visible}
            onOpenChange={onVisibleChange}
        >
            <div>
                <SheetBarButton>
                    <ConvertSingle />
                </SheetBarButton>
            </div>
        </DropdownMenu>
    );
}
