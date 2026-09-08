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

import type { IDocumentData, IDrawings } from '@univerjs/core';

/** Resolve persisted drawing ownership independently of the current text selection. */
export function findDocDrawing(snapshot: IDocumentData, drawingId: string): {
    drawing: IDrawings[string];
    path: string[];
    segmentId: string;
} | undefined {
    const drawing = snapshot.drawings?.[drawingId];
    if (drawing) {
        return { drawing, path: ['drawings', drawingId], segmentId: '' };
    }
    for (const [segmentId, note] of Object.entries(snapshot.notes ?? {})) {
        const drawing = note.drawings?.[drawingId];
        if (drawing) {
            return { drawing, path: ['notes', segmentId, 'drawings', drawingId], segmentId };
        }
    }
}

/** The render registry is flat; persisted note resources retain their own scope. */
export function collectDocDrawings(snapshot: IDocumentData): { drawings: IDrawings; drawingsOrder: string[] } {
    let drawings = snapshot.drawings ?? {};
    let drawingsOrder = snapshot.drawingsOrder ?? Object.keys(drawings);
    let copied = false;
    for (const note of Object.values(snapshot.notes ?? {})) {
        if (!note.drawings || Object.keys(note.drawings).length === 0) {
            continue;
        }
        if (!copied) {
            drawings = { ...drawings };
            drawingsOrder = [...drawingsOrder];
            copied = true;
        }
        Object.assign(drawings, note.drawings);
        drawingsOrder.push(...(note.drawingsOrder ?? Object.keys(note.drawings)));
    }
    return { drawings, drawingsOrder };
}
