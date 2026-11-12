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

import { ICommandService, ILogService, LocaleService } from '@univerjs/core';
import { Button, Segmented } from '@univerjs/design';
import { FilterBy } from '@univerjs/sheets-filter';
import { SheetsUIPart } from '@univerjs/sheets-ui';
import { ComponentContainer, useComponentsOfPart, useDependency, useObservable } from '@univerjs/ui';
import { useCallback } from 'react';
import { of } from 'rxjs';
import type { LocaleKey } from '../../locale/types';
import type { ByColorsModel, ByConditionsModel, ByValuesModel } from '../../services/sheets-filter-panel.service';
import { CloseFilterPanelOperation } from '../../commands/operations/sheets-filter.operation';
import { ISheetsFilterPanelService } from '../../services/sheets-filter-panel.service';
import { FilterByColor } from './SheetsFilterByColorsPanel';
import { FilterByCondition } from './SheetsFilterByConditionsPanel';
import { FilterByValue } from './SheetsFilterByValuesPanel';
import { FilterSyncSwitch } from './SheetsFilterSyncSwitch';

const FILTER_BY_OPTIONS: Array<{ label: LocaleKey; value: FilterBy }> = [
    { label: 'sheets-filter-ui.panel.by-values', value: FilterBy.VALUES },
    { label: 'sheets-filter-ui.panel.by-colors', value: FilterBy.COLORS },
    { label: 'sheets-filter-ui.panel.by-conditions', value: FilterBy.CONDITIONS },
];

/**
 * This Filter Panel component is used to filter the data in the sheet.
 *
 * @returns React element
 */
export interface IFilterPanelProps {
    onClose?: () => void;
    showSyncSwitch?: boolean;
}

export function FilterPanel({ onClose, showSyncSwitch = true }: IFilterPanelProps = {}) {
    const sheetsFilterPanelService = useDependency(ISheetsFilterPanelService);
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const logService = useDependency(ILogService);

    const filterBy = useObservable(sheetsFilterPanelService.filterBy$, undefined, true);
    const filterByModel = useObservable(sheetsFilterPanelService.filterByModel$, undefined, false);
    const canApply = useObservable(() => filterByModel?.canApply$ || of(false), undefined, false, [filterByModel]);
    const items = FILTER_BY_OPTIONS.map((option) => ({ ...option, label: localeService.t(option.label) }));

    // only can disable clear when there is no criteria
    const clearFilterDisabled = !useObservable(sheetsFilterPanelService.hasCriteria$);

    const onFilterByTypeChange = useCallback((value: FilterBy) => {
        sheetsFilterPanelService.changeFilterBy(value);
    }, [sheetsFilterPanelService]);

    const onCancel = useCallback(() => {
        if (onClose) {
            onClose();
            return;
        }
        return commandService.executeCommand(CloseFilterPanelOperation.id);
    }, [commandService, onClose]);

    const onClearCriteria = useCallback(async () => {
        try {
            if (await filterByModel?.clear() && sheetsFilterPanelService.filterByModel === filterByModel) {
                await onCancel();
            }
        } catch (error) {
            logService.error(error);
        }
    }, [filterByModel, sheetsFilterPanelService, onCancel, logService]);

    const onApply = useCallback(async () => {
        try {
            if (await filterByModel?.apply() && sheetsFilterPanelService.filterByModel === filterByModel) {
                await onCancel();
            }
        } catch (error) {
            logService.error(error);
        }
    }, [filterByModel, sheetsFilterPanelService, onCancel, logService]);

    const filterModel = sheetsFilterPanelService.filterModel;
    const range = filterModel?.getRange();
    const colIndex = sheetsFilterPanelService.col;
    const FilterPanelEmbedPointPart = useComponentsOfPart(SheetsUIPart.FILTER_PANEL_EMBED_POINT);

    return (
        <div
            data-u-comp="sheets-filter-panel"
            className={`
              univer-box-border univer-flex univer-max-h-[500px] univer-w-[400px] univer-flex-col univer-rounded-lg
              univer-bg-gray-0 univer-p-4 univer-shadow-lg
              dark:!univer-border-gray-600 dark:!univer-bg-gray-700
            `}
        >
            <ComponentContainer
                components={FilterPanelEmbedPointPart}
                sharedProps={{ range, colIndex, unitId: filterModel?.unitId, subUnitId: filterModel?.subUnitId, onClose: onCancel }}
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
                            : filterBy === FilterBy.COLORS
                                ? <FilterByColor model={filterByModel as ByColorsModel} />
                                : <FilterByCondition model={filterByModel as ByConditionsModel} />}
                    </div>
                )
                : (
                    <div className="univer-flex-1" />
                )}
            {showSyncSwitch && <FilterSyncSwitch />}
            <div
                data-u-comp="sheets-filter-panel-footer"
                className={`
                  univer-mt-4 univer-inline-flex univer-flex-shrink-0 univer-flex-grow-0 univer-flex-nowrap
                  univer-justify-between univer-overflow-hidden
                `}
            >
                <Button variant="link" onClick={onClearCriteria} disabled={clearFilterDisabled}>
                    {localeService.t<LocaleKey>('sheets-filter-ui.panel.clear-filter')}
                </Button>
                <span className="univer-flex univer-gap-2">
                    <Button variant="default" onClick={onCancel}>
                        {localeService.t<LocaleKey>('sheets-filter-ui.panel.cancel')}
                    </Button>
                    <Button disabled={!canApply} variant="primary" onClick={onApply}>
                        {localeService.t<LocaleKey>('sheets-filter-ui.panel.confirm')}
                    </Button>
                </span>
            </div>
        </div>
    );
}
export const FILTER_PANEL_POPUP_KEY = 'FILTER_PANEL_POPUP';
