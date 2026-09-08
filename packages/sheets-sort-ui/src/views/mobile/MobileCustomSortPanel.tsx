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

import type { IOrderRule } from '@univerjs/sheets-sort';
import type { LocaleKey } from '../../locale/types';
import type { ISheetSortLocation } from '../../services/sheets-sort-ui.service';
import { LocaleService } from '@univerjs/core';
import { Button, Checkbox, MobileSelect } from '@univerjs/design';
import { DeleteEmptyIcon } from '@univerjs/icons';
import { SheetsSortService, SortType } from '@univerjs/sheets-sort';
import { useDependency, useObservable } from '@univerjs/ui';
import { useState } from 'react';
import { SheetsSortUIService } from '../../services/sheets-sort-ui.service';

export function MobileCustomSortPanel() {
    const sheetsSortUIService = useDependency(SheetsSortUIService);
    const state = useObservable(sheetsSortUIService.customSortState$);

    if (!state?.location) {
        return null;
    }

    return <MobileCustomSortPanelContent location={state.location} />;
}

function MobileCustomSortPanelContent({ location }: { location: ISheetSortLocation }) {
    const sheetsSortService = useDependency(SheetsSortService);
    const sheetsSortUIService = useDependency(SheetsSortUIService);
    const localeService = useDependency(LocaleService);
    const { range, unitId, subUnitId } = location;
    const [hasTitle, setHasTitle] = useState(false);
    const [orderRules, setOrderRules] = useState<IOrderRule[]>([
        { type: SortType.ASC, colIndex: range.startColumn },
    ]);
    const titles = sheetsSortUIService.getTitles(hasTitle);
    const canAddCondition = orderRules.length < titles.length;

    function updateRule(index: number, update: Partial<IOrderRule>) {
        setOrderRules((current) => current.map((rule, ruleIndex) =>
            ruleIndex === index ? { ...rule, ...update } : rule));
    }

    function addCondition() {
        setOrderRules((current) => {
            const nextTitle = titles.find((title) => !current.some((rule) => rule.colIndex === title.index));
            return nextTitle
                ? [...current, { type: SortType.ASC, colIndex: nextTitle.index }]
                : current;
        });
    }

    function setTitle(value: boolean) {
        setHasTitle(value);
        sheetsSortUIService.setSelection(
            unitId,
            subUnitId,
            value ? { ...range, startRow: range.startRow + 1 } : range
        );
    }

    function apply() {
        sheetsSortService.applySort({ range, orderRules, hasTitle }, unitId, subUnitId);
        sheetsSortUIService.closeCustomSortPanel();
    }

    return (
        <div className="univer-grid univer-gap-4">
            <div className="univer-flex univer-items-center univer-justify-between univer-gap-3">
                <Checkbox checked={hasTitle} onChange={(value) => setTitle(Boolean(value))}>
                    {localeService.t<LocaleKey>('sheets-sort-ui.dialog.first-row-check')}
                </Checkbox>
                <Button variant="text" disabled={!canAddCondition} onClick={addCondition}>
                    {localeService.t<LocaleKey>('sheets-sort-ui.dialog.add-condition')}
                </Button>
            </div>
            <div className="univer-grid univer-gap-3">
                {orderRules.map((rule, index) => {
                    const availableTitles = titles.filter((title) =>
                        title.index === rule.colIndex || !orderRules.some((item) => item.colIndex === title.index));

                    return (
                        <div
                            key={rule.colIndex}
                            className="
                              univer-grid univer-gap-2 univer-rounded-xl univer-bg-gray-50 univer-p-3
                              dark:!univer-bg-gray-800
                            "
                        >
                            <div className="univer-flex univer-items-center univer-gap-2">
                                <MobileSelect
                                    className="!univer-min-w-0 univer-flex-1"
                                    value={`${rule.colIndex}`}
                                    options={availableTitles.map((title) => ({
                                        label: title.label,
                                        value: `${title.index}`,
                                    }))}
                                    onChange={(value) => updateRule(index, { colIndex: Number(value) })}
                                />
                                {orderRules.length > 1 && (
                                    <Button
                                        size="icon"
                                        variant="text"
                                        aria-label={localeService.t<LocaleKey>('sheets-sort-ui.dialog.delete-condition')}
                                        onClick={() => setOrderRules((current) => current.filter((_, ruleIndex) => ruleIndex !== index))}
                                    >
                                        <DeleteEmptyIcon />
                                    </Button>
                                )}
                            </div>
                            <MobileSelect
                                className="univer-w-full"
                                value={rule.type}
                                options={[
                                    {
                                        label: localeService.t<LocaleKey>('sheets-sort-ui.general.sort-asc'),
                                        value: SortType.ASC,
                                    },
                                    {
                                        label: localeService.t<LocaleKey>('sheets-sort-ui.general.sort-desc'),
                                        value: SortType.DESC,
                                    },
                                ]}
                                onChange={(value) => updateRule(index, { type: value as SortType })}
                            />
                        </div>
                    );
                })}
            </div>
            <div
                className="
                  univer-sticky univer-bottom-0 univer-grid univer-grid-cols-2 univer-gap-3 univer-bg-gray-0 univer-py-3
                  dark:!univer-bg-gray-900
                "
            >
                <Button size="large" onClick={() => sheetsSortUIService.closeCustomSortPanel()}>
                    {localeService.t<LocaleKey>('sheets-sort-ui.dialog.cancel')}
                </Button>
                <Button size="large" variant="primary" onClick={apply}>
                    {localeService.t<LocaleKey>('sheets-sort-ui.dialog.confirm')}
                </Button>
            </div>
        </div>
    );
}
