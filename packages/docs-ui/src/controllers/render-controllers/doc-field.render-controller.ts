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

import type { DocumentDataModel, ICustomRange } from '@univerjs/core';
import type { Documents, IPageRenderConfig, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { CustomRangeType, Disposable, DocumentFlavor, Inject, IUniverInstanceService, ThemeService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DocumentEditArea } from '@univerjs/engine-render';
import { drawDocCustomRangeChrome } from '../../basics/doc-custom-range-chrome';
import { DocEventManagerService } from '../../services/doc-event-manager.service';

export class DocFieldRenderController extends Disposable implements IRenderModule {
    private _hovered = new Set<string>();
    private _shade = '';
    private readonly _outline = { background: 'transparent', border: '' };

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
            this._outline.border = theme.getColorFromTheme('primary.600');
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
        const isTraditional = this._context.unit.getDocumentStyle().documentFlavor === DocumentFlavor.TRADITIONAL;
        const { selected, focused } = this._getSelectedFields(isTraditional);
        if (!selected.size && !this._hovered.size) {
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
        const alpha = ctx.globalAlpha;
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
            const key = `${segmentId ?? ''}:${segmentPageIndex}:${field.rangeId}`;
            const isSelected = selected.has(key);
            const outlined = focused.has(key);
            const shaded = isTraditional && !segmentId && isSelected ? false : isSelected || this._hovered.has(key);
            if (!outlined && !shaded) {
                continue;
            }
            ctx.globalAlpha = outlined ? alpha : alpha * 0.45;
            for (const rect of rects) {
                const left = rect.left - docsLeft;
                const top = rect.top - docsTop;
                if (outlined) {
                    drawDocCustomRangeChrome(ctx, { left, top, right: rect.right - docsLeft, bottom: rect.bottom - docsTop }, this._outline);
                } else {
                    ctx.fillRect(left, top, rect.right - rect.left, rect.bottom - rect.top);
                }
            }
        }
        ctx.restore();
    }

    private _getSelectedFields(isTraditional: boolean): { selected: Set<string>; focused: Set<string> } {
        const selected = new Set<string>();
        const focused = new Set<string>();
        const unit = this._context.unit;
        const selections = this._selections.getTextRanges({ unitId: this._context.unitId, subUnitId: this._context.unitId }) ?? [];
        for (const selection of selections) {
            const segmentId = selection.segmentId ?? '';
            const inTraditionalBody = isTraditional && !segmentId;
            const includeFieldStart = inTraditionalBody && selection.collapsed;
            const endOffset = selection.endOffset + (includeFieldStart ? 1 : 0);
            const fields = unit.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.customRanges ?? [];
            let focusedField: ICustomRange | undefined;
            for (const field of fields) {
                if (field.rangeType !== CustomRangeType.FIELD || selection.startOffset > field.endIndex || endOffset <= field.startIndex) {
                    continue;
                }
                selected.add(`${segmentId}:${segmentId ? selection.segmentPage : -1}:${field.rangeId}`);
                if (inTraditionalBody && selection.startOffset >= field.startIndex && selection.endOffset <= field.endIndex + 1 &&
                    (!focusedField || field.endIndex - field.startIndex < focusedField.endIndex - focusedField.startIndex)) {
                    focusedField = field;
                }
            }
            if (focusedField) {
                focused.add(`:-1:${focusedField.rangeId}`);
            }
        }
        return { selected, focused };
    }
}
