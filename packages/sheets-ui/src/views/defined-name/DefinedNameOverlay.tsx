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
import type { LocaleKey } from '../../locale/types';
import { ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { borderBottomClassName, clsx, scrollbarClassName } from '@univerjs/design';
import { IDefinedNamesService } from '@univerjs/engine-formula';
import { SetWorksheetShowCommand } from '@univerjs/sheets';
import { ISidebarService, useDependency, useVirtualList } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SidebarDefinedNameOperation } from '../../commands/operations/sidebar-defined-name.operation';
import { DEFINED_NAME_CONTAINER } from './component-name';

export function DefinedNameOverlay({ search, isInputEvent }: { search: string; isInputEvent: boolean }) {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const definedNamesService = useDependency(IDefinedNamesService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const sidebarService = useDependency(ISidebarService);
    const direction = localeService.getDirection();

    const workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const unitId = workbook.getUnitId();

    const getDefinedNameMap = () => {
        const definedNameMap = definedNamesService.getDefinedNameMap(unitId);
        if (definedNameMap) {
            return Object.values(definedNameMap);
        }
        return [];
    };

    const [definedNames, setDefinedNames] = useState<IDefinedNamesServiceParam[]>(() => getDefinedNameMap());

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
        let timer: ReturnType<typeof setTimeout> | undefined;
        const d = sidebarService.sidebarOptions$.subscribe((info) => {
            if (info.id === DEFINED_NAME_CONTAINER) {
                if (!info.visible) {
                    if (timer !== undefined) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(() => {
                        sidebarService.sidebarOptions$.next({ visible: false });
                    });
                }
            }
        });
        return () => {
            d.unsubscribe();
            if (timer !== undefined) {
                clearTimeout(timer);
            }
        };
    }, []);

    const filteredDefinedNames = useMemo(() => {
        return search && isInputEvent
            ? definedNames.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
            : definedNames;
    }, [search, isInputEvent, definedNames]);

    const listContainerRef = useRef<HTMLDivElement>(undefined!);
    const [virtualDefinedNames, virtualActions] = useVirtualList(filteredDefinedNames, {
        containerTarget: listContainerRef,
        itemHeight: 30,
        overscan: 6,
    });

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
        <div
            data-u-comp="defined-name-overlay"
            dir={direction}
            className="
              univer-w-[300px]
              rtl:univer-text-right
            "
        >
            <div
                ref={listContainerRef}
                className={clsx('univer-max-h-[360px] univer-min-h-0 univer-overflow-y-auto', scrollbarClassName, {
                    'univer-min-h-[30px]': filteredDefinedNames.length > 0,
                })}
                {...virtualActions.containerProps}
            >
                <div style={virtualActions.wrapperStyle}>
                    {virtualDefinedNames.map(({ data: definedName, index }) => {
                        return (
                            <li
                                key={index}
                                className={`
                                  univer-cursor-pointer univer-px-2 univer-transition-colors univer-duration-200
                                  hover:univer-bg-gray-100
                                  dark:hover:!univer-bg-gray-600
                                `}
                                onClick={() => { focusDefinedName(definedName); }}
                            >
                                <div
                                    data-u-comp="defined-name-overlay-row"
                                    className={clsx(`
                                      univer-flex univer-items-center univer-gap-2 univer-py-1
                                      rtl:univer-flex-row-reverse
                                    `, borderBottomClassName)}
                                >
                                    <div
                                        data-u-comp="defined-name-overlay-name"
                                        className={`
                                          univer-min-w-0 univer-flex-1 univer-basis-0 univer-truncate univer-text-sm
                                          univer-text-gray-600
                                          rtl:univer-text-right
                                          dark:!univer-text-gray-200
                                        `}
                                        title={definedName.name}
                                    >
                                        {definedName.name}
                                    </div>
                                    <div
                                        data-u-comp="defined-name-overlay-reference"
                                        className={`
                                          univer-min-w-0 univer-flex-1 univer-basis-0 univer-truncate univer-text-xs
                                          univer-text-gray-400
                                          rtl:univer-text-right
                                        `}
                                        title={definedName.formulaOrRefString}
                                    >
                                        {definedName.formulaOrRefString}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </div>
            </div>
            <div
                data-u-comp="defined-name-overlay-footer"
                className={`
                  univer-cursor-pointer univer-p-2 univer-transition-colors univer-duration-200
                  hover:univer-bg-gray-100
                  rtl:univer-text-right
                  dark:hover:!univer-bg-gray-600
                `}
                onClick={openSlider}
            >
                <div
                    className={`
                      univer-mb-2 univer-text-sm univer-font-semibold univer-text-gray-600
                      dark:!univer-text-gray-200
                    `}
                >
                    {localeService.t<LocaleKey>('sheets-ui.definedName.managerTitle')}
                </div>
                <div className="univer-text-xs univer-text-gray-400">
                    {localeService.t<LocaleKey>('sheets-ui.definedName.managerDescription')}
                </div>
            </div>
        </div>
    );
}
