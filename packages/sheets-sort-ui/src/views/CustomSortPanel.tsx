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

import type { IRange, Nullable } from '@univerjs/core';
import type { IOrderRule } from '@univerjs/sheets-sort';
import type { ICustomSortState } from '../services/sheets-sort-ui.service';
import { LocaleService, LocaleType, throttle } from '@univerjs/core';
import { Button, Checkbox, DraggableList, Dropdown, Radio, RadioGroup } from '@univerjs/design';
import { CheckMarkSingle, DeleteEmptySingle, IncreaseSingle, MoreDownSingle, SequenceSingle } from '@univerjs/icons';
import { SheetsSortService, SortType } from '@univerjs/sheets-sort';
import { useDependency, useObservable } from '@univerjs/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SheetsSortUIService } from '../services/sheets-sort-ui.service';

export interface ICustomSortPanelProps {
    range: IRange;
    onListChange: (value: IOrderRule[]) => void;
}

export function CustomSortPanel() {
    const sheetsSortUIService = useDependency(SheetsSortUIService);
    const state = useObservable(sheetsSortUIService.customSortState$);

    if (!state || !state.location) {
        return null;
    }

    return <CustomSortPanelImpl state={state} />;
}

function CustomSortPanelImpl({ state }: { state: ICustomSortState }) {
    const sheetsSortService = useDependency(SheetsSortService);
    const localeService = useDependency(LocaleService);
    const sheetsSortUIService = useDependency(SheetsSortUIService);

    const [hasTitle, setHasTitle] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const listEndRef = useRef<HTMLDivElement>(null);

    const { range, unitId, subUnitId } = state.location!;

    const titles = sheetsSortUIService.getTitles(hasTitle);

    const [list, setList] = useState<IOrderRule[]>([
        { type: SortType.ASC, colIndex: range.startColumn },
    ]);

    const onItemChange = useCallback((index: number, value: Nullable<IOrderRule>) => {
        const newList = [...list];
        if (value === null) {
            newList.splice(index, 1);
        } else {
            newList[index] = value as IOrderRule;
        }

        setList(newList as IOrderRule[]);
    }, [list]);

    const newItem = useCallback(
        throttle(() => {
            const newList = [...list];
            const nextColIndex = findNextColIndex(range, list);
            if (nextColIndex !== null) {
                newList.push({ type: SortType.ASC, colIndex: nextColIndex });
                setList(newList);
            }
        }, 200),
        [list, range]
    );

    const apply = useCallback((orderRules: IOrderRule[], hasTitle: boolean) => {
        sheetsSortService.applySort({ range, orderRules, hasTitle });
        sheetsSortUIService.closeCustomSortPanel();
    }, [sheetsSortService, sheetsSortUIService, range]);

    const cancel = useCallback(() => {
        sheetsSortUIService.closeCustomSortPanel();
    }, [sheetsSortUIService]);

    const setTitle = useCallback((value: boolean) => {
        setHasTitle(value);
        if (value) {
            sheetsSortUIService.setSelection(unitId, subUnitId, { ...range, startRow: range.startRow + 1 });
        } else {
            sheetsSortUIService.setSelection(unitId, subUnitId, range);
        }
    }, [sheetsSortUIService, range, subUnitId, unitId]);

    useEffect(() => {
        if (listEndRef.current && list.length > 5) {
            listEndRef.current.scrollTop = listEndRef.current.scrollHeight;
        }
    }, [list]);

    const canNew = list.length < titles.length;

    const dragList = list.map((item) => ({ ...item, id: `${item.colIndex}` }));

    return (
        <div>
            <div onMouseDown={(e) => { e.stopPropagation(); }}>
                <div className="univer-flex univer-items-center univer-justify-between">
                    <Checkbox checked={hasTitle} onChange={(value) => setTitle(!!value)}>
                        {localeService.t('sheets-sort.dialog.first-row-check')}
                    </Checkbox>
                    {canNew
                        ? (
                            <div
                                className={`
                                  univer-flex univer-cursor-pointer univer-select-none univer-items-center
                                  univer-text-base
                                `}
                                onClick={newItem}
                            >
                                <IncreaseSingle />
                                <span className="univer-ml-1.5">{localeService.t('sheets-sort.dialog.add-condition')}</span>
                            </div>
                        )
                        : (
                            <div
                                className={`
                                  univer-flex univer-cursor-pointer univer-select-none univer-items-center
                                  univer-text-base univer-text-primary-500
                                  disabled:univer-cursor-not-allowed disabled:univer-divide-opacity-30
                                  disabled:univer-text-gray-800
                                `}
                            >
                                <IncreaseSingle />
                                <span className="univer-ml-1.5 univer-text-xs">{localeService.t('sheets-sort.dialog.add-condition')}</span>
                            </div>
                        )}

                </div>
                <div
                    className="univer-max-h-[310px] univer-overflow-y-auto univer-overflow-x-hidden"
                    onScroll={(e) => {
                        const position = e.currentTarget.scrollTop;
                        setScrollPosition(position);
                    }}
                    ref={listEndRef}
                >
                    <DraggableList
                        list={dragList}
                        onListChange={setList}
                        idKey="id"
                        draggableHandle="[data-u-comp=sort-panel-item-handler]"
                        itemRender={(item) => (
                            <SortOptionItem
                                titles={titles}
                                list={dragList}
                                item={item}
                                onChange={(value, index) => onItemChange(index, value)}
                                scrollPosition={scrollPosition}
                            />
                        )}
                        rowHeight={32}
                        margin={[0, 12]}
                    />
                </div>
            </div>
            <div className="univer-mt-5 univer-flex univer-justify-end">
                <Button
                    className="univer-ml-3"
                    onClick={() => cancel()}
                >
                    {localeService.t('sheets-sort.dialog.cancel')}
                </Button>
                <Button
                    className="univer-ml-3"
                    variant="primary"
                    onClick={() => apply(list, hasTitle)}
                >
                    {localeService.t('sheets-sort.dialog.confirm')}
                </Button>
            </div>
        </div>
    );
}

