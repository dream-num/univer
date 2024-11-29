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
import type { IBaseSheetBarProps } from '@univerjs/sheets-ui';
import { ICommandService, useDependency } from '@univerjs/core';
import { Tooltip } from '@univerjs/design';
import { IncreaseSingle } from '@univerjs/icons';
import { InsertSheetCommand, InsertSheetMutation, RemoveSheetMutation, SetTabColorMutation, SetWorksheetActiveOperation, SetWorksheetHideMutation, SetWorksheetNameMutation, SetWorksheetOrderMutation } from '@univerjs/sheets';
import { useActiveWorkbook } from '@univerjs/sheets-ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.module.less';

export function UniSheetBar() {
    const [sheetList, setSheetList] = useState<IBaseSheetBarProps[]>([]);
    const [activeKey, setActiveKey] = useState('');
    const [barHeight, setBarHeight] = useState(0);
    const workbook = useActiveWorkbook()!;
    const commandService = useDependency(ICommandService);
    const sheetBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sheetBar = sheetBarRef.current;
        if (sheetBar) {
            setBarHeight(sheetBar.clientHeight - 38);
        }
    }, []);

    const updateSheetItems = useCallback(() => {
        const currentSubUnitId = workbook.getActiveSheet()?.getSheetId() || '';
        setActiveKey(currentSubUnitId);

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
    }, [workbook]);

    useEffect(() => {
        updateSheetItems();
        const disposable = setupStatusUpdate();

        return () => {
            disposable.dispose();
        };
    }, [workbook]);

    const handleSheetActiveChange = (subUnitId: string | undefined) => {
        if (!subUnitId) return;

        commandService.executeCommand(SetWorksheetActiveOperation.id, {
            subUnitId,
            unitId: workbook.getUnitId(),
        });
    };

    const handleSheetAdd = () => {
        commandService.executeCommand(InsertSheetCommand.id);
    };

    const setupStatusUpdate = () =>
        commandService.onCommandExecuted((commandInfo: ICommandInfo) => {
            switch (commandInfo.id) {
                case SetTabColorMutation.id:
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

    return (
        <div className={styles.uniSheetBar} ref={sheetBarRef}>
            <div className={styles.sheetTab} style={{ height: `${barHeight}px` }}>
                <div className={styles.sheetItems}>
                    {sheetList.map((item, index) => (
                        <div
                            key={index}
                            className={`
                              ${styles.sheetItem}
                              ${activeKey === item.sheetId ? styles.active : ''}
                            `}
                            onClick={() => handleSheetActiveChange(item.sheetId)}
                        >
                            <Tooltip showIfEllipsis title={item.label} placement="right">
                                <span>
                                    {' '}
                                    {item.label}
                                    {' '}
                                </span>
                            </Tooltip>
                        </div>
                    ))}
                </div>
            </div>

            <button className={styles.newSheetButton} onClick={handleSheetAdd}>
                <IncreaseSingle className={styles.newSheetButtonIcon} />
                <span>New sheet</span>
            </button>
        </div>
    );
}
