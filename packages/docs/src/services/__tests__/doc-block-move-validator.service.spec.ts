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

import { describe, expect, it } from 'vitest';
import { DocBlockMoveValidatorService } from '../doc-block-move-validator.service';

const DOCUMENT_STYLE = {
    pageSize: {
        width: 594,
        height: 840,
    },
    marginTop: 72,
    marginBottom: 72,
    marginLeft: 90,
    marginRight: 90,
};

describe('DocBlockMoveValidatorService', () => {
    it('allows a move when no validator rejects it', () => {
        const service = new DocBlockMoveValidatorService();

        const first = service.registerValidator(() => true);
        service.registerValidator(() => true);

        expect(service.canMoveBlock({
            unitId: 'doc-1',
            sourceRange: {
                startOffset: 2,
                endOffset: 8,
            },
            targetOffset: 20,
        })).toBe(true);

        first.dispose();
        expect(service.canMoveBlock({
            unitId: 'doc-1',
            sourceRange: {
                startOffset: 2,
                endOffset: 8,
            },
            targetOffset: 20,
        })).toBe(true);
    });

    it('blocks a move when any validator rejects it and stops checking later validators', () => {
        const service = new DocBlockMoveValidatorService();
        let laterValidatorCalls = 0;

        service.registerValidator(() => false);
        service.registerValidator(() => {
            laterValidatorCalls++;
            return true;
        });

        expect(service.canMoveBlock({
            unitId: 'doc-1',
            sourceRange: {
                startOffset: 2,
                endOffset: 8,
            },
            targetOffset: 20,
        })).toBe(false);
        expect(laterValidatorCalls).toBe(0);
    });

    it('applies registered move transformers in order and supports disposal', () => {
        const service = new DocBlockMoveValidatorService();
        const first = service.registerTransformer((context) => ({
            nextDocumentData: {
                ...context.result.nextDocumentData,
                body: {
                    dataStream: `${context.result.nextDocumentData.body?.dataStream ?? ''}!`,
                },
            },
            movedRange: context.result.movedRange,
        }));
        service.registerTransformer((context) => ({
            nextDocumentData: context.result.nextDocumentData,
            movedRange: {
                startOffset: context.result.movedRange.startOffset + 1,
                endOffset: context.result.movedRange.endOffset + 1,
            },
        }));

        const transformed = service.transformMoveResult({
            unitId: 'doc-1',
            sourceRange: {
                startOffset: 0,
                endOffset: 1,
            },
            targetOffset: 2,
            previousDocumentData: {
                id: 'doc-1',
                body: {
                    dataStream: 'A',
                },
                documentStyle: DOCUMENT_STYLE,
            },
            result: {
                nextDocumentData: {
                    id: 'doc-1',
                    body: {
                        dataStream: 'B',
                    },
                    documentStyle: DOCUMENT_STYLE,
                },
                movedRange: {
                    startOffset: 0,
                    endOffset: 1,
                },
            },
        });

        expect(transformed.nextDocumentData.body?.dataStream).toBe('B!');
        expect(transformed.movedRange).toEqual({
            startOffset: 1,
            endOffset: 2,
        });

        first.dispose();
        const transformedAfterDispose = service.transformMoveResult({
            unitId: 'doc-1',
            sourceRange: {
                startOffset: 0,
                endOffset: 1,
            },
            targetOffset: 2,
            previousDocumentData: {
                id: 'doc-1',
                body: {
                    dataStream: 'A',
                },
                documentStyle: DOCUMENT_STYLE,
            },
            result: {
                nextDocumentData: {
                    id: 'doc-1',
                    body: {
                        dataStream: 'B',
                    },
                    documentStyle: DOCUMENT_STYLE,
                },
                movedRange: {
                    startOffset: 0,
                    endOffset: 1,
                },
            },
        });

        expect(transformedAfterDispose.nextDocumentData.body?.dataStream).toBe('B');
        expect(transformedAfterDispose.movedRange).toEqual({
            startOffset: 1,
            endOffset: 2,
        });
    });
});
