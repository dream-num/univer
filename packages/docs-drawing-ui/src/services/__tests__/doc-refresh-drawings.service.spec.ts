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
import { DocRefreshDrawingsService } from '../doc-refresh-drawings.service';

describe('DocRefreshDrawingsService', () => {
    it('emits the latest document skeleton refresh request', () => {
        const service = new DocRefreshDrawingsService();
        const values: unknown[] = [];
        const sub = service.refreshDrawings$.subscribe((value) => values.push(value));
        const skeleton = { id: 'skeleton-1' };

        service.refreshDrawings(skeleton as never);
        service.refreshDrawings(null);

        expect(values).toEqual([null, skeleton, null]);
        sub.unsubscribe();
    });
});
