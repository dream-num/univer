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

/**
 * The top-level document body element types supported by the doc facade.
 */
export type FDocElementType = 'paragraph' | 'table' | 'blockRange' | 'customBlock';

const PARAGRAPH_REGISTRY_MIGRATION_ERROR = 'DocElementRegistry no longer tracks paragraph identity; use paragraphId.';

/**
 * Error thrown when a facade element key can no longer be resolved uniquely.
 *
 * A stale paragraph usually means the paragraph was deleted, or the document no
 * longer contains exactly one paragraph with the requested `paragraphId`.
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
 * @deprecated Paragraph facade identity is now resolved directly from persisted
 * `paragraphId` values. This class remains as a compatibility shell for callers
 * that constructed document facade internals directly.
 *
 * @hideconstructor
 */
export class DocElementRegistry {
    /**
     * @deprecated Paragraph facade identity is now the persisted `paragraphId`.
     * @throws {Error} Always throws; use `paragraph.paragraphId` instead.
     */
    getParagraphKey(_segmentId: string, _body: IDocumentBody, _paragraphIndex: number): string {
        throw new Error(PARAGRAPH_REGISTRY_MIGRATION_ERROR);
    }

    /**
     * @deprecated Paragraph facade identity is now the persisted `paragraphId`.
     * @throws {Error} Always throws; resolve paragraph handles by `paragraphId` instead.
     */
    resolveParagraphStartIndex(_segmentId: string, _key: string): number {
        throw new Error(PARAGRAPH_REGISTRY_MIGRATION_ERROR);
    }

    /**
     * @deprecated Paragraph facade identity is now the persisted `paragraphId`.
     * @throws {Error} Always throws; resolve paragraph handles by `paragraphId` instead.
     */
    syncParagraph(_segmentId: string, _key: string, _body: IDocumentBody): number {
        throw new Error(PARAGRAPH_REGISTRY_MIGRATION_ERROR);
    }

    /**
     * @deprecated Paragraph facade identity is now the persisted `paragraphId`.
     * @throws {Error} Always throws; stale state is detected from live `paragraphId` lookups.
     */
    markStale(_segmentId: string, _key: string): void {
        throw new Error(PARAGRAPH_REGISTRY_MIGRATION_ERROR);
    }

    /**
     * @deprecated Paragraph facade identity is now the persisted `paragraphId`.
     * @throws {Error} Always throws; text edits no longer need registry offset tracking.
     */
    beforeTextEdit(_segmentId: string, _startOffset: number, _endOffset: number, _insertLength: number): void {
        throw new Error(PARAGRAPH_REGISTRY_MIGRATION_ERROR);
    }
}
