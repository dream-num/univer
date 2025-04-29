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

import type { ICommandInfo } from '@univerjs/core';
import type { IBaseSheetBarProps } from '@univerjs/sheets-ui';
import { ICommandService } from '@univerjs/core';
import { clsx, scrollbarClassName, Tooltip } from '@univerjs/design';
import { IncreaseSingle } from '@univerjs/icons';
import { InsertSheetCommand, InsertSheetMutation, RemoveSheetMutation, SetTabColorMutation, SetWorksheetActiveOperation, SetWorksheetHideMutation, SetWorksheetNameMutation, SetWorksheetOrderMutation } from '@univerjs/sheets';
import { useActiveWorkbook } from '@univerjs/sheets-ui';
import { useDependency } from '@univerjs/ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export function UniSheetBar() {
    const [sheetList, setSheetList] = useState<IBaseSheetBarProps[]>([]);
    const [activeKey, setActiveKey] = useState('');
    const workbook = useActiveWorkbook()!;
    const commandService = useDependency(ICommandService);
    const sheetBarRef = useRef<HTMLDivElement>(null);

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
        <div className="univer-flex univer-h-full univer-select-none univer-flex-col univer-justify-between" ref={sheetBarRef}>
            <div className={clsx('univer-overflow-y-auto', scrollbarClassName)}>
                <div className="univer-flex univer-flex-col univer-gap-1 univer-text-sm univer-font-medium">
                    {sheetList.map((item, index) => (
                        <div
                            key={index}
                            className={clsx(`
                              univer-flex univer-h-8 univer-cursor-pointer univer-items-center univer-rounded-lg
                              univer-px-1 univer-py-0
                              hover:univer-bg-gray-100
                            `, activeKey === item.sheetId ? 'univer-text-primary-500' : '')}
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

            <button
                type="button"
                className={`
                  univer-relative univer-mt-4 univer-flex univer-h-8 univer-items-center univer-justify-center
                  univer-rounded-lg univer-border-0 univer-bg-transparent univer-text-primary-600
                  before:absolute before:left-0 before:top-0 before:h-full before:w-full before:bg-gray-100
                  before:content-['']
                  hover:univer-cursor-pointer hover:univer-bg-gray-100
                `}

                onClick={handleSheetAdd}
            >
                <IncreaseSingle className="univer-mr-1 univer-size-4" />
                <span>New sheet</span>
            </button>
        </div>
    );
}
