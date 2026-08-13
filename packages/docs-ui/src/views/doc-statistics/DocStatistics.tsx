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
import { LOCALE_META, LocaleService } from '@univerjs/core';
import { LoadingMultiIcon, StatisticalFunctionIcon } from '@univerjs/icons';
import { RectPopup, ToolbarButton, useDependency } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { useDocStatistics } from './use-doc-statistics';

type DisplayStatistics = IDocumentStatistics & { pages: number; lines: number };

interface IStatisticRow {
    key: keyof DisplayStatistics;
    label: LocaleKey;
}

const STATISTIC_ROWS: IStatisticRow[] = [
    { key: 'pages', label: 'docs-ui.statistics.pages' },
    { key: 'words', label: 'docs-ui.statistics.words' },
    { key: 'charactersWithoutSpaces', label: 'docs-ui.statistics.charactersWithoutSpaces' },
    { key: 'charactersWithSpaces', label: 'docs-ui.statistics.charactersWithSpaces' },
    { key: 'paragraphs', label: 'docs-ui.statistics.paragraphs' },
    { key: 'lines', label: 'docs-ui.statistics.lines' },
    { key: 'nonAsianWords', label: 'docs-ui.statistics.nonAsianWords' },
    { key: 'asianCharactersAndKoreanWords', label: 'docs-ui.statistics.asianCharactersAndKoreanWords' },
];

function StatisticsPanel({ statistics, selection, showPages }: { statistics: DisplayStatistics; selection: boolean; showPages: boolean }) {
    const localeService = useDependency(LocaleService);
    const localeTag = LOCALE_META[localeService.getCurrentLocale()].tag;

    return (
        <div
            role="dialog"
            aria-label={localeService.t<LocaleKey>('docs-ui.statistics.title')}
            className={`
              univer-w-80 univer-rounded-lg univer-border univer-border-gray-200 univer-bg-white univer-p-4
              univer-shadow-lg
              dark:!univer-border-gray-600 dark:!univer-bg-gray-800
            `}
        >
            <div className="univer-mb-3">
                <div className="univer-text-sm univer-font-medium">
                    {localeService.t<LocaleKey>('docs-ui.statistics.title')}
                </div>
                <div
                    className={`
                      univer-mt-0.5 univer-text-xs univer-text-gray-500
                      dark:!univer-text-gray-400
                    `}
                >
                    {localeService.t<LocaleKey>(selection ? 'docs-ui.statistics.selection' : 'docs-ui.statistics.document')}
                </div>
            </div>
            <dl className="univer-grid univer-grid-cols-[1fr_auto] univer-gap-x-5 univer-gap-y-2 univer-text-sm">
                {STATISTIC_ROWS.filter(({ key }) => showPages || key !== 'pages').map(({ key, label }) => (
                    <div className="univer-contents" key={String(key)}>
                        <dt>{localeService.t<LocaleKey>(label)}</dt>
                        <dd className="univer-m-0 univer-text-right univer-font-medium univer-tabular-nums">
                            {statistics[key].toLocaleString(localeTag)}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

export function DocStatistics() {
    const localeService = useDependency(LocaleService);
    const [open, setOpen] = useState(false);
    const { document, selection, loading, showPages } = useDocStatistics(open);
    const triggerRef = useRef<HTMLSpanElement>(null);
    const anchorRect$ = useMemo(() => new BehaviorSubject({ left: 0, right: 0, top: 0, bottom: 0 }), []);
    const localeTag = LOCALE_META[localeService.getCurrentLocale()].tag;
    const displayedStatistics = selection ?? document;
    const openLabel = localeService.t<LocaleKey>('docs-ui.statistics.open');
    const label = selection
        ? localeService.t<LocaleKey>('docs-ui.statistics.selectedWords', selection.words.toLocaleString(localeTag), document.words.toLocaleString(localeTag))
        : localeService.t<LocaleKey>('docs-ui.statistics.wordCount', document.words.toLocaleString(localeTag));

    useEffect(() => {
        if (!open) return;

        const updatePosition = () => {
            const rect = triggerRef.current?.getBoundingClientRect();
            if (!rect) return;

            anchorRect$.next({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom });
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('keydown', closeOnEscape);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, [anchorRect$, open]);

    return (
        <>
            <span ref={triggerRef} title={open ? undefined : openLabel}>
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
                    onClick={() => setOpen((visible) => !visible)}
                >
                    <span className="univer-flex univer-items-center univer-gap-1.5">
                        <StatisticalFunctionIcon className="univer-size-4" />
                        <span>{label}</span>
                        {loading && <LoadingMultiIcon className="univer-size-3.5 univer-animate-spin" />}
                    </span>
                </ToolbarButton>
            </span>
            {open && (
                <RectPopup
                    portal
                    anchorRect$={anchorRect$}
                    direction="top-left"
                    onClickOutside={() => setOpen(false)}
                    onContextMenu={() => setOpen(false)}
                >
                    <StatisticsPanel statistics={displayedStatistics} selection={selection != null} showPages={showPages} />
                </RectPopup>
            )}
        </>
    );
}
