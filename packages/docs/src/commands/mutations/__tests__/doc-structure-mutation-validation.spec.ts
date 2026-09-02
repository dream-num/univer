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

import type { DocumentDataModel } from '@univerjs/core';
import { JSONX } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { validateDocStructureMutation } from '../doc-structure-mutation-validation';

describe('validateDocStructureMutation', () => {
    it('skips body structure scans for table metadata updates', () => {
        const getSelfOrHeaderFooterModel = vi.fn(() => {
            throw new Error('body structure should not be scanned');
        });
        const model = {
            getSnapshot: () => ({}),
            getSelfOrHeaderFooterModel,
        } as unknown as DocumentDataModel;
        const actions = JSONX.getInstance().replaceOp(
            ['tableSource', 'table-1', 'tableColumns', 0, 'size', 'width', 'v'],
            80,
            96
        );
        const undoActions = JSONX.getInstance().replaceOp(
            ['tableSource', 'table-1', 'tableColumns', 0, 'size', 'width', 'v'],
            96,
            80
        );

        // Regression: table resize on a 560-page document spent hundreds of milliseconds
        // validating an unchanged body before every visual update.
        expect(validateDocStructureMutation(model, '', actions, undoActions)).toBe(true);
        expect(getSelfOrHeaderFooterModel).not.toHaveBeenCalled();
    });
});
