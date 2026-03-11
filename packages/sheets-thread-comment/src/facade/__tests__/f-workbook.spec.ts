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

import { describe, expect, it, vi } from 'vitest';
import { FWorkbookThreadCommentMixin } from '../f-workbook';

describe('FWorkbookThreadCommentMixin', () => {
    it('should lazily resolve the thread comment model and create workbook comment facades', async () => {
        const rootComment = { id: 'comment-1' };
        const deleteAsync = vi.fn(async () => true);
        const getUnit = vi.fn(() => [{ root: rootComment }]);
        const createInstance = vi.fn(() => ({ deleteAsync }));
        const get = vi.fn(() => ({ getUnit }));

        const instance = Object.create(FWorkbookThreadCommentMixin.prototype) as any;
        instance._injector = { get, createInstance };
        instance._workbook = { getUnitId: () => 'unit-1' };

        instance._initialize();

        expect(instance._threadCommentModel.getUnit('unit-1')).toEqual([{ root: rootComment }]);
        expect(instance.getComments()).toEqual([{ deleteAsync }]);
        expect(await instance.clearComments()).toBe(true);
        expect(deleteAsync).toHaveBeenCalledTimes(1);
        expect(createInstance).toHaveBeenCalledTimes(2);
    });
});
