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

import type { Workbook } from '@univerjs/core';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { useDependency, useObservable } from '@univerjs/ui';
import { useMemo } from 'react';

export const SwitchUnits = () => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const activeSheet = useObservable(useMemo(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), [univerInstanceService]));
    if (!activeSheet) {
        return null;
    }

    const switchSheet = (sheet: Workbook) => {
        univerInstanceService.focusUnit(sheet.getUnitId());
    };

    const allSheets = univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const activeSheetId = activeSheet?.getUnitId();

    return (
        <div className="univer-w-full univer-border-b univer-border-gray-200 univer-bg-white univer-shadow-sm">
            <div className="univer-px-4 univer-py-2">
                <div
                    className={`
                      univer-scrollbar-hide univer-flex univer-items-center univer-gap-1 univer-overflow-x-auto
                      univer-overflow-y-hidden
                    `}
                >
                    <span
                        className={`
                          univer-mr-3 univer-whitespace-nowrap univer-text-sm univer-font-medium univer-text-gray-600
                        `}
                    >
                        工作表:
                    </span>
                    {allSheets.map((sheet) => {
                        const isActive = sheet.getUnitId() === activeSheetId;
                        return (
                            <div
                                key={sheet.getUnitId()}
                                onClick={() => switchSheet(sheet)}
                                className={clsx(`
                                  univer-relative univer-min-w-0 univer-flex-shrink-0 univer-transform
                                  univer-cursor-pointer univer-whitespace-nowrap univer-rounded-lg univer-px-4
                                  univer-py-2 univer-text-sm univer-font-medium univer-transition-all
                                  univer-duration-200
                                  focus:univer-outline-none focus:univer-ring-2 focus:univer-ring-blue-500
                                  focus:univer-ring-offset-2
                                  active:univer-scale-95
                                `, {
                                    [`
                                      univer-border-2 univer-border-blue-300 univer-bg-blue-100 univer-text-blue-700
                                      univer-shadow-sm
                                    `]: isActive,
                                    [`
                                      univer-border-2 univer-border-transparent univer-bg-gray-50 univer-text-gray-700
                                      hover:univer-border-gray-300 hover:univer-bg-gray-100 hover:univer-text-gray-900
                                    `]: !isActive,
                                })}
                                title={sheet.getUnitId()}
                            >
                                <span className="univer-max-w-32 univer-truncate">
                                    {sheet.getUnitId()}
                                </span>
                                {isActive && (
                                    <div
                                        className={`
                                          univer-absolute -univer-bottom-1 univer-left-1/2 univer-h-1 univer-w-1
                                          -univer-translate-x-1/2 univer-transform univer-rounded-full
                                          univer-bg-blue-500
                                        `}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
