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
import { borderRightClassName, clsx, scrollbarClassName } from '@univerjs/design';
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
    const containerRef = useRef<HTMLDivElement>(null);

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
            if (element && containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                const elementWidth = element.clientWidth;
                const elementLeft = element.offsetLeft;
                const scrollLeft = elementLeft - (containerWidth - elementWidth) / 2;
                containerRef.current.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
            }
        }

        tabMapRef.current.clear();
    }, [workbook]);

    useEffect(() => updateSheetItems(), [updateSheetItems]);

    const handleClick = useCallback((sheetId: string) => {
        commandService.executeCommand(SetWorksheetActiveOperation.id, {
            unitId: workbook.getUnitId(),
            subUnitId: sheetId,
        } as ISetWorksheetActiveOperationParams);
    }, [workbook]);

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
    }, [updateSheetItems]);

    return (
        <div
            ref={containerRef}
            aria-label="Sheet tabs"
            className={clsx(
                `
                  univer-h-10 univer-w-full univer-overflow-x-auto univer-overflow-y-hidden univer-border-b
                  univer-border-gray-200 univer-bg-gradient-to-b univer-from-gray-50 univer-to-gray-100
                  dark:!univer-border-gray-700 dark:!univer-from-gray-800 dark:!univer-to-gray-900
                `,
                scrollbarClassName
            )}
            role="tablist"
        >
            <div className="univer-flex univer-h-full univer-flex-nowrap univer-items-center">
                {sheetList.map((sheet) => (
                    <div
                        key={sheet.sheetId}
                        ref={(element) => {
                            tabMapRef.current.set(sheet.sheetId!, element);
                        }}
                        aria-controls={`sheet-${sheet.sheetId}`}
                        aria-selected={sheet.sheetId === activeKey}
                        className={clsx(`
                          univer-relative univer-box-border univer-flex univer-h-full univer-max-w-36 univer-shrink-0
                          univer-cursor-pointer univer-select-none univer-items-center univer-justify-center
                          univer-truncate univer-px-1 univer-py-0.5 univer-text-sm univer-font-medium univer-leading-6
                          univer-transition-all
                        `, borderRightClassName, {
                            'univer-bg-white univer-text-blue-600 dark:!univer-bg-gray-700 dark:!univer-text-blue-400': sheet.sheetId === activeKey,
                            'univer-text-gray-600 hover:univer-bg-gray-50 active:univer-bg-gray-100 dark:!univer-text-gray-300 dark:hover:!univer-bg-gray-700': sheet.sheetId !== activeKey,
                        })}
                        role="tab"
                        tabIndex={sheet.sheetId === activeKey ? 0 : -1}
                        onClick={() => handleClick(sheet.sheetId!)}
                    >
                        {/* Sheet Label */}
                        <span className="univer-truncate">{sheet.label}</span>

                        {/* Active Indicator */}
                        {sheet.sheetId === activeKey && (
                            <div
                                aria-hidden="true"
                                className={clsx(`
                                  univer-absolute univer-left-0 univer-right-0 univer-top-0 univer-h-1
                                  univer-bg-blue-600 univer-transition-all
                                  dark:!univer-bg-blue-400
                                `
                                )}
                                style={sheet.color
                                    ? { backgroundColor: sheet.color }
                                    : undefined}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
