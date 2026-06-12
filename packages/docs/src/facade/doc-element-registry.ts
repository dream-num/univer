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

import type { IDocumentBody } from '@univerjs/core';
import { generateRandomId } from '@univerjs/core';

/**
 * The top-level document body element types supported by the doc facade.
 */
export type FDocElementType = 'paragraph' | 'table' | 'blockRange' | 'customBlock';

interface IParagraphRegistryEntry {
    key: string;
    segmentId: string;
    startIndex: number;
    stale: boolean;
}

/**
 * Error thrown when a facade element key can no longer be resolved uniquely.
 *
 * A stale paragraph usually means the paragraph was deleted, or an external edit
 * changed the document in a way that the runtime temporary key cannot follow.
 *
 * @example
 * ```ts
 * const doc = univerAPI.getActiveDocument();
 * if (!doc) throw new Error('No active document');
 *
 * const paragraph = doc.getBody().getChild(0).asParagraph();
 * paragraph.removeFromParent();
 *
 * try {
 *     paragraph.getText();
 * } catch (error) {
 *     if (error instanceof DocElementStaleError) {
 *         console.log('The paragraph handle is stale.');
 *     }
 * }
 * ```
 */
export class DocElementStaleError extends Error {
    /**
     * Create a stale element error.
     * @param {string} message The error message.
     */
    constructor(message = 'Doc element is stale') {
        super(message);
        this.name = 'DocElementStaleError';
    }
}

/**
 * Runtime registry for temporary paragraph keys.
 *
 * The registry is owned by an `FDocument` instance. It never writes keys into the
 * document snapshot. Facade edits notify the registry before text changes so
 * paragraph keys can move with their source paragraph or become stale when the
 * source paragraph is removed.
 *
 * @hideconstructor
 */
export class DocElementRegistry {
    private readonly _paragraphsBySegment = new Map<string, IParagraphRegistryEntry[]>();

    /**
     * Get or create the runtime key for a paragraph in a segment.
     * @param {string} segmentId The header/footer segment id, or an empty string for the main body.
     * @param {IDocumentBody} body The current document body snapshot.
     * @param {number} paragraphIndex The zero-based paragraph index.
     * @returns {string} The runtime key for the paragraph.
     */
    getParagraphKey(segmentId: string, body: IDocumentBody, paragraphIndex: number): string {
        const paragraph = body.paragraphs?.[paragraphIndex];
        if (!paragraph) {
            throw new RangeError(`Paragraph index ${paragraphIndex} is out of range.`);
        }

        const entries = this._getSegmentEntries(segmentId);
        const activeEntry = entries.find((entry) => !entry.stale && entry.startIndex === paragraph.startIndex);
        if (activeEntry) {
            return activeEntry.key;
        }

        const key = `paragraph-${generateRandomId(10)}`;
        entries.push({
            key,
            segmentId,
            startIndex: paragraph.startIndex,
            stale: false,
        });

        return key;
    }

    /**
     * Resolve a paragraph runtime key to its tracked paragraph break offset.
     * @param {string} segmentId The header/footer segment id, or an empty string for the main body.
     * @param {string} key The runtime paragraph key.
     * @returns {number} The tracked paragraph `startIndex`.
     * @throws {DocElementStaleError} If the key is missing or stale.
     */
    resolveParagraphStartIndex(segmentId: string, key: string): number {
        const entry = this._getSegmentEntries(segmentId).find((item) => item.key === key);
        if (!entry || entry.stale) {
            throw new DocElementStaleError();
        }

        return entry.startIndex;
    }

    /**
     * Resolve a paragraph runtime key against the current body.
     * @param {string} segmentId The header/footer segment id, or an empty string for the main body.
     * @param {string} key The runtime paragraph key.
     * @param {IDocumentBody} body The current document body snapshot.
     * @returns {number} The current paragraph index in `body.paragraphs`.
     * @throws {DocElementStaleError} If the tracked paragraph no longer exists.
     */
    syncParagraph(segmentId: string, key: string, body: IDocumentBody): number {
        const startIndex = this.resolveParagraphStartIndex(segmentId, key);
        const paragraphIndex = body.paragraphs?.findIndex((paragraph) => paragraph.startIndex === startIndex) ?? -1;

        if (paragraphIndex < 0) {
            this.markStale(segmentId, key);
            throw new DocElementStaleError();
        }

        return paragraphIndex;
    }

    /**
     * Mark a paragraph runtime key as stale.
     * @param {string} segmentId The header/footer segment id, or an empty string for the main body.
     * @param {string} key The runtime paragraph key.
     * @returns {void}
     */
    markStale(segmentId: string, key: string): void {
        const entry = this._getSegmentEntries(segmentId).find((item) => item.key === key);
        if (entry) {
            entry.stale = true;
        }
    }

    /**
     * Update tracked paragraph offsets before a facade text edit is applied.
     *
     * Paragraphs inside the deleted range are marked stale. Paragraphs after the
     * edited range move by the inserted length minus deleted length.
     *
     * @param {string} segmentId The header/footer segment id, or an empty string for the main body.
     * @param {number} startOffset The inclusive start offset of the edit.
     * @param {number} endOffset The exclusive end offset of the replaced range.
     * @param {number} insertLength The data stream length inserted by the edit.
     * @returns {void}
     */
    beforeTextEdit(segmentId: string, startOffset: number, endOffset: number, insertLength: number): void {
        const deleteLength = Math.max(0, endOffset - startOffset);
        const delta = insertLength - deleteLength;

        for (const entry of this._getSegmentEntries(segmentId)) {
            if (entry.stale) {
                continue;
            }

            if (entry.startIndex >= startOffset && entry.startIndex < endOffset) {
                entry.stale = true;
            } else if (entry.startIndex >= endOffset) {
                entry.startIndex += delta;
            }
        }
    }

    private _getSegmentEntries(segmentId: string): IParagraphRegistryEntry[] {
        const key = segmentId || '';
        let entries = this._paragraphsBySegment.get(key);
        if (!entries) {
            entries = [];
            this._paragraphsBySegment.set(key, entries);
        }

        return entries;
    }
}
