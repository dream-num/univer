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

import type { IRange, Nullable } from '@univerjs/core';
import { LocaleService, LocaleType, throttle, useDependency } from '@univerjs/core';
import { Button, Checkbox, DraggableList, DropdownLegacy, Radio, RadioGroup } from '@univerjs/design';
import { CheckMarkSingle, DeleteEmptySingle, IncreaseSingle, MoreDownSingle, SequenceSingle } from '@univerjs/icons';
import { type IOrderRule, SheetsSortService, SortType } from '@univerjs/sheets-sort';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SheetsSortUIService } from '../services/sheets-sort-ui.service';

import styles from './index.module.less';

export interface ICustomSortPanelProps {
    range: IRange;
    onListChange: (value: IOrderRule[]) => void;
}

export function CustomSortPanel() {
    const sheetsSortUIService = useDependency(SheetsSortUIService);
    const sheetsSortService = useDependency(SheetsSortService);
    const localeService = useDependency(LocaleService);

    const [hasTitle, setHasTitle] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const listEndRef = useRef<HTMLDivElement>(null);

    const state = sheetsSortUIService.customSortState();
    if (!state || !state.location) {
        return null;
    }
    const { range, unitId, subUnitId } = state.location;

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
        }, 200), [list, range]);

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
        <div className={styles.customSortPanelContainer}>
            <div className={styles.customSortPanelContent} onMouseDown={(e) => { e.stopPropagation(); }}>
                <div className={styles.customSortPanelExt}>
                    <div className={styles.firstRowCheck}>
                        <Checkbox checked={hasTitle} onChange={(value) => setTitle(!!value)}>
                            {localeService.t('sheets-sort.dialog.first-row-check')}
                        </Checkbox>
                    </div>
                    {canNew
                        ? (
                            <div className={styles.addCondition} onClick={newItem}>
                                <IncreaseSingle />
                                <span className={styles.addConditionText}>{localeService.t('sheets-sort.dialog.add-condition')}</span>
                            </div>
                        )
                        : (
                            <div className={`
                              ${styles.addCondition}
                              ${styles.addConditionDisable}
                            `}
                            >
                                <IncreaseSingle />
                                <span className={styles.addConditionText}>{localeService.t('sheets-sort.dialog.add-condition')}</span>
                            </div>
                        )}

                </div>
                <div
                    className={styles.conditionList}
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
                        draggableHandle={`.${styles.customSortPanelItemHandler}`}
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
            <div className={styles.customSortPanelFooter}>
                <Button className={styles.customSortPanelFooterBtn} type="default" onClick={() => cancel()}>{localeService.t('sheets-sort.dialog.cancel')}</Button>
                <Button className={styles.customSortPanelFooterBtn} type="primary" onClick={() => apply(list, hasTitle)}>{localeService.t('sheets-sort.dialog.confirm')}</Button>
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

    const radioClass = localeService.getCurrentLocale() === LocaleType.ZH_CN ? styles.customSortPanelItemOrderRadioCn : styles.customSortPanelItemOrderRadio;
    return (
        <div className={styles.customSortPanelItem}>
            <div className={styles.customSortPanelItemHead}>
                <div className={styles.customSortPanelItemHandler}>
                    <SequenceSingle />
                </div>
                <div className={styles.customSortPanelItemColumn}>
                    <DropdownLegacy
                        placement="bottomLeft"
                        trigger={['click']}
                        visible={visible}
                        onVisibleChange={onVisibleChange}
                        overlay={(
                            <ul className={styles.customSortColMenu}>
                                {availableMenu.map((menuItem) => (
                                    <li
                                        key={menuItem.index}
                                        onClick={() => handleChangeColIndex(menuItem)}
                                        className={styles.customSortColMenuItem}
                                    >
                                        <span className={styles.customSortColMenuItemDesc}>
                                            {menuItem.label}
                                        </span>
                                        <span className={styles.customSortColMenuItemCheck}>
                                            {menuItem.index === item.colIndex && (
                                                <CheckMarkSingle />
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    >
                        <div className={styles.customSortPanelItemColumnInput}>
                            <span className={styles.customSortPanelItemColumnInputText}>{itemLabel}</span>
                            <MoreDownSingle className={styles.customSortPanelItemColumnInputDropdown} />
                        </div>
                    </DropdownLegacy>
                </div>
            </div>
            <div className={styles.customSortPanelItemOrder}>
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
            <div className={styles.customSortPanelItemRemove}>
                { showDelete && <DeleteEmptySingle onClick={() => onChange(null, currentIndex)} />}
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

