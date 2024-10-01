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

import type { ByConditionsModel, ByValuesModel } from '../../services/sheets-filter-panel.service';
import { ICommandService, LocaleService, useDependency } from '@univerjs/core';
import { Button, type ISegmentedProps, Segmented } from '@univerjs/design';
import { SheetsFilterService } from '@univerjs/sheets-filter';

import { SheetsUIPart } from '@univerjs/sheets-ui';
import { ComponentContainer, useComponentsOfPart, useObservable } from '@univerjs/ui';
import React, { useCallback, useMemo } from 'react';
import { of } from 'rxjs';
import { ChangeFilterByOperation, CloseFilterPanelOperation } from '../../commands/operations/sheets-filter.operation';
import { FilterBy, SheetsFilterPanelService } from '../../services/sheets-filter-panel.service';
import styles from './index.module.less';
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
    const options = useFilterByOptions(localeService);

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
        <div className={styles.sheetsFilterPanel}>
            <ComponentContainer
                components={FilterPanelEmbedPointPart}
                sharedProps={{ range, colIndex, onClose: onCancel }}
            />
            <div className={styles.sheetsFilterPanelHeader}>
                <Segmented value={filterBy} options={options} onChange={(value) => onFilterByTypeChange(value as FilterBy)}></Segmented>
            </div>
            {filterByModel
                ? (
                    <div className={styles.sheetsFilterPanelContent}>
                        {filterBy === FilterBy.VALUES
                            ? <FilterByValue model={filterByModel as ByValuesModel} />
                            : <FilterByCondition model={filterByModel as ByConditionsModel} />}
                    </div>
                )
                : (
                    <div style={{ flex: 1 }} />
                )}
            <div className={styles.sheetsFilterPanelFooter}>
                <Button type="link" onClick={onClearCriteria} disabled={clearFilterDisabled}>{localeService.t('sheets-filter.panel.clear-filter')}</Button>
                <span className={styles.sheetsFilterPanelFooterPrimaryButtons}>
                    <Button type="default" onClick={onCancel}>{localeService.t('sheets-filter.panel.cancel')}</Button>
                    <Button disabled={!canApply} type="primary" onClick={onApply}>{localeService.t('sheets-filter.panel.confirm')}</Button>
                </span>
            </div>
        </div>
    );
}

function useFilterByOptions(localeService: LocaleService): ISegmentedProps['options'] {
    const locale = localeService.getCurrentLocale();
    return useMemo(() => [
        { label: localeService.t('sheets-filter.panel.by-values'), value: FilterBy.VALUES },
        { label: localeService.t('sheets-filter.panel.by-conditions'), value: FilterBy.CONDITIONS },
    ]
        // eslint-disable-next-line react-hooks/exhaustive-deps
    , [locale, localeService]);
}

