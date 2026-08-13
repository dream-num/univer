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

import type { DocumentDataModel, IDocumentStatistics, IDocumentStatisticsOptions, ITextRangeParam, Nullable } from '@univerjs/core';
import type { DocumentSkeleton } from '@univerjs/engine-render';
import { DocumentFlavor, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { documentSkeletonLineIterator, IRenderManagerService } from '@univerjs/engine-render';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { combineLatest, map, startWith } from 'rxjs';

const STATISTICS_DEBOUNCE_TIME = 200;
const EMPTY_STATISTICS: IDocumentStatistics = {
    words: 0,
    charactersWithoutSpaces: 0,
    charactersWithSpaces: 0,
    paragraphs: 0,
    nonAsianWords: 0,
    asianCharactersAndKoreanWords: 0,
};

interface IDocLayoutStatistics {
    pages: number;
    lines: number;
}

const EMPTY_LAYOUT_STATISTICS: IDocLayoutStatistics = { pages: 0, lines: 0 };

export interface IDocStatisticsViewState {
    document: IDocumentStatistics & IDocLayoutStatistics;
    selection: (IDocumentStatistics & IDocLayoutStatistics) | null;
    loading: boolean;
    showPages: boolean;
}

interface ICalculateStatisticsParams {
    calculateLayout: boolean;
    calculatePages: boolean;
    documentDataModel: DocumentDataModel;
    cachedStatistics?: IDocumentStatistics;
    locale: IDocumentStatisticsOptions['locale'];
    selectionRanges: ITextRangeParam[];
    signal: AbortSignal;
    skeleton: DocumentSkeleton | null;
}

interface IDocumentStatisticsCache {
    documentDataModel: DocumentDataModel;
    locale: IDocumentStatisticsOptions['locale'];
    revision: number;
    statistics: IDocumentStatistics;
}

function getBodySelectionRanges(selectionManager: DocSelectionManagerService): ITextRangeParam[] {
    return (selectionManager.getTextRanges() ?? [])
        .filter((range) => !range.collapsed && !range.segmentId)
        .map(({ collapsed, direction, endOffset, isActive, rangeType, segmentId, segmentPage, startOffset }) => ({
            collapsed,
            direction,
            endOffset,
            isActive,
            rangeType,
            segmentId,
            segmentPage,
            startOffset,
        }));
}

function rangeIntersectsLine(range: ITextRangeParam, startOffset: number, endOffset: number): boolean {
    const rangeStart = Math.min(range.startOffset, range.endOffset);
    const rangeEnd = Math.max(range.startOffset, range.endOffset);
    return rangeStart < endOffset && rangeEnd > startOffset;
}

export function getDocLayoutStatistics(
    skeleton: DocumentSkeleton | null,
    ranges: Readonly<ITextRangeParam>[] = [],
    calculatePages = true
): IDocLayoutStatistics {
    const pages = skeleton?.getSkeletonData()?.pages ?? [];
    if (ranges.length === 0) {
        let lines = 0;
        documentSkeletonLineIterator(pages, {}, () => lines++);
        return { lines, pages: calculatePages ? pages.length : 0 };
    }

    let lines = 0;
    const selectedPages = calculatePages ? new Set<number>() : null;
    documentSkeletonLineIterator(pages, {}, ({ line, pageIndex }) => {
        if (ranges.some((range) => rangeIntersectsLine(range, line.st, line.ed))) {
            lines += 1;
            selectedPages?.add(pageIndex);
        }
    });

    return { lines, pages: selectedPages?.size ?? 0 };
}

async function calculateStatistics({
    calculateLayout,
    calculatePages,
    documentDataModel,
    cachedStatistics,
    locale,
    selectionRanges,
    signal,
    skeleton,
}: ICalculateStatisticsParams): Promise<Omit<IDocStatisticsViewState, 'loading' | 'showPages'>> {
    const documentLayout = calculateLayout ? getDocLayoutStatistics(skeleton, [], calculatePages) : EMPTY_LAYOUT_STATISTICS;
    const selectionLayout = calculateLayout && selectionRanges.length > 0
        ? getDocLayoutStatistics(skeleton, selectionRanges, calculatePages)
        : EMPTY_LAYOUT_STATISTICS;
    const [documentStatistics, selectionStatistics] = await Promise.all([
        cachedStatistics ?? documentDataModel.getStatistics({ locale, signal }),
        selectionRanges.length > 0
            ? documentDataModel.getStatistics({ locale, ranges: selectionRanges, signal })
            : null,
    ]);

    return {
        document: { ...documentStatistics, ...documentLayout },
        selection: selectionStatistics ? { ...selectionStatistics, ...selectionLayout } : null,
    };
}

function cacheDocumentStatistics(
    cacheRef: { current: IDocumentStatisticsCache | null },
    documentDataModel: DocumentDataModel,
    locale: IDocumentStatisticsOptions['locale'],
    revision: number,
    statistics: IDocStatisticsViewState['document']
): void {
    cacheRef.current = {
        documentDataModel,
        locale,
        revision,
        statistics: {
            words: statistics.words,
            charactersWithoutSpaces: statistics.charactersWithoutSpaces,
            charactersWithSpaces: statistics.charactersWithSpaces,
            paragraphs: statistics.paragraphs,
            nonAsianWords: statistics.nonAsianWords,
            asianCharactersAndKoreanWords: statistics.asianCharactersAndKoreanWords,
        },
    };
}

function useStatisticsSelection(
    documentDataModel: Nullable<DocumentDataModel>,
    selectionManager: DocSelectionManagerService
): { ranges: ITextRangeParam[]; revision: number } {
    return useObservable(
        documentDataModel
            ? () => combineLatest([
                selectionManager.textSelection$.pipe(startWith(undefined)),
                documentDataModel.change$,
            ]).pipe(map(([, revision]) => ({
                ranges: getBodySelectionRanges(selectionManager),
                revision,
            })))
            : null,
        { ranges: [], revision: 0 },
        false,
        [documentDataModel, selectionManager]
    );
}

function useDocumentSkeleton(
    documentDataModel: Nullable<DocumentDataModel>,
    renderManagerService: IRenderManagerService
): Nullable<DocumentSkeleton> {
    const skeletonManager = documentDataModel
        ? renderManagerService.getRenderUnitById(documentDataModel.getUnitId())?.with(DocSkeletonManagerService)
        : null;
    return useObservable(
        skeletonManager ? skeletonManager.currentSkeleton$.pipe(map((value) => ({ value }))) : null,
        { value: skeletonManager?.getSkeleton() ?? null },
        false,
        [skeletonManager]
    ).value;
}

export function useDocStatistics(calculateLayout = false): IDocStatisticsViewState {
    const instanceService = useDependency(IUniverInstanceService);
    const localeService = useDependency(LocaleService);
    const renderManagerService = useDependency(IRenderManagerService);
    const selectionManager = useDependency(DocSelectionManagerService);
    const documentStatisticsCacheRef = useRef<IDocumentStatisticsCache | null>(null);
    const documentDataModel = useObservable(useMemo(
        () => instanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC),
        [instanceService]
    ));
    const selectionSnapshot = useStatisticsSelection(documentDataModel, selectionManager);
    const locale = useObservable(localeService.currentLocale$, localeService.getCurrentLocale());
    const showPages = documentDataModel?.getDocumentStyle().documentFlavor !== DocumentFlavor.MODERN;
    const skeleton = useDocumentSkeleton(calculateLayout ? documentDataModel : null, renderManagerService);
    const [state, setState] = useState<Omit<IDocStatisticsViewState, 'showPages'>>({
        document: { ...EMPTY_STATISTICS, lines: 0, pages: 0 },
        selection: null,
        loading: true,
    });
    const selectionRanges = selectionSnapshot.ranges;

    useEffect(() => {
        if (!documentDataModel?.getBody()) {
            return;
        }

        const currentDocumentDataModel = documentDataModel;
        const cachedDocumentStatistics = documentStatisticsCacheRef.current;
        const hasCachedDocumentStatistics = cachedDocumentStatistics?.documentDataModel === currentDocumentDataModel
            && cachedDocumentStatistics.locale === locale
            && cachedDocumentStatistics.revision === selectionSnapshot.revision;

        const abortController = new AbortController();
        const timeout = setTimeout(async () => {
            setState((current) => ({ ...current, loading: true }));

            try {
                const result = await calculateStatistics({
                    calculateLayout,
                    calculatePages: showPages,
                    documentDataModel: currentDocumentDataModel,
                    cachedStatistics: hasCachedDocumentStatistics ? cachedDocumentStatistics.statistics : undefined,
                    locale,
                    selectionRanges,
                    signal: abortController.signal,
                    skeleton: skeleton ?? null,
                });
                if (!hasCachedDocumentStatistics) {
                    cacheDocumentStatistics(
                        documentStatisticsCacheRef,
                        currentDocumentDataModel,
                        locale,
                        selectionSnapshot.revision,
                        result.document
                    );
                }
                setState({ ...result, loading: false });
            } catch {
                if (!abortController.signal.aborted) {
                    setState((current) => ({ ...current, loading: false }));
                }
            }
        }, STATISTICS_DEBOUNCE_TIME);

        return () => {
            clearTimeout(timeout);
            abortController.abort();
        };
    }, [calculateLayout, documentDataModel, locale, selectionRanges, selectionSnapshot, showPages, skeleton]);

    return { ...state, showPages };
}
