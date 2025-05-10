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

import type { IDefinedNamesServiceParam } from '@univerjs/engine-formula';
import { ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { borderBottomClassName, clsx, scrollbarClassName } from '@univerjs/design';
import { IDefinedNamesService } from '@univerjs/engine-formula';
import { SetWorksheetShowCommand } from '@univerjs/sheets';
import { ISidebarService, useDependency } from '@univerjs/ui';
import React, { useEffect, useState } from 'react';
import { SidebarDefinedNameOperation } from '../../commands/operations/sidebar-defined-name.operation';
import { DEFINED_NAME_CONTAINER } from './component-name';

export function DefinedNameOverlay() {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const definedNamesService = useDependency(IDefinedNamesService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const sidebarService = useDependency(ISidebarService);

    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const unitId = workbook.getUnitId();

    const getDefinedNameMap = () => {
        const definedNameMap = definedNamesService.getDefinedNameMap(unitId);
        if (definedNameMap) {
            return Array.from(Object.values(definedNameMap));
        }
        return [];
    };

    const [definedNames, setDefinedNames] = useState<IDefinedNamesServiceParam[]>(getDefinedNameMap());

    useEffect(() => {
        const definedNamesSubscription = definedNamesService.update$.subscribe(() => {
            setDefinedNames(getDefinedNameMap());
        });

        return () => {
            definedNamesSubscription.unsubscribe();
        };
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    // When closing the panel, clear the react cache
    useEffect(() => {
        const d = sidebarService.sidebarOptions$.subscribe((info) => {
            if (info.id === DEFINED_NAME_CONTAINER) {
                if (!info.visible) {
                    setTimeout(() => {
                        sidebarService.sidebarOptions$.next({ visible: false });
                    });
                }
            }
        });
        return () => {
            d.unsubscribe();
        };
    }, []);

    const openSlider = () => {
        commandService.executeCommand(SidebarDefinedNameOperation.id, { value: 'open' });
    };

    const focusDefinedName = async (definedName: IDefinedNamesServiceParam) => {
        // The worksheet may be hidden, so we need to show it first
        const { formulaOrRefString, id } = definedName;
        const worksheet = definedNamesService.getWorksheetByRef(unitId, formulaOrRefString);
        if (!worksheet) {
            return;
        }

        const isHidden = worksheet.isSheetHidden();
        if (isHidden) {
            await commandService.executeCommand(SetWorksheetShowCommand.id, { unitId, subUnitId: worksheet.getSheetId() });
        }

        definedNamesService.focusRange(unitId, id);
    };

    return (
        <div className="univer-w-[300px]">
            <ul
                className={clsx('univer-m-0 univer-max-h-[360px] univer-list-none univer-overflow-y-auto univer-p-0', scrollbarClassName)}
            >
                {definedNames.map((definedName, index) => {
                    return (
                        <li
                            key={index}
                            className={`
                              univer-cursor-pointer univer-px-2 univer-transition-colors univer-duration-200
                              dark:hover:univer-bg-gray-600
                              hover:univer-bg-gray-100
                            `}
                            onClick={() => { focusDefinedName(definedName); }}
                        >
                            <div
                                className={clsx(`
                                  univer-flex univer-items-center univer-justify-between univer-gap-2 univer-py-1
                                `, borderBottomClassName)}
                            >
                                <div
                                    className={`
                                      univer-w-[50%] univer-flex-shrink-0 univer-overflow-hidden univer-text-ellipsis
                                      univer-whitespace-nowrap univer-text-sm univer-text-gray-600
                                      dark:univer-text-gray-200
                                    `}
                                    title={definedName.name}
                                >
                                    {definedName.name}
                                </div>
                                <div
                                    className={`
                                      univer-w-[50%] univer-flex-shrink-0 univer-overflow-hidden univer-text-ellipsis
                                      univer-whitespace-nowrap univer-text-xs univer-text-gray-400
                                    `}
                                    title={definedName.formulaOrRefString}
                                >
                                    {definedName.formulaOrRefString}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <div
                className={`
                  univer-cursor-pointer univer-p-2 univer-transition-colors univer-duration-200
                  dark:hover:univer-bg-gray-600
                  hover:univer-bg-gray-100
                `}
                onClick={openSlider}
            >
                <div
                    className={`
                      univer-mb-2 univer-text-sm univer-font-semibold univer-text-gray-600
                      dark:univer-text-gray-200
                    `}
                >
                    {localeService.t('definedName.managerTitle')}
                </div>
                <div className="univer-text-xs univer-text-gray-400">
                    {localeService.t('definedName.managerDescription')}
                </div>
            </div>
        </div>
    );
}