interface ISortOptionItemProps {
    titles: { index: number; label: string }[];
    list: IOrderRule[];
    item: IOrderRule;
    scrollPosition: number;
    onChange: (value: Nullable<IOrderRule>, index: number) => void;
}

export function SortOptionItem(props: ISortOptionItemProps) {
    const { list, item, titles, onChange, scrollPosition } = props;
    const localeService = useDependency(LocaleService);

    const availableMenu = titles.filter((title) => (!list.some((item) => item.colIndex === title.index)) || title.index === item.colIndex);
    const currentIndex = list.findIndex((listItem) => listItem.colIndex === item.colIndex);

    const handleChangeColIndex = useCallback((menuItem: { index: number; label: string }) => {
        onChange({ ...item, colIndex: menuItem.index }, currentIndex);
        setVisible(false);
    }, [currentIndex, item, onChange]);

    const [visible, setVisible] = useState(false);

    const onVisibleChange = (visible: boolean) => {
        setVisible(visible);
    };

    useEffect(() => {
        setVisible(false);
    }, [scrollPosition]);

    const showDelete = list.length > 1;
    const itemLabel = titles.find((title) => title.index === item.colIndex)?.label;

    const radioClass = localeService.getCurrentLocale() === LocaleType.ZH_CN ? 'univer-flex univer-px-5' : 'univer-flex univer-px-2.5';
    return (
        <div className="univer-flex univer-items-center">
            <div className="univer-flex univer-items-center">
                <div
                    data-u-comp="sort-panel-item-handler"
                    className={`
                      univer-flex univer-cursor-pointer univer-items-center univer-justify-center univer-text-base
                      univer-text-gray-700
                    `}
                >
                    <SequenceSingle />
                </div>
                <div>
                    {/* TODO@wzhudev: change it to the Select component later. */}
                    <Dropdown
                        align="start"
                        overlay={(
                            <ul
                                className={`
                                  univer-my-0 univer-box-border univer-grid univer-max-h-[310px] univer-items-center
                                  univer-gap-1 univer-overflow-y-auto univer-overflow-x-hidden univer-rounded-lg
                                  univer-border univer-bg-white univer-p-1 univer-text-base univer-shadow-lg
                                `}
                            >
                                {availableMenu.map((menuItem) => (
                                    <li
                                        key={menuItem.index}
                                        onClick={() => handleChangeColIndex(menuItem)}
                                        className={`
                                          univer-relative univer-box-border univer-flex univer-h-7 univer-cursor-pointer
                                          univer-list-none univer-items-center univer-justify-between univer-rounded
                                          univer-px-2 univer-text-sm univer-transition-all
                                          hover:univer-bg-gray-100
                                        `}
                                    >
                                        <span
                                            className="univer-max-w-[220px] univer-truncate"
                                        >
                                            {menuItem.label}
                                        </span>
                                        <span>
                                            {menuItem.index === item.colIndex && (
                                                <CheckMarkSingle />
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        open={visible}
                        onOpenChange={onVisibleChange}
                    >
                        <div
                            className={`
                              univer-ml-2 univer-flex univer-w-[236px] univer-items-center univer-justify-between
                              univer-overflow-hidden univer-rounded-md univer-border univer-border-gray-200
                              univer-px-2.5 univer-py-1.5 univer-text-sm univer-text-gray-900
                              dark:univer-text-white
                            `}
                        >
                            <span
                                className="univer-max-w-[220px] univer-truncate"
                            >
                                {itemLabel}
                            </span>
                            <MoreDownSingle />
                        </div>
                    </Dropdown>
                </div>
            </div>
            <div>
                <RadioGroup
                    className={radioClass}
                    value={item.type}
                    onChange={(value) => {
                        onChange({ ...item, type: value as SortType }, currentIndex);
                    }}
                >
                    <Radio value={SortType.ASC}>{localeService.t('sheets-sort.general.sort-asc')}</Radio>
                    <Radio value={SortType.DESC}>{localeService.t('sheets-sort.general.sort-desc')}</Radio>
                </RadioGroup>
            </div>
            <div className="univer-absolute univer-right-0 univer-cursor-pointer univer-text-sm univer-s-[14px]">
                {showDelete && <DeleteEmptySingle onClick={() => onChange(null, currentIndex)} />}
            </div>
        </div>
    );
}

function findNextColIndex(range: IRange, list: Nullable<IOrderRule>[]): number | null {
    const { startColumn, endColumn } = range;
    const used = new Set(list.map((item) => item?.colIndex));
    for (let i = startColumn; i <= endColumn; i++) {
        if (!used.has(i)) {
            return i;
        }
    }
    return null;
}
