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

import type { MobileDrawerSnap } from '@univerjs/ui';
import type { LocaleKey } from '../../locale/types';
import type {
    ByColorsModel,
    ByConditionsModel,
    ByValuesModel,
} from '../../services/sheets-filter-panel.service';
import { ICommandService, IContextService, LocaleService, Tools } from '@univerjs/core';
import {
    Button,
    MessageType,
    MobileActionRow,
    MobileActionRowGroup,
    resetButtonClassName,
    Switch,
} from '@univerjs/design';
import { MoreLeftIcon, MoreRightIcon } from '@univerjs/icons';
import { FilterBy, SheetsFilterSyncController } from '@univerjs/sheets-filter';
import { IMessageService, MobileDrawer, useDependency, useObservable } from '@univerjs/ui';
import { useRef, useState } from 'react';
import { map, of } from 'rxjs';
import {
    ChangeFilterByOperation,
    CloseFilterPanelOperation,
    FILTER_PANEL_OPENED_KEY,
} from '../../commands/operations/sheets-filter.operation';
import { ISheetsFilterPanelService } from '../../services/sheets-filter-panel.service';
import { MobileFilterByColor } from './MobileFilterByColor';
import { MobileFilterByCondition } from './MobileFilterByCondition';
import { MobileFilterByValue } from './MobileFilterByValue';

const FILTER_BY_OPTIONS: Array<{ label: LocaleKey; value: FilterBy }> = [
    { label: 'sheets-filter-ui.panel.by-values', value: FilterBy.VALUES },
    { label: 'sheets-filter-ui.panel.by-colors', value: FilterBy.COLORS },
    { label: 'sheets-filter-ui.panel.by-conditions', value: FilterBy.CONDITIONS },
];

function MobileFilterSyncSwitch() {
    const localeService = useDependency(LocaleService);
    const messageService = useDependency(IMessageService);
    const filterSyncController = useDependency(SheetsFilterSyncController);
    const visible = useObservable(filterSyncController.visible$, false, true);
    const enabled = useObservable(filterSyncController.enabled$, true, true);

    if (!visible) {
        return null;
    }

    return (
        <div
            className="
              univer-flex univer-min-h-20 univer-items-center univer-gap-4 univer-rounded-xl univer-bg-gray-0
              univer-px-4 univer-py-3
              dark:!univer-bg-gray-800
            "
        >
            <div className="univer-min-w-0 univer-flex-1">
                <div
                    className="
                      univer-text-base univer-font-medium univer-text-gray-900
                      dark:!univer-text-gray-100
                    "
                >
                    {localeService.t<LocaleKey>('sheets-filter-ui.sync.title')}
                </div>
                <div
                    className="
                      univer-mt-1 univer-text-sm univer-text-gray-500
                      dark:!univer-text-gray-400
                    "
                >
                    {localeService.t<LocaleKey>(enabled
                        ? 'sheets-filter-ui.sync.statusTips.on'
                        : 'sheets-filter-ui.sync.statusTips.off')}
                </div>
            </div>
            <Switch
                defaultChecked={enabled}
                onChange={(checked) => {
                    filterSyncController.setEnabled(checked);
                    messageService.show({
                        content: localeService.t<LocaleKey>(checked
                            ? 'sheets-filter-ui.sync.switchTips.on'
                            : 'sheets-filter-ui.sync.switchTips.off'),
                        type: MessageType.Success,
                        duration: 2000,
                    });
                }}
            />
        </div>
    );
}

export function MobileSheetsFilterPanel() {
    const contextService = useDependency(IContextService);
    const visible = useObservable(
        () => contextService.subscribeContextValue$(FILTER_PANEL_OPENED_KEY).pipe(map(Boolean)),
        Boolean(contextService.getContextValue(FILTER_PANEL_OPENED_KEY)),
        false,
        [contextService]
    );

    return visible ? <MobileSheetsFilterPanelContent /> : null;
}

