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
import { CloseRecordPanelOperation, OpenRecordPanelOperation } from './operation';

describe('action-recorder operations', () => {
    it('should toggle panel open/close', () => {
        const togglePanel = vi.fn();
        const accessor = {
            get: vi.fn(() => ({ togglePanel })),
        };

        expect(OpenRecordPanelOperation.handler(accessor as never, undefined as never)).toBe(true);
        expect(CloseRecordPanelOperation.handler(accessor as never, undefined as never)).toBe(true);
        expect(togglePanel).toHaveBeenCalledWith(true);
        expect(togglePanel).toHaveBeenCalledWith(false);
    });
});
