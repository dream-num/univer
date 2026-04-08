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
import { ZIndexManager } from '../z-index-manager';

describe('ZIndexManager', () => {
    it('should set, get and remove index values', () => {
        const manager = new ZIndexManager();

        manager.setIndex('dialog', 1000);
        expect(manager.getIndex('dialog')).toBe(1000);

        manager.removeIndex('dialog');
        expect(manager.getIndex('dialog')).toBeUndefined();
    });

    it('should return maximum index from all values', () => {
        const manager = new ZIndexManager();

        manager.setIndex('dialog', 2000);
        manager.setIndex('sidebar', 1500);
        manager.setIndex('tooltip', 9999);

        expect(manager.getMaxIndex()).toBe(9999);
    });

    it('should return default minimum when no index exists', () => {
        const manager = new ZIndexManager();

        expect(manager.getMaxIndex()).toBe(-9999999);
    });
});
