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

import type { UnitModel } from '@univerjs/core';
import type { IFindQuery } from '@univerjs/find-replace';
import { UniverInstanceType } from '@univerjs/core';
import { DocSkeletonManagerService, DocTextResolverService } from '@univerjs/docs';
import { createCommandTestBed } from '@univerjs/docs-ui/commands/commands/__tests__/create-command-test-bed';
import { IRenderManagerService } from '@univerjs/engine-render';
import { FindBy, FindDirection, FindScope } from '@univerjs/find-replace';
import { describe, expect, it, vi } from 'vitest';
import { DocsFindReplaceProvider } from '../docs-find-replace.provider';

const query: IFindQuery = {
    findString: 'cat',
    replaceRevealed: true,
    caseSensitive: false,
    matchesTheWholeWord: false,
    matchesTheWholeCell: false,
    findDirection: FindDirection.ROW,
    findScope: FindScope.SUBUNIT,
    findBy: FindBy.VALUE,
};

describe('DocsFindReplaceProvider', () => {
    it('supports Docs and creates one model for the current document', async () => {
        const testBed = createCommandTestBed(
            { id: 'test-doc', body: { dataStream: 'cat\r\n' }, documentStyle: {} },
            [[DocTextResolverService]]
        );
        const skeleton = testBed.get(IRenderManagerService).getRenderUnitById('test-doc')!.with(DocSkeletonManagerService);
        vi.spyOn(skeleton, 'getSkeleton').mockReturnValue(null as never);
        testBed.injector.add([DocsFindReplaceProvider]);
        const provider = testBed.injector.get(DocsFindReplaceProvider);

        expect(provider.isSupported(testBed.doc)).toBe(true);
        expect(provider.isSupported({ type: UniverInstanceType.UNIVER_SHEET } as UnitModel)).toBe(false);
        expect(provider.capabilities).toEqual({
            caseSensitive: true,
            matchesTheWholeWord: true,
            matchesTheWholeCell: false,
            findDirection: false,
            findScope: false,
            findBy: false,
        });
        await expect(provider.find(query)).resolves.toHaveLength(1);

        provider.dispose();
        testBed.univer.dispose();
    });
});
