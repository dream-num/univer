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

import type { ISectionBreakConfig } from '../../../basics/interfaces';
import type { ILayoutContext } from './tools';
import { layoutNoteBody } from './footnote-layout';

/** A pageless document retains note types and renders their independent segments after its body. */
export function layoutPagelessDocumentNotes(ctx: ILayoutContext, config: ISectionBreakConfig): void {
    const pages = ctx.skeleton.pages;
    const page = pages[pages.length - 1];
    if (!page || !ctx.noteReferences?.size) {
        return;
    }
    page.notes = [];
    let top = page.sections.reduce((bottom, section) => Math.max(bottom, section.top, ...section.columns.map((column) => {
        const line = column.lines[column.lines.length - 1];
        return line ? section.top + line.top + line.lineHeight : section.top;
    })), 0) + 12;
    for (const reference of ctx.noteReferences.values()) {
        const fragments = layoutNoteBody(ctx, reference, config, {
            width: page.pageWidth - page.marginLeft - page.marginRight,
            firstPageHeight: Number.POSITIVE_INFINITY,
            continuationPageHeight: Number.POSITIVE_INFINITY,
            columnCount: 1,
        });
        for (const fragment of fragments) {
            fragment.height = Math.max(fragment.height, ...fragment.sections.flatMap((section) => section.columns.map((column) => {
                const line = column.lines[column.lines.length - 1];
                return line ? section.top + line.top + line.lineHeight : 0;
            })));
            page.notes.push({
                noteType: reference.type,
                noteId: reference.noteId,
                referenceIndex: reference.referenceIndex,
                continued: false,
                left: page.marginLeft,
                top: page.marginTop + top,
                page: fragment,
            });
            top += fragment.height;
        }
    }
    page.height = Math.max(page.height, page.marginTop + top + page.marginBottom);
}
