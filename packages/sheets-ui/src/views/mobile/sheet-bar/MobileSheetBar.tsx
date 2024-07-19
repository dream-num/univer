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

import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { ICommandService, useDependency } from '@univerjs/core';
import type { ICommandInfo, Workbook } from '@univerjs/core';
import type { ISetWorksheetActiveOperationParams } from '@univerjs/sheets';
import {
    InsertSheetMutation,
    RemoveSheetMutation,
    SetWorksheetActiveOperation,
    SetWorksheetHideMutation,
    SetWorksheetNameMutation,
    SetWorksheetOrderMutation,
} from '@univerjs/sheets';
import type { IBaseSheetBarProps } from '../../sheet-bar/sheet-bar-tabs/SheetBarItem';
import { useActiveWorkbook } from '../../../components/hook';

import styles from './index.module.less';

export function MobileSheetBar() {
    const workbook = useActiveWorkbook();
    if (!workbook) {
        return null;
    }

    return <MobileSheetBarImpl workbook={workbook} />;
}

function MobileSheetBarImpl(props: { workbook: Workbook }) {
    const { workbook } = props;
    const [sheetList, setSheetList] = useState<IBaseSheetBarProps[]>([]);
    const [activeKey, setActiveKey] = useState('');
    const tabMapRef = React.useRef<Map<string, HTMLElement | null>>(new Map());

    const commandService = useDependency(ICommandService);

    const updateSheetItems = useCallback(() => {
        const currentSubUnitId = workbook.getActiveSheet()!.getSheetId();
        const sheets = workbook.getSheets();
        const activeSheet = workbook.getActiveSheet();
        const sheetListItems = sheets
            .filter((sheet) => !sheet.isSheetHidden())
            .map((sheet, index) => {
                return {
                    sheetId: sheet.getSheetId(),
                    label: sheet.getName(),
                    index,
                    selected: activeSheet === sheet,
                    color: sheet.getTabColor() ?? undefined,
                };
            });

        setSheetList(sheetListItems);
        setActiveKey(currentSubUnitId);

        if (tabMapRef.current.has(currentSubUnitId)) {
            const element = tabMapRef.current.get(currentSubUnitId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        tabMapRef.current.clear();
    }, [workbook]);

    useEffect(() => updateSheetItems(), [updateSheetItems]);

    const onTabClick = useCallback((sheetId: string) => {
        commandService.executeCommand(SetWorksheetActiveOperation.id, {
            unitId: workbook.getUnitId(),
            subUnitId: sheetId,
        } as ISetWorksheetActiveOperationParams);
    }, [commandService, workbook]);

    useEffect(() => {
        const disposable = commandService.onCommandExecuted((commandInfo: ICommandInfo) => {
            switch (commandInfo.id) {
                case SetWorksheetHideMutation.id:
                case RemoveSheetMutation.id:
                case SetWorksheetNameMutation.id:
                case InsertSheetMutation.id:
                case SetWorksheetOrderMutation.id:
                case SetWorksheetActiveOperation.id:
                    updateSheetItems();
                    break;
                default:
                    break;
            }
        });

        return () => disposable.dispose();
    }, [commandService, updateSheetItems]);

    return (
        <div className={styles.mobileSheetBarContainer}>
            <div className={styles.mobileSheetBarSlider}>
                {sheetList.map((sheet) => (
                    <div
                        className={clsx(
                            styles.mobileSheetBarItem,
                            {
                                [styles.mobileSheetBarItemActivated]: sheet.sheetId === activeKey,
                            }
                        )}
                        key={sheet.sheetId}
                        onClick={() => onTabClick(sheet.sheetId!)}
                        ref={(element) => tabMapRef.current.set(sheet.sheetId!, element)}
                    >
                        {sheet.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
