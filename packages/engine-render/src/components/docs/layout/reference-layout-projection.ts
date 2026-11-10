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

import type { IDocumentBody, IDocumentData } from '@univerjs/core';
import type { IDocumentSkeletonCached } from '../../../basics/i-document-skeleton-cached';
import type { IDocumentReferenceLayoutResolver } from '../document-reference-layout';
import { getHeaderFooterReferenceOffsetMap, remapHeaderFooterReferenceSkeleton } from './header-footer-reference-projection';
import { formatNoteNumber } from './note-numbering';

export function projectDocumentReferenceLayout(
    original: IDocumentData,
    skeleton: IDocumentSkeletonCached,
    resolver: IDocumentReferenceLayoutResolver,
    layout: (document: IDocumentData) => IDocumentSkeletonCached
): { document: IDocumentData; skeleton: IDocumentSkeletonCached } | undefined {
    let document = original;
    let measured = skeleton;
    const candidates = new Set<string>();
    // A page reference can itself move the target onto another page.
    for (let pass = 0; pass < 10; pass++) {
        const projected = resolver.project(document, measured.pages.map((page) => ({
            start: page.st,
            end: page.ed,
            label: formatNoteNumber(page.pageNumber, page.pageNumberFormat),
            number: page.pageNumber,
            headerId: page.headerId,
            footerId: page.footerId,
            drawingIds: [...page.skeDrawings.keys()],
            notes: page.notes?.map((note) => ({ noteId: note.noteId, start: note.page.st, end: note.page.ed })),
        })));
        if (!projected) {
            return document === original || !remapReferenceLayout(original, document, measured)
                ? undefined
                : { document, skeleton: measured };
        }
        const signature = JSON.stringify(projected);
        if (candidates.has(signature)) {
            return undefined;
        }
        candidates.add(signature);
        measured = layout(projected);
        document = projected;
    }
    // Preserve the cached layout if pagination cannot reach a fixed point.
    return undefined;
}

function remapReferenceLayout(original: IDocumentData, projected: IDocumentData, skeleton: IDocumentSkeletonCached): boolean {
    const maps = new Map<string, { original: IDocumentBody; projected: IDocumentBody; offsets: number[] }>();
    const stories: [string, IDocumentBody | undefined][] = [
        ['', original.body],
        ...Object.entries(original.notes ?? {}).map(([id, note]): [string, IDocumentBody] => [id, note.body]),
    ];
    for (const [id, body] of stories) {
        const target = id ? projected.notes?.[id]?.body : projected.body;
        const offsets = body && target && getHeaderFooterReferenceOffsetMap(body, target);
        if (!body || !target || !offsets) {
            return false;
        }
        maps.set(id, { original: body, projected: target, offsets });
    }
    const main = maps.get('')!;
    for (const page of skeleton.pages) {
        remapHeaderFooterReferenceSkeleton(page, main.original, main.projected, main.offsets);
        for (const note of page.notes ?? []) {
            note.referenceIndex = main.offsets[note.referenceIndex];
            const mapping = maps.get(note.noteId);
            if (mapping) {
                remapHeaderFooterReferenceSkeleton(note.page, mapping.original, mapping.projected, mapping.offsets);
            }
        }
    }
    for (const [segmentId, anchors] of skeleton.drawingAnchor ?? []) {
        const mapping = maps.get(segmentId) ?? (original.tableSource?.[segmentId] || projected.tableSource?.[segmentId] ? main : undefined);
        if (mapping) {
            const entries = [...anchors];
            anchors.clear();
            for (const [index, anchor] of entries) {
                anchor.paragraphIndex = mapping.offsets[anchor.paragraphIndex];
                anchors.set(mapping.offsets[index], anchor);
            }
        }
    }
    skeleton.st = main.offsets[skeleton.st];
    if (skeleton.ed != null) {
        skeleton.ed = main.offsets[skeleton.ed];
    }
    return true;
}
