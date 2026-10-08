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

import type { DocumentDataModel } from '@univerjs/core';
import type { Documents, IPageRenderConfig, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { CustomRangeType, Disposable, Inject, IUniverInstanceService, ThemeService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DocumentEditArea } from '@univerjs/engine-render';
import { DocEventManagerService } from '../../services/doc-event-manager.service';

export class DocFieldRenderController extends Disposable implements IRenderModule {
    private _hovered = new Set<string>();
    private _shade = '';

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocEventManagerService) private readonly _events: DocEventManagerService,
        @Inject(DocSelectionManagerService) private readonly _selections: DocSelectionManagerService,
        @Inject(ThemeService) theme: ThemeService,
        @IUniverInstanceService private readonly _instances: IUniverInstanceService
    ) {
        super();
        const documents = this._context.mainComponent as Documents;
        this.disposeWithMe(theme.currentTheme$.subscribe(() => {
            this._shade = theme.getColorFromTheme('gray.200');
            documents.makeDirty(true);
        }));
        this.disposeWithMe(this._events.hoverCustomRanges$.subscribe((ranges) => {
            this._hovered = new Set(ranges.filter(({ range }) => range.rangeType === CustomRangeType.FIELD)
                .map(({ range, segmentId, segmentPageIndex }) => `${segmentId ?? ''}:${segmentPageIndex}:${range.rangeId}`));
            documents.makeDirty(true);
        }));
        this.disposeWithMe(this._selections.textSelection$.subscribe(({ unitId }) => {
            if (unitId === this._context.unitId) {
                documents.makeDirty(true);
            }
        }));
        this.disposeWithMe(this._instances.focused$.subscribe(() => documents.makeDirty(true)));
        this.disposeWithMe(documents.getSkeleton()!.getViewModel().editAreaChange$.subscribe(() => documents.makeDirty(true)));
        this.disposeWithMe(documents.pageRender$.subscribe((config) => this._drawFields(config)));
    }

    private _drawFields({ page, pageLeft, pageTop, ctx }: IPageRenderConfig): void {
        if (this._instances.getFocusedUnit()?.getUnitId() !== this._context.unitId) {
            return;
        }
        const active = this._getActiveFields();
        if (!active.size) {
            return;
        }
        const documents = this._context.mainComponent as Documents;
        const skeleton = documents.getSkeleton()!;
        const pageIndex = skeleton.getSkeletonData()!.pages.indexOf(page);
        const { docsLeft, docsTop } = documents.getOffsetConfig();
        const area = skeleton.getViewModel().getEditArea();
        const snapshot = this._context.unit.getSnapshot();
        const activeSegments = area === DocumentEditArea.HEADER ? snapshot.headers : snapshot.footers;
        ctx.save();
        ctx.beginPath();
        ctx.rect(pageLeft, pageTop, page.pageWidth, page.pageHeight);
        ctx.clip();
        ctx.fillStyle = this._shade;
        ctx.globalAlpha *= 0.45;
        for (const { customRange: field, segmentId, segmentPageIndex, rects } of this._events.getCustomRangeBounds()) {
            if (field.rangeType !== CustomRangeType.FIELD) {
                continue;
            }
            if (segmentId) {
                if (area === DocumentEditArea.BODY || segmentPageIndex !== pageIndex || !activeSegments?.[segmentId]) {
                    continue;
                }
            } else if (area !== DocumentEditArea.BODY) {
                continue;
            }
            if (!active.has(`${segmentId ?? ''}:${segmentPageIndex}:${field.rangeId}`)) {
                continue;
            }
            for (const rect of rects) {
                ctx.fillRect(rect.left - docsLeft, rect.top - docsTop, rect.right - rect.left, rect.bottom - rect.top);
            }
        }
        ctx.restore();
    }

    private _getActiveFields(): Set<string> {
        const active = new Set(this._hovered);
        const selections = this._selections.getTextRanges({ unitId: this._context.unitId, subUnitId: this._context.unitId }) ?? [];
        for (const selection of selections) {
            const segmentId = selection.segmentId ?? '';
            const fields = this._context.unit.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.customRanges ?? [];
            for (const field of fields) {
                if (field.rangeType === CustomRangeType.FIELD && selection.startOffset <= field.endIndex && selection.endOffset > field.startIndex) {
                    active.add(`${segmentId}:${segmentId ? selection.segmentPage : -1}:${field.rangeId}`);
                }
            }
        }
        return active;
    }
}
