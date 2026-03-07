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

import type { DocumentDataModel, ICommandService, IDocumentData } from '@univerjs/core';
import { InsertCommand } from '@univerjs/docs-ui';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FDocument } from '../f-document';

describe('Test FDocument', () => {
    let commandService: Pick<ICommandService, 'executeCommand'>;
    let resourceManagerService: { getResourcesByType: ReturnType<typeof vi.fn> };
    let univerInstanceService: { focusUnit: ReturnType<typeof vi.fn> };
    let renderManagerService: { getRenderById: ReturnType<typeof vi.fn> };
    let documentDataModel: Pick<DocumentDataModel, 'getUnitId' | 'getSnapshot'>;
    let document: FDocument;

    beforeEach(() => {
        commandService = {
            executeCommand: vi.fn().mockResolvedValue(true),
        };
        resourceManagerService = {
            getResourcesByType: vi.fn(() => []),
        };
        univerInstanceService = {
            focusUnit: vi.fn(),
        };
        renderManagerService = {
            getRenderById: vi.fn(),
        };
        documentDataModel = {
            getUnitId: () => 'test',
            getSnapshot: () => ({
                id: 'test',
                title: 'Test Document',
                documentStyle: {},
                body: {
                    dataStream: 'Hello,\r\n',
                },
            }),
        };
        document = new FDocument(
            documentDataModel as DocumentDataModel,
            {} as never,
            univerInstanceService as never,
            commandService as ICommandService,
            resourceManagerService as never,
            renderManagerService as never
        );
    });

    it('appends text by executing the insert command at the tail of the body', async () => {
        await expect(document.appendText('Univer')).resolves.toBe(true);

        expect(commandService.executeCommand).toHaveBeenCalledWith(InsertCommand.id, {
            unitId: 'test',
            body: {
                dataStream: 'Univer',
            },
            range: {
                startOffset: 6,
                endOffset: 6,
                collapsed: true,
                segmentId: '',
            },
            segmentId: '',
        });
    });

    it('throws when appending text to a document without a body', () => {
        const emptyDocument = new FDocument(
            {
                getUnitId: () => 'test',
                getSnapshot: () => ({ id: 'test' } as IDocumentData),
            } as DocumentDataModel,
            {} as never,
            univerInstanceService as never,
            commandService as ICommandService,
            resourceManagerService as never,
            renderManagerService as never
        );

        expect(() => emptyDocument.appendText('Univer')).toThrowError('The document body is empty');
    });

    it('includes current document resources in snapshots', () => {
        resourceManagerService.getResourcesByType.mockReturnValue([
            {
                name: 'test-resource',
                data: '{"value":1}',
            },
        ]);

        expect(document.getSnapshot().resources).toEqual([
            {
                name: 'test-resource',
                data: '{"value":1}',
            },
        ]);
    });
});
