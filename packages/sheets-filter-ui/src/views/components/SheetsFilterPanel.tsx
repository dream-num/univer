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

import type { ByConditionsModel, ByValuesModel } from '../../services/sheets-filter-panel.service';
import { ICommandService, LocaleService } from '@univerjs/core';
import { Button, Segmented } from '@univerjs/design';
import { SheetsFilterService } from '@univerjs/sheets-filter';
import { SheetsUIPart } from '@univerjs/sheets-ui';
import { ComponentContainer, useComponentsOfPart, useDependency, useObservable } from '@univerjs/ui';
import { useCallback, useMemo } from 'react';
import { of } from 'rxjs';
import { ChangeFilterByOperation, CloseFilterPanelOperation } from '../../commands/operations/sheets-filter.operation';
import { FilterBy, SheetsFilterPanelService } from '../../services/sheets-filter-panel.service';
import { FilterByCondition } from './SheetsFilterByConditionsPanel';
import { FilterByValue } from './SheetsFilterByValuesPanel';

/**
 * This Filter Panel component is used to filter the data in the sheet.
 *
 * @returns React element
 */
export function FilterPanel() {
    const sheetsFilterPanelService = useDependency(SheetsFilterPanelService);
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);

    const filterBy = useObservable(sheetsFilterPanelService.filterBy$, undefined, true);
    const filterByModel = useObservable(sheetsFilterPanelService.filterByModel$, undefined, false);
    const canApply = useObservable(() => filterByModel?.canApply$ || of(false), undefined, false, [filterByModel]);
    const items = useFilterByOptions(localeService);

    // only can disable clear when there is no criteria
    const clearFilterDisabled = !useObservable(sheetsFilterPanelService.hasCriteria$);

    const onFilterByTypeChange = useCallback((value: FilterBy) => {
        commandService.executeCommand(ChangeFilterByOperation.id, { filterBy: value });
    }, [commandService]);

    const onClearCriteria = useCallback(async () => {
        await filterByModel?.clear();
        commandService.executeCommand(CloseFilterPanelOperation.id);
    }, [filterByModel, commandService]);

    const onCancel = useCallback(() => {
        commandService.executeCommand(CloseFilterPanelOperation.id);
    }, [commandService]);

    const onApply = useCallback(async () => {
        await filterByModel?.apply();
        commandService.executeCommand(CloseFilterPanelOperation.id);
    }, [filterByModel, commandService]);

    const filterService = useDependency(SheetsFilterService);
    const range = filterService.activeFilterModel?.getRange();
    const colIndex = sheetsFilterPanelService.col;
    const FilterPanelEmbedPointPart = useComponentsOfPart(SheetsUIPart.FILTER_PANEL_EMBED_POINT);

    return (
        <div
            data-u-comp="sheets-filter-panel"
            className={`
              univer-box-border univer-flex univer-h-[432px] univer-w-[312px] univer-flex-col univer-rounded-lg
              univer-bg-white univer-p-4 univer-shadow-lg
              dark:univer-border-gray-600 dark:univer-bg-gray-700
            `}
        >
            <ComponentContainer
                components={FilterPanelEmbedPointPart}
                sharedProps={{ range, colIndex, onClose: onCancel }}
            />
            <div className="univer-mb-1 univer-flex-shrink-0 univer-flex-grow-0">
                <Segmented
                    value={filterBy}
                    items={items}
                    onChange={(value) => onFilterByTypeChange(value as FilterBy)}
                />
            </div>
            {filterByModel
                ? (
                    <div
                        data-u-comp="sheets-filter-panel-content"
                        className="univer-flex-shrink univer-flex-grow univer-pt-2"
                    >
                        {filterBy === FilterBy.VALUES
                            ? <FilterByValue model={filterByModel as ByValuesModel} />
                            : <FilterByCondition model={filterByModel as ByConditionsModel} />}
                    </div>
                )
                : (
                    <div style={{ flex: 1 }} />
                )}
            <div
                data-u-comp="sheets-filter-panel-footer"
                className={`
                  univer-mt-4 univer-inline-flex univer-flex-shrink-0 univer-flex-grow-0 univer-flex-nowrap
                  univer-justify-between univer-overflow-hidden
                `}
            >
                <Button variant="link" onClick={onClearCriteria} disabled={clearFilterDisabled}>
                    {localeService.t('sheets-filter.panel.clear-filter')}
                </Button>
                <span className="univer-space-x-2">
                    <Button variant="default" onClick={onCancel}>
                        {localeService.t('sheets-filter.panel.cancel')}
                    </Button>
                    <Button disabled={!canApply} variant="primary" onClick={onApply}>
                        {localeService.t('sheets-filter.panel.confirm')}
                    </Button>
                </span>
            </div>
        </div>
    );
}

function useFilterByOptions(localeService: LocaleService) {
    const locale = localeService.getCurrentLocale();
    return useMemo(() => [
        { label: localeService.t('sheets-filter.panel.by-values'), value: FilterBy.VALUES },
        { label: localeService.t('sheets-filter.panel.by-conditions'), value: FilterBy.CONDITIONS },
    ], [locale, localeService]);
}
