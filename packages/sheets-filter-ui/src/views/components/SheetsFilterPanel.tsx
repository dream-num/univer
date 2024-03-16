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

import React, { useCallback, useMemo } from 'react';
import { Button, type ISegmentedProps, Segmented } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useObservable } from '@univerjs/ui';
import { ICommandService, LocaleService } from '@univerjs/core';

import type { ByConditionsModel } from '../../services/sheets-filter-panel.service';
import { FilterBy, SheetsFilterPanelService } from '../../services/sheets-filter-panel.service';
import { ChangeFilterByOperation, CloseFilterPanelOperation } from '../../commands/sheets-filter.operation';
import { ClearSheetsFilterCriteriaCommand } from '../../commands/sheets-filter.command';
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
    const filterModel = useObservable(sheetsFilterPanelService.filterByModel$, undefined, false);
    const options = useFilterByOptions(localeService);

    const onFilterByTypeChange = useCallback((value: FilterBy) => {
        commandService.executeCommand(ChangeFilterByOperation.id, { filterBy: value });
    }, [commandService]);

    const onClearCriteria = useCallback(async () => {
        await commandService.executeCommand(ClearSheetsFilterCriteriaCommand.id);
        commandService.executeCommand(CloseFilterPanelOperation.id);
    }, [commandService]);

    const onCancel = useCallback(() => {
        commandService.executeCommand(CloseFilterPanelOperation.id);
    }, [commandService]);

    const onApply = useCallback(async () => {
        await filterModel?.apply();
        commandService.executeCommand(CloseFilterPanelOperation.id);
    }, [filterModel, commandService]);

    return (
        <div className={styles.sheetsFilterPanel}>
            <div className={styles.sheetsFilterPanelHeader}>
                <Segmented value={filterBy} options={options} onChange={(value) => onFilterByTypeChange(value as FilterBy)}></Segmented>
            </div>
            { filterModel
                ? (
                    <div className={styles.sheetsFilterPanelContent}>
                        {filterBy === FilterBy.VALUES ? <FilterByValue /> : <FilterByCondition model={filterModel as ByConditionsModel} />}
                    </div>
                )
                : null }
            <div className={styles.sheetsFilterPanelFooter}>
                <Button type="link" onClick={onClearCriteria}>{localeService.t('sheets-filter.panel.clear-filter')}</Button>
                <span className={styles.sheetsFilterPanelFooterPrimaryButtons}>
                    <Button type="default" onClick={onCancel}>{localeService.t('sheets-filter.panel.cancel')}</Button>
                    <Button type="primary" onClick={onApply}>{localeService.t('sheets-filter.panel.confirm')}</Button>
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
