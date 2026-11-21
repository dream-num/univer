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

import type { DocumentDataModel, LocaleService, Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import type { IDocumentSkeletonCached, IDocumentSkeletonPage } from './basics/i-document-skeleton-cached';
import type {
    IDocumentSkeletonContinuousBaseline,
    IDocumentSkeletonContinuousSnapshot,
    IDocumentSkeletonPagePatch,
} from './components/docs/layout/document-layout-page-patch';
import type {
    IDocumentLayoutGeometryPublication,
    IDocumentLayoutPagePublication,
    IDocumentLayoutResourcePublication,
} from './components/docs/layout/document-layout-publication';
import type {
    DocumentLayoutReason,
    IDocumentLayoutInvalidation,
    IDocumentLayoutProgress,
} from './components/docs/layout/document-layout-types';
import { DocumentSkeleton } from './components/docs/layout/doc-skeleton';
import {
    hydrateDocumentSkeletonPage,
    serializeDocumentSkeletonContinuousBlock,
    serializeDocumentSkeletonPage,
} from './components/docs/layout/document-layout-page-patch';
import { DocumentViewModel } from './components/docs/view-model/document-view-model';

const MAX_PAGES_PER_PUBLICATION = 4;

export interface IDocumentLayoutSessionStartOptions {
    reason?: DocumentLayoutReason;
    anchor?: number;
    priorityAnchor?: number;
    invalidation?: IDocumentLayoutInvalidation;
    waitForHyphenationPatterns?: boolean;
    modernPageWidth?: number;
    modernHorizontalMargin?: number;
    /** Version Main has applied, even when this request needs a full first publication. */
    acknowledgedLayoutVersion?: string;
    /** An acknowledged version that this request may use as the first patch's base. */
    appliedLayoutVersion?: string;
    continuousLayoutVersion?: string;
}

export interface IDocumentLayoutStepResult {
    progress: IDocumentLayoutProgress;
    publication: IDocumentLayoutGeometryPublication | null;
}

export interface IDocumentLayoutPageResolution {
    pageIndex: number;
    pageNumber: number;
    startOffset: number;
    endOffset: number;
}

/**
 * Worker-safe owner of the document view model and incremental layout state.
 * Scheduling, transport, presentation and model revision ordering belong to callers.
 */
export class DocumentLayoutSession extends Disposable {
    private readonly _viewModel: DocumentViewModel;
    private readonly _skeleton: DocumentSkeleton;
    private _lastPublishedPageCount = 0;
    private _paginationRevision = 0;
    private _layoutReason: DocumentLayoutReason = 'initial';
    private _didPublishEditAnchor = false;
    private _continuousPageSnapshot: IDocumentSkeletonContinuousSnapshot | null = null;
    private _completedContinuousLayout: IDocumentSkeletonContinuousBaseline | undefined;
    private _acknowledgedContinuousLayout: IDocumentSkeletonContinuousBaseline | undefined;
    private _continuousEditBase: IDocumentSkeletonContinuousBaseline | undefined;
    private _continuousLayoutVersion: string | undefined;
    private readonly _publishedHeaderPages = new Map<string, Map<number | string, IDocumentSkeletonPage>>();
    private readonly _publishedFooterPages = new Map<string, Map<number | string, IDocumentSkeletonPage>>();
    private _resetPublishedResources = true;
    private _pendingPaginatedCompletion: IDocumentLayoutProgress | null = null;

    constructor(dataModel: DocumentDataModel, localeService: LocaleService) {
        super();
        this._viewModel = new DocumentViewModel(dataModel);
        this._skeleton = DocumentSkeleton.create(this._viewModel, localeService, {
            isolateIncrementalPublications: false,
            batchContinuousPublications: true,
        });
    }

    start(options?: IDocumentLayoutSessionStartOptions): number {
        this._lastPublishedPageCount = 0;
        this._layoutReason = options?.reason ?? 'initial';
        this._paginationRevision = 0;
        this._didPublishEditAnchor = false;
        this._publishedHeaderPages.clear();
        this._publishedFooterPages.clear();
        this._resetPublishedResources = true;
        this._pendingPaginatedCompletion = null;
        // Only a completed result acknowledged by Main can seed a new generation.
        const acknowledgedVersion = options?.acknowledgedLayoutVersion ?? options?.appliedLayoutVersion;
        const completed = this._completedContinuousLayout;
        const acknowledged = this._acknowledgedContinuousLayout;
        const base = completed?.version === acknowledgedVersion
            ? completed
            : acknowledged?.version === acknowledgedVersion ? acknowledged : undefined;
        // A later complete reply can be dropped by Main. Preserve its last
        // acknowledged geometry even for requests that require a full prefix.
        if (base != null) {
            this._acknowledgedContinuousLayout = base;
        }
        this._continuousEditBase = this._layoutReason === 'edit' && base?.version === options?.appliedLayoutVersion
            ? base
            : undefined;
        this._continuousLayoutVersion = options?.continuousLayoutVersion;
        this._continuousPageSnapshot = null;
        const generation = this._skeleton.startIncrementalLayout({
            ...options,
            reuseUnaffectedTail: true,
        });
        const progress = this._skeleton.getLayoutProgress();
        if (progress?.mode === 'paginated') {
            this._completedContinuousLayout = undefined;
            this._acknowledgedContinuousLayout = undefined;
            this._continuousEditBase = undefined;
        }
        this._lastPublishedPageCount = progress?.mode === 'paginated'
            ? progress.publishedPageCount
            : 0;
        return generation;
    }

    step(
        generation: number,
        budgetMs = 8,
        maxWorkUnits = Number.POSITIVE_INFINITY
    ): IDocumentLayoutStepResult {
        if (this._pendingPaginatedCompletion?.generation === generation) {
            return this._publishPaginatedCompletionBacklog();
        }
        return this._collectPublications(
            this._skeleton.stepIncrementalLayout(generation, budgetMs, maxWorkUnits)
        );
    }

    publishBacklog(generation: number): IDocumentLayoutStepResult {
        if (this._pendingPaginatedCompletion?.generation === generation) {
            return this._publishPaginatedCompletionBacklog();
        }
        return this._collectPublications(this._skeleton.publishIncrementalLayoutBacklog(generation));
    }

    getPage(pageIndex: number): IDocumentLayoutPagePublication | null {
        const page = this._skeleton.getSkeletonData()?.pages[pageIndex];
        if (page == null || page.isLayoutPlaceholder) {
            return null;
        }
        return {
            pageIndex,
            page: serializeDocumentSkeletonPage(page, true),
        };
    }

    resolvePageByOffset(offset: number): IDocumentLayoutPageResolution | null {
        const pages = this._skeleton.getSkeletonData()?.pages;
        if (pages == null || offset < 0) {
            return null;
        }
        let low = 0;
        let high = pages.length - 1;
        while (low <= high) {
            const pageIndex = Math.floor((low + high) / 2);
            const page = pages[pageIndex];
            if (offset < page.st) {
                high = pageIndex - 1;
            } else if (offset > page.ed) {
                low = pageIndex + 1;
            } else if (!page.isLayoutPlaceholder) {
                return {
                    pageIndex,
                    pageNumber: page.pageNumber,
                    startOffset: page.st,
                    endOffset: page.ed,
                };
            } else {
                return null;
            }
        }
        return null;
    }

    cancel(generation?: number): void {
        if (generation == null || this._pendingPaginatedCompletion?.generation === generation) {
            this._pendingPaginatedCompletion = null;
        }
        if (generation == null || this._skeleton.getLayoutProgress()?.generation === generation) {
            this._continuousEditBase = undefined;
            this._continuousPageSnapshot = null;
        }
        this._skeleton.cancelIncrementalLayout(generation);
    }

    resetDataModel(dataModel: DocumentDataModel): void {
        this.cancel();
        this._viewModel.reset(dataModel);
        this._skeleton.makeDirty(true);
        this._lastPublishedPageCount = 0;
        this._continuousPageSnapshot = null;
        this._pendingPaginatedCompletion = null;
    }

    getProgress(): Nullable<IDocumentLayoutProgress> {
        return this._skeleton.getLayoutProgress();
    }

    static hydratePage(
        publication: IDocumentLayoutPagePublication,
        snapshot?: ReturnType<DocumentDataModel['getSnapshot']>
    ): IDocumentSkeletonPage {
        return hydrateDocumentSkeletonPage(publication.page, undefined, snapshot);
    }

    override dispose(): void {
        this._completedContinuousLayout = undefined;
        this._acknowledgedContinuousLayout = undefined;
        this._continuousEditBase = undefined;
        this._continuousPageSnapshot = null;
        this._skeleton.dispose();
        super.dispose();
    }

    private _collectPublications(initialProgress: IDocumentLayoutProgress): IDocumentLayoutStepResult {
        let progress = initialProgress;
        // A total-page field can restart pagination within the same generation.
        if ((progress.paginationRevision ?? 0) !== this._paginationRevision) {
            this._paginationRevision = progress.paginationRevision ?? 0;
            this._lastPublishedPageCount = 0;
            this._didPublishEditAnchor = false;
        }
        if (!progress.didPublish) {
            return { progress, publication: null };
        }

        // The transport already accepts multiple pages. Drain only computed,
        // stable pages so a long document does not require one visual frame per
        // page. Keep the priority-anchor publication separate and bound hydration.
        while (progress.mode === 'paginated' && !progress.complete && !progress.didPublishAnchor &&
            progress.publishedPageCount < Math.min(this._lastPublishedPageCount + MAX_PAGES_PER_PUBLICATION, progress.pageCount - 1)) {
            const next = this._skeleton.publishIncrementalLayoutBacklog(progress.generation);
            if (!next.didPublish || next.cancelled) {
                break;
            }
            const previousPageCount = progress.publishedPageCount;
            progress = next;
            if (progress.publishedPageCount <= previousPageCount) {
                break;
            }
        }

        if (
            progress.complete &&
            progress.mode === 'paginated' &&
            progress.publishedPageCount > this._lastPublishedPageCount + 1
        ) {
            this._pendingPaginatedCompletion = progress;
            return this._publishPaginatedCompletionBacklog();
        }

        return this._collectPublication(progress);
    }

    private _publishPaginatedCompletionBacklog(): IDocumentLayoutStepResult {
        const completion = this._pendingPaginatedCompletion;
        if (completion == null) {
            throw new Error('Document layout has no paginated completion backlog.');
        }
        const publishedPageCount = Math.min(
            completion.publishedPageCount,
            this._lastPublishedPageCount + (completion.didPublishAnchor && !this._didPublishEditAnchor ? 1 : MAX_PAGES_PER_PUBLICATION)
        );
        const complete = publishedPageCount === completion.publishedPageCount;
        const progress: IDocumentLayoutProgress = {
            ...completion,
            publicationRevision: completion.publicationRevision + publishedPageCount,
            didPublish: true,
            didPublishAnchor: completion.didPublishAnchor && !this._didPublishEditAnchor,
            publishedPageCount,
            complete,
        };
        if (complete) {
            this._pendingPaginatedCompletion = null;
        }
        return this._collectPublication(progress);
    }

    private _collectPublication(progress: IDocumentLayoutProgress): IDocumentLayoutStepResult {
        const skeletonData = this._skeleton.getSkeletonData();
        if (skeletonData == null) {
            throw new Error('Document layout reported a publication without skeleton data.');
        }

        const resources = this._collectResourcePublication(skeletonData, progress.complete);

        if (progress.mode === 'continuous') {
            const page = skeletonData.pages[0];
            if (page == null) {
                throw new Error('Continuous document layout reported a publication without a logical page.');
            }
            const { block, snapshot } = serializeDocumentSkeletonContinuousBlock(
                page,
                this._continuousPageSnapshot,
                true,
                {
                    base: this._continuousEditBase,
                    trackBaseline: this._continuousLayoutVersion != null,
                    complete: progress.complete,
                    captureFrom: this._completedContinuousLayout ?? this._acknowledgedContinuousLayout,
                }
            );
            if (progress.complete) {
                const version = this._continuousLayoutVersion;
                this._completedContinuousLayout = version != null && snapshot.baselineSections != null && snapshot.tables != null
                    ? { version, height: snapshot.height, sections: snapshot.baselineSections, tables: snapshot.tables }
                    : undefined;
                if (this._completedContinuousLayout != null) {
                    block.completedLayoutVersion = this._completedContinuousLayout.version;
                }
            }
            this._continuousEditBase = undefined;
            this._continuousPageSnapshot = progress.complete ? null : snapshot;
            return {
                progress,
                publication: {
                    kind: 'block',
                    left: skeletonData.left,
                    top: skeletonData.top,
                    st: skeletonData.st,
                    ...(skeletonData.ed == null ? {} : { ed: skeletonData.ed }),
                    block,
                    resources,
                },
            };
        }

        const endPageIndex = progress.publishedPageCount;
        const publishEditAnchor = this._layoutReason === 'edit' &&
            progress.didPublishAnchor &&
            !this._didPublishEditAnchor;
        const startPageIndex = publishEditAnchor
            ? Math.min(this._lastPublishedPageCount, Math.max(0, endPageIndex - 1))
            : this._lastPublishedPageCount;
        const pages = skeletonData.pages
            .slice(startPageIndex, endPageIndex)
            .map((page, offset): IDocumentLayoutPagePublication => ({
                pageIndex: startPageIndex + offset,
                page: serializeDocumentSkeletonPage(page, true),
            }));
        this._lastPublishedPageCount = Math.max(this._lastPublishedPageCount, endPageIndex);
        this._didPublishEditAnchor ||= publishEditAnchor;

        return {
            progress,
            publication: {
                kind: 'page',
                left: skeletonData.left,
                top: skeletonData.top,
                st: skeletonData.st,
                ...(skeletonData.ed == null ? {} : { ed: skeletonData.ed }),
                pages,
                resources,
            },
        };
    }

    private _collectResourcePublication(
        skeletonData: IDocumentSkeletonCached,
        complete: boolean
    ): IDocumentLayoutResourcePublication {
        // Width-dependent header/footer pages can be created speculatively while
        // pagination converges and then removed from the final source cache. Delta
        // publications cannot express that removal, so the completion publication
        // is an authoritative resource snapshot rather than another additive patch.
        if (complete) {
            this._publishedHeaderPages.clear();
            this._publishedFooterPages.clear();
        }
        const collect = (
            source: typeof skeletonData.skeHeaders,
            published: Map<string, Map<number | string, IDocumentSkeletonPage>>
        ): IDocumentLayoutResourcePublication['skeHeaders'] => {
            const patches: IDocumentLayoutResourcePublication['skeHeaders'] = [];
            for (const [segmentId, pagesByWidth] of source) {
                let publishedPagesByWidth = published.get(segmentId);
                if (publishedPagesByWidth == null) {
                    publishedPagesByWidth = new Map();
                    published.set(segmentId, publishedPagesByWidth);
                }

                const pagePatches: Array<[number | string, IDocumentSkeletonPagePatch]> = [];
                for (const [width, page] of pagesByWidth) {
                    if (publishedPagesByWidth.get(width) === page) {
                        continue;
                    }
                    publishedPagesByWidth.set(width, page);
                    pagePatches.push([width, serializeDocumentSkeletonPage(page, true)]);
                }
                if (pagePatches.length > 0) {
                    patches.push([segmentId, pagePatches]);
                }
            }
            return patches;
        };
        const reset = this._resetPublishedResources || complete;
        this._resetPublishedResources = false;
        return {
            reset,
            skeHeaders: collect(skeletonData.skeHeaders, this._publishedHeaderPages),
            skeFooters: collect(skeletonData.skeFooters, this._publishedFooterPages),
            skeListLevel: complete
                ? [...(skeletonData.skeListLevel ?? [])].map(([listId, levels]) => [
                    listId,
                    Array.from(
                        levels,
                        (level) => (level ?? []).map(({ bullet, paragraph }) => ({ bullet, paragraph }))
                    ),
                ])
                : null,
            drawingAnchor: complete
                ? [...(skeletonData.drawingAnchor ?? [])].map(([segmentId, anchors]) => [
                    segmentId,
                    [...anchors].map(([paragraphIndex, anchor]) => [
                        paragraphIndex,
                        {
                            paragraphIndex: anchor.paragraphIndex,
                            top: anchor.top,
                            ...(anchor.left == null ? {} : { left: anchor.left }),
                        },
                    ]),
                ])
                : null,
        };
    }
}
