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

import type { IDocumentSkeletonPage } from '../../../basics/i-document-skeleton-cached';
import type { ISectionBreakConfig } from '../../../basics/interfaces';
import type { ILayoutContext } from './tools';
import { DocumentDataModel } from '@univerjs/core';
import { DocumentViewModel } from '../view-model/document-view-model';
import { defaultSeparatorBody, layoutFootnoteBody, layoutFootnoteSegment } from './footnote-layout';
import { getNoteSections } from './footnote-numbering';
import { createSkeletonPage } from './model/page';

/** Endnotes occupy document flow after a section or the final body section. */
export class DocumentEndnoteLayout {
    constructor(private readonly _ctx: ILayoutContext) {}

    finishSection(pages: IDocumentSkeletonPage[], sectionIndex: number, config: ISectionBreakConfig): void {
        const snapshot = this._ctx.dataModel.getSnapshot();
        const sections = getNoteSections(snapshot);
        const section = sections[sectionIndex];
        const isLast = sectionIndex >= sections.length - 1;
        const placed = new Set(pages.flatMap((page) => (page.notes ?? []).map((note) => note.noteId)));
        const references = [...this._ctx.footnoteReferences?.values() ?? []].filter((reference) => {
            if (reference.type !== 'endnote' || placed.has(reference.noteId)) {
                return false;
            }
            if (isLast) {
                return true;
            }
            return reference.properties.position === 'sectEnd' && !section?.suppressEndnotes &&
                reference.referenceIndex <= (section?.startIndex ?? -1);
        });
        if (references.length === 0 || pages.length === 0) {
            return;
        }
        this._ctx.footnoteLayout?.finish(pages, config);
        let page = pages[pages.length - 1];
        let top = getEndnoteFlowBottom(page);
        let decoration = this._layoutDecoration(page, config, 'separator');
        let needsSeparator = true;
        for (const reference of references) {
            const contentHeight = page.pageHeight - page.marginTop - page.marginBottom - (page.footnoteHeight ?? 0);
            const separatorHeight = needsSeparator ? decoration?.height ?? 0 : 0;
            const continuation = this._layoutDecoration(page, config, 'continuationSeparator');
            const notice = this._layoutDecoration(page, config, 'continuationNotice');
            const options = {
                width: page.pageWidth - page.marginLeft - page.marginRight,
                firstPageHeight: Math.max(1, contentHeight - top - separatorHeight),
                continuationPageHeight: Math.max(1, page.pageHeight - page.marginTop - page.marginBottom - (continuation?.height ?? 0) - (notice?.height ?? 0)),
                columnCount: 1,
            };
            let notePages = layoutFootnoteBody(this._ctx, reference, config, options);
            if (notice && notePages.length > 1) {
                notePages = layoutFootnoteBody(this._ctx, reference, config, { ...options, firstPageHeight: Math.max(1, options.firstPageHeight - notice.height) });
            }
            let continued = false;
            for (let index = 0; index < notePages.length; index++) {
                const fragment = notePages[index];
                if (index > 0) {
                    page = createSkeletonPage(this._ctx, config, this._ctx.skeletonResourceReference, page.pageNumber + 1);
                    pages.push(page);
                    top = 0;
                    needsSeparator = true;
                    decoration = continued ? continuation : this._layoutDecoration(page, config, 'separator');
                }
                if (!hasNoteContent(fragment)) {
                    continue;
                }
                if (needsSeparator && decoration) {
                    page.footnoteDecorations ??= [];
                    page.footnoteDecorations.push({
                        noteType: 'endnote',
                        kind: continued ? 'continuationSeparator' : 'separator',
                        left: page.marginLeft,
                        top: page.marginTop + top,
                        page: decoration,
                    });
                    top += decoration.height;
                }
                needsSeparator = false;
                page.notes ??= [];
                page.notes.push({ noteType: 'endnote', noteId: reference.noteId, referenceIndex: reference.referenceIndex, continued, left: page.marginLeft, top: page.marginTop + top, page: fragment });
                top += fragment.height;
                continued = true;
                if (notice && index < notePages.length - 1) {
                    page.footnoteDecorations ??= [];
                    page.footnoteDecorations.push({ noteType: 'endnote', kind: 'continuationNotice', left: page.marginLeft, top: page.marginTop + top, page: notice });
                    top += notice.height;
                }
            }
            placed.add(reference.noteId);
        }
    }

    private _layoutDecoration(
        page: IDocumentSkeletonPage,
        config: ISectionBreakConfig,
        kind: 'separator' | 'continuationSeparator' | 'continuationNotice'
    ): IDocumentSkeletonPage | undefined {
        const snapshot = this._ctx.dataModel.getSnapshot();
        const body = snapshot.noteSettings?.endnote?.[kind] ?? (kind === 'continuationNotice' ? undefined : defaultSeparatorBody(kind === 'continuationSeparator'));
        if (!body) {
            return;
        }
        const model = new DocumentDataModel({ id: `endnote-${kind}`, body, documentStyle: snapshot.documentStyle, styles: snapshot.styles });
        const viewModel = new DocumentViewModel(model);
        try {
            return layoutFootnoteSegment(this._ctx, viewModel, { noteId: model.getUnitId(), sectionId: config.sectionId }, config, {
                width: page.pageWidth - page.marginLeft - page.marginRight,
                firstPageHeight: Number.POSITIVE_INFINITY,
                continuationPageHeight: Number.POSITIVE_INFINITY,
            })[0];
        } finally {
            viewModel.dispose();
            model.dispose();
        }
    }
}

function hasNoteContent(page: IDocumentSkeletonPage): boolean {
    return page.sections.some((section) => section.columns.some((column) => column.lines.length > 0));
}

export function getEndnoteFlowBottom(page: IDocumentSkeletonPage): number {
    const bodyBottom = page.sections.reduce((bottom, section) => Math.max(bottom, section.top, ...section.columns.map((column) => {
        const line = column.lines[column.lines.length - 1];
        return line ? section.top + line.top + line.lineHeight : section.top;
    })), 0);
    return Math.max(bodyBottom, ...page.notes?.filter((note) => note.noteType === 'endnote')
        .map((note) => note.top - page.marginTop + note.page.height) ?? []);
}
