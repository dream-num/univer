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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DocsRenameMutation } from '../docs-rename.mutation';

const unitId = 'rename-doc';

function createDocData(): IDocumentData {
    return {
        id: unitId,
        title: 'Original document',
        body: {
            dataStream: 'Hello\r\n',
        },
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

describe('DocsRenameMutation', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let univerInstanceService: IUniverInstanceService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        univer.createUnit(UniverInstanceType.UNIVER_DOC, createDocData());
        commandService = injector.get(ICommandService);
        commandService.registerCommand(DocsRenameMutation);
        univerInstanceService = injector.get(IUniverInstanceService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('renames the target document unit', async () => {
        const result = await commandService.executeCommand(DocsRenameMutation.id, {
            unitId,
            name: 'Quarterly notes',
        });

        expect(result).toBe(true);
        expect(univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC)?.getSnapshot().title).toBe('Quarterly notes');
    });

    it('does not rename when the target document does not exist', async () => {
        const result = await commandService.executeCommand(DocsRenameMutation.id, {
            unitId: 'missing-doc',
            name: 'Missing',
        });

        expect(result).toBe(false);
        expect(univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC)?.getSnapshot().title).toBe('Original document');
    });
});
