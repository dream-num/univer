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
import type { ISetWorksheetActiveOperationParams } from '@univerjs/sheets';
import type { IBaseSheetBarProps } from '../../sheet-bar/sheet-bar-tabs/SheetBarItem';
import { ICommandService } from '@univerjs/core';
import { borderRightClassName, clsx } from '@univerjs/design';
import {
    InsertSheetMutation,
    RemoveSheetMutation,
    SetWorksheetActiveOperation,
    SetWorksheetHideMutation,
    SetWorksheetNameMutation,
    SetWorksheetOrderMutation,
} from '@univerjs/sheets';
import { useDependency } from '@univerjs/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useActiveWorkbook } from '../../../components/hook';

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
    const tabMapRef = useRef<Map<string, HTMLElement | null>>(new Map());

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
        <div
            className={`
              univer-h-8 univer-w-full univer-overflow-x-scroll univer-bg-gray-100
              dark:univer-bg-gray-900
            `}
        >
            <div className="univer-flex univer-h-8 univer-flex-nowrap univer-items-center">
                {sheetList.map((sheet) => (
                    <div
                        ref={(element) => {
                            tabMapRef.current.set(sheet.sheetId!, element);
                        }}
                        className={clsx(
                            `
                              univer-box-border univer-h-full univer-min-w-12 univer-max-w-[120px] univer-shrink-0
                              univer-flex-nowrap univer-items-center univer-overflow-hidden univer-truncate
                              univer-whitespace-nowrap univer-px-1 univer-py-0.5 univer-text-center univer-text-xs
                              univer-leading-7
                            `,
                            borderRightClassName,
                            {
                                'univer-bg-white univer-text-primary-600 dark:univer-bg-slate-600': sheet.sheetId === activeKey,
                            }
                        )}
                        key={sheet.sheetId}
                        onClick={() => onTabClick(sheet.sheetId!)}
                    >
                        {sheet.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
