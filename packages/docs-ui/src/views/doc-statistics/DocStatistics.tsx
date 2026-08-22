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

import type { IDocumentStatistics } from '@univerjs/core';
import type { LocaleKey } from '../../locale/types';
import { LOCALE_META, LocaleService, RegionService } from '@univerjs/core';
import { Dropdown, Separator } from '@univerjs/design';
import { LoadingMultiIcon, StatisticalFunctionIcon } from '@univerjs/icons';
import { ToolbarButton, useDependency, useObservable } from '@univerjs/ui';
import { useState } from 'react';
import { useDocStatistics } from './use-doc-statistics';

type DisplayStatistics = IDocumentStatistics & { pages: number; lines: number };

interface IStatisticRow {
    key: keyof DisplayStatistics;
    label: LocaleKey;
}

interface IStatisticsContentProps {
    statistics: DisplayStatistics;
    selection: boolean;
    showPages: boolean;
    loading: boolean;
}

const STATISTIC_ROW_GROUPS: IStatisticRow[][] = [
    [
        { key: 'pages', label: 'docs-ui.statistics.pages' },
        { key: 'words', label: 'docs-ui.statistics.words' },
    ],
    [
        { key: 'charactersWithoutSpaces', label: 'docs-ui.statistics.charactersWithoutSpaces' },
        { key: 'charactersWithSpaces', label: 'docs-ui.statistics.charactersWithSpaces' },
    ],
    [
        { key: 'paragraphs', label: 'docs-ui.statistics.paragraphs' },
        { key: 'lines', label: 'docs-ui.statistics.lines' },
    ],
    [
        { key: 'nonAsianWords', label: 'docs-ui.statistics.nonAsianWords' },
        { key: 'asianCharactersAndKoreanWords', label: 'docs-ui.statistics.asianCharactersAndKoreanWords' },
    ],
];

function StatisticsContent({ statistics, selection, showPages, loading }: IStatisticsContentProps) {
    const localeService = useDependency(LocaleService);
    const regionService = useDependency(RegionService);
    const direction = useObservable(localeService.direction$, localeService.getDirection());
    const currentRegion = useObservable(regionService.currentRegion$, regionService.getCurrentRegion());
    const regionTag = LOCALE_META[currentRegion].tag;
    const statisticGroups = STATISTIC_ROW_GROUPS
        .map((rows) => rows.filter(({ key }) => showPages || key !== 'pages'))
        .filter((rows) => rows.length > 0);
    const showLoadingPlaceholder = loading && statisticGroups
        .flat()
        .every(({ key }) => statistics[key] === 0);

    return (
        <div className="univer-w-full" dir={direction}>
            <header className="univer-flex univer-items-center univer-gap-3 univer-px-4 univer-py-3">
                <div
                    className={`
                      univer-min-w-0 univer-flex-1
                      rtl:univer-text-right
                    `}
                >
                    <div className="univer-truncate univer-text-sm univer-font-semibold univer-leading-5">
                        {localeService.t<LocaleKey>('docs-ui.statistics.title')}
                    </div>
                    <div
                        className={`
                          univer-truncate univer-text-xs univer-leading-4 univer-text-gray-500
                          dark:!univer-text-gray-400
                        `}
                    >
                        {localeService.t<LocaleKey>(selection ? 'docs-ui.statistics.selection' : 'docs-ui.statistics.document')}
                    </div>
                </div>
                {loading && (
                    <LoadingMultiIcon
                        aria-hidden="true"
                        className="univer-size-4 univer-shrink-0 univer-animate-spin univer-text-primary-600"
                    />
                )}
            </header>
            <Separator />
            <dl className="univer-m-0 univer-p-2">
                {statisticGroups.map((rows, groupIndex) => (
                    <div key={rows[0].key}>
                        {groupIndex > 0 && <Separator className="univer-my-1" />}
                        {rows.map(({ key, label }) => (
                            <div
                                key={key}
                                className={`
                                  univer-flex univer-items-center univer-justify-between univer-gap-4 univer-rounded-md
                                  univer-px-2 univer-py-1
                                `}
                            >
                                <dt
                                    className={`
                                      univer-min-w-0 univer-flex-1 univer-text-sm univer-leading-5 univer-text-gray-600
                                      rtl:univer-text-right
                                      dark:!univer-text-gray-300
                                    `}
                                >
                                    {localeService.t<LocaleKey>(label)}
                                </dt>
                                <dd
                                    className={`
                                      univer-m-0 univer-min-w-12 univer-shrink-0 univer-text-right univer-text-sm
                                      univer-font-semibold univer-tabular-nums univer-leading-5 univer-text-gray-900
                                      rtl:univer-text-left
                                      dark:!univer-text-gray-0
                                    `}
                                >
                                    {showLoadingPlaceholder ? '—' : statistics[key].toLocaleString(regionTag)}
                                </dd>
                            </div>
                        ))}
                    </div>
                ))}
            </dl>
        </div>
    );
}

export function DocStatistics() {
    const localeService = useDependency(LocaleService);
    const regionService = useDependency(RegionService);
    const [open, setOpen] = useState(false);
    const { document, selection, loading, showPages } = useDocStatistics(open);
    const currentRegion = useObservable(regionService.currentRegion$, regionService.getCurrentRegion());
    const regionTag = LOCALE_META[currentRegion].tag;
    const displayedStatistics = selection ?? document;
    const openLabel = localeService.t<LocaleKey>('docs-ui.statistics.open');
    const title = localeService.t<LocaleKey>('docs-ui.statistics.title');
    const label = selection
        ? localeService.t<LocaleKey>('docs-ui.statistics.selectedWords', selection.words.toLocaleString(regionTag), document.words.toLocaleString(regionTag))
        : localeService.t<LocaleKey>('docs-ui.statistics.wordCount', document.words.toLocaleString(regionTag));

    return (
        <Dropdown
            align="start"
            className="univer-w-80 univer-shadow-xl"
            side="top"
            open={open}
            aria-busy={loading}
            aria-label={title}
            onOpenChange={setOpen}
            overlay={(
                <StatisticsContent
                    statistics={displayedStatistics}
                    selection={selection != null}
                    showPages={showPages}
                    loading={loading}
                />
            )}
        >
            <span title={open ? undefined : openLabel}>
                <ToolbarButton
                    noIcon
                    active={open}
                    className={`
                      !univer-h-7 univer-px-2 univer-text-xs !univer-text-gray-600
                      focus-visible:univer-ring-2 focus-visible:univer-ring-primary-500
                      dark:!univer-text-gray-300
                    `}
                    aria-expanded={open}
                    aria-haspopup="dialog"
                    aria-label={openLabel}
                >
                    <span className="univer-flex univer-items-center univer-gap-1.5">
                        <StatisticalFunctionIcon className="univer-size-4" />
                        <span>{label}</span>
                        {loading && <LoadingMultiIcon className="univer-size-3.5 univer-animate-spin" />}
                    </span>
                </ToolbarButton>
            </span>
        </Dropdown>
    );
}