function MobileSheetsFilterPanelContent() {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const panelService = useDependency(ISheetsFilterPanelService);
    const filterBy = useObservable(panelService.filterBy$, FilterBy.VALUES, true);
    const filterByModel = useObservable(panelService.filterByModel$, null);
    const canApply = useObservable(() => filterByModel?.canApply$ ?? of(false), false, true, [filterByModel]);
    const hasCriteria = useObservable(panelService.hasCriteria$, false, true);
    const col = useObservable(panelService.col$, panelService.col, true);
    const [detailOpen, setDetailOpen] = useState(false);
    const [drawerSnap, setDrawerSnap] = useState<MobileDrawerSnap>('compact');
    const layerRef = useRef<HTMLDivElement>(null);

    const filterRange = panelService.filterModel?.getRange();
    const title = detailOpen
        ? localeService.t<LocaleKey>(FILTER_BY_OPTIONS.find((option) => option.value === filterBy)!.label)
        : localeService.t<LocaleKey>('sheets-filter-ui.toolbar.smart-toggle-filter-tooltip');

    async function closePanel() {
        await commandService.executeCommand(CloseFilterPanelOperation.id);
    }

    async function openFilterBy(nextFilterBy: FilterBy) {
        const changed = await commandService.executeCommand(ChangeFilterByOperation.id, { filterBy: nextFilterBy });
        if (changed) {
            setDetailOpen(true);
            setDrawerSnap('expanded');
        }
    }

    async function clearFilter() {
        await filterByModel?.clear();
        await closePanel();
    }

    async function applyFilter() {
        await filterByModel?.apply();
        await closePanel();
    }

    function goBack() {
        if (detailOpen) {
            setDetailOpen(false);
            setDrawerSnap('compact');
            return;
        }

        closePanel().catch(() => undefined);
    }

    function changeColumn(offset: number) {
        const nextCol = col + offset;
        if (!filterRange || nextCol < filterRange.startColumn || nextCol > filterRange.endColumn) {
            return;
        }

        panelService.setupCol(panelService.filterModel!, nextCol);
    }

    return (
        <div ref={layerRef} className="univer-pointer-events-none univer-fixed univer-inset-0 univer-z-[1100]">
            <MobileDrawer
                layerRef={layerRef}
                componentName="mobile-sheets-filter-drawer"
                snap={drawerSnap}
                expandLabel={localeService.t<LocaleKey>('sheets-filter-ui.panel.mobile.resize')}
                collapseLabel={localeService.t<LocaleKey>('sheets-filter-ui.panel.mobile.resize')}
                onSnapChange={setDrawerSnap}
                onClose={() => closePanel().catch(() => undefined)}
                role="dialog"
                ariaLabel={title}
                panelClassName="univer-pointer-events-auto"
                contentClassName="univer-min-h-0 univer-px-4 univer-pb-4"
                header={(
                    <div
                        className="
                          univer-grid univer-h-12 univer-flex-1 univer-grid-cols-[56px_minmax(0,1fr)_56px]
                          univer-items-center univer-px-2
                        "
                    >
                        <button
                            type="button"
                            aria-label={localeService.t<LocaleKey>('sheets-filter-ui.panel.mobile.back')}
                            className={`
                              ${resetButtonClassName}
                              univer-flex univer-size-12 univer-items-center univer-justify-center
                            `}
                            onClick={goBack}
                        >
                            <MoreLeftIcon className="univer-size-6" />
                        </button>
                        <div className="univer-truncate univer-text-center univer-text-base univer-font-semibold">
                            {title}
                        </div>
                    </div>
                )}
                footer={detailOpen
                    ? (
                        <div
                            className="
                              univer-shrink-0 univer-border-0 univer-border-t univer-border-solid univer-border-gray-200
                              univer-p-4
                              dark:!univer-border-gray-700
                            "
                        >
                            <MobileActionRowGroup>
                                <Button onClick={() => closePanel().catch(() => undefined)}>
                                    {localeService.t<LocaleKey>('sheets-filter-ui.panel.cancel')}
                                </Button>
                                <Button
                                    variant="primary"
                                    disabled={!canApply || !filterByModel}
                                    onClick={() => applyFilter().catch(() => undefined)}
                                >
                                    {localeService.t<LocaleKey>('sheets-filter-ui.panel.confirm')}
                                </Button>
                            </MobileActionRowGroup>
                        </div>
                    )
                    : undefined}
            >
                {detailOpen
                    ? (
                        <div className="univer-flex univer-min-h-full univer-flex-col">
                            <div
                                className="
                                  univer-flex univer-min-h-14 univer-items-center univer-justify-between univer-px-2
                                "
                            >
                                <span className="univer-text-base univer-font-medium">
                                    {localeService.t<LocaleKey>(
                                        'sheets-filter-ui.panel.mobile.column',
                                        Tools.chatAtABC(col)
                                    )}
                                </span>
                                <div className="univer-flex univer-gap-2">
                                    <Button
                                        disabled={!filterRange || col <= filterRange.startColumn}
                                        onClick={() => changeColumn(-1)}
                                    >
                                        {localeService.t<LocaleKey>('sheets-filter-ui.panel.mobile.previous-column')}
                                    </Button>
                                    <Button
                                        disabled={!filterRange || col >= filterRange.endColumn}
                                        onClick={() => changeColumn(1)}
                                    >
                                        {localeService.t<LocaleKey>('sheets-filter-ui.panel.mobile.next-column')}
                                    </Button>
                                </div>
                            </div>
                            <div className="univer-min-h-0 univer-flex-1">
                                {filterBy === FilterBy.VALUES && filterByModel
                                    ? <MobileFilterByValue model={filterByModel as ByValuesModel} />
                                    : null}
                                {filterBy === FilterBy.COLORS && filterByModel
                                    ? <MobileFilterByColor model={filterByModel as ByColorsModel} />
                                    : null}
                                {filterBy === FilterBy.CONDITIONS && filterByModel
                                    ? <MobileFilterByCondition model={filterByModel as ByConditionsModel} />
                                    : null}
                            </div>
                        </div>
                    )
                    : (
                        <div className="univer-grid univer-gap-4">
                            <div
                                className="
                                  univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
                                  dark:!univer-bg-gray-800
                                "
                            >
                                {FILTER_BY_OPTIONS.map((option) => {
                                    const label = localeService.t<LocaleKey>(option.label);
                                    return (
                                        <MobileActionRow
                                            key={option.value}
                                            title={label}
                                            aria-label={label}
                                            className="univer-rounded-none"
                                            trailing={<MoreRightIcon className="univer-size-5 univer-text-gray-400" />}
                                            onClick={() => openFilterBy(option.value).catch(() => undefined)}
                                        />
                                    );
                                })}
                            </div>
                            <MobileFilterSyncSwitch />
                            <Button
                                size="large"
                                disabled={!hasCriteria || !filterByModel}
                                onClick={() => clearFilter().catch(() => undefined)}
                            >
                                {localeService.t<LocaleKey>('sheets-filter-ui.panel.clear-filter')}
                            </Button>
                        </div>
                    )}
            </MobileDrawer>
        </div>
    );
}
