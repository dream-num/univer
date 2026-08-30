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
import type { IDocumentSkeletonCached, IDocumentSkeletonPage } from './basics/i-document-skeleton-cached';
import type { IDocumentSkeletonContinuousSnapshot, IDocumentSkeletonPagePatch } from './components/docs/layout/document-layout-page-patch';
import type {
    IDocumentLayoutGeometryPublication,
    IDocumentLayoutPagePublication,
    IDocumentLayoutResourcePublication,
} from './components/docs/layout/document-layout-publication';
import type { DocumentLayoutReason, IDocumentLayoutInvalidation, IDocumentLayoutProgress } from './components/docs/layout/document-layout-types';
import { Disposable } from '@univerjs/core';
import { DocumentSkeleton } from './components/docs/layout/doc-skeleton';
import { hydrateDocumentSkeletonPage, serializeDocumentSkeletonContinuousBlock, serializeDocumentSkeletonPage } from './components/docs/layout/document-layout-page-patch';
import { DocumentViewModel } from './components/docs/view-model/document-view-model';

export interface IDocumentLayoutSessionStartOptions {
    reason?: DocumentLayoutReason;
    anchor?: number;
    priorityAnchor?: number;
    invalidation?: IDocumentLayoutInvalidation;
}

export interface IDocumentLayoutStepResult {
    progress: IDocumentLayoutProgress;
    publication: IDocumentLayoutGeometryPublication | null;
}

/**
 * Worker-safe owner of the document view model and incremental layout state.
 * Scheduling, transport, presentation and model revision ordering belong to callers.
 */
export class DocumentLayoutSession extends Disposable {
    private readonly _viewModel: DocumentViewModel;
    private readonly _skeleton: DocumentSkeleton;
    private _lastPublishedPageCount = 0;
    private _layoutReason: DocumentLayoutReason = 'initial';
    private _didPublishEditAnchor = false;
    private _continuousPageSnapshot: IDocumentSkeletonContinuousSnapshot | null = null;
    private _continuousReplacementOffset: number | undefined;
    private readonly _publishedHeaderPages = new Map<string, Map<number, IDocumentSkeletonPage>>();
    private readonly _publishedFooterPages = new Map<string, Map<number, IDocumentSkeletonPage>>();
    private _resetPublishedResources = true;
    private _pendingPaginatedCompletion: IDocumentLayoutProgress | null = null;

    constructor(dataModel: DocumentDataModel, localeService: LocaleService) {
        super();
        this._viewModel = new DocumentViewModel(dataModel);
        this._skeleton = DocumentSkeleton.create(this._viewModel, localeService, {
            isolateIncrementalPublications: false,
        });
    }

    start(options?: IDocumentLayoutSessionStartOptions): number {
        this._lastPublishedPageCount = 0;
        this._layoutReason = options?.reason ?? 'initial';
        this._didPublishEditAnchor = false;
        this._publishedHeaderPages.clear();
        this._publishedFooterPages.clear();
        this._resetPublishedResources = true;
        this._pendingPaginatedCompletion = null;
        if (options?.reason !== 'edit') {
            this._continuousPageSnapshot = null;
        }
        this._continuousReplacementOffset = options?.reason === 'edit'
            ? options.invalidation?.oldStart ?? options.anchor
            : undefined;
        const generation = this._skeleton.startIncrementalLayout({
            ...options,
            reuseUnaffectedTail: true,
        });
        const progress = this._skeleton.getLayoutProgress();
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

    cancel(generation?: number): void {
        if (generation == null || this._pendingPaginatedCompletion?.generation === generation) {
            this._pendingPaginatedCompletion = null;
        }
        this._skeleton.cancelIncrementalLayout(generation);
    }

    resetDataModel(dataModel: DocumentDataModel): void {
        this.cancel();
        this._viewModel.reset(dataModel);
        this._skeleton.makeDirty(true);
        this._lastPublishedPageCount = 0;
        this._continuousReplacementOffset = undefined;
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
        this._skeleton.dispose();
        super.dispose();
    }

    private _collectPublications(progress: IDocumentLayoutProgress): IDocumentLayoutStepResult {
        if (!progress.didPublish) {
            return { progress, publication: null };
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
            this._lastPublishedPageCount + 1
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
                this._continuousReplacementOffset,
                true
            );
            this._continuousPageSnapshot = snapshot;
            this._continuousReplacementOffset = undefined;
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
            published: Map<string, Map<number, IDocumentSkeletonPage>>
        ): IDocumentLayoutResourcePublication['skeHeaders'] => {
            const patches: IDocumentLayoutResourcePublication['skeHeaders'] = [];
            for (const [segmentId, pagesByWidth] of source) {
                let publishedPagesByWidth = published.get(segmentId);
                if (publishedPagesByWidth == null) {
                    publishedPagesByWidth = new Map();
                    published.set(segmentId, publishedPagesByWidth);
                }

                const pagePatches: Array<[number, IDocumentSkeletonPagePatch]> = [];
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
                        },
                    ]),
                ])
                : null,
        };
    }
}
