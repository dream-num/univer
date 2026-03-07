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
import { Registry, RegistryAsMap } from '../registry';

describe('registry helpers', () => {
    it('should add unique items into Registry and delete existing ones', () => {
        const registry = Registry.create<string>();

        registry.add('a');
        registry.add('a');
        registry.add('b');

        expect(registry.getData()).toEqual(['a', 'b']);

        registry.delete('a');
        expect(registry.getData()).toEqual(['b']);
    });

    it('should add unique keyed items into RegistryAsMap and delete by key', () => {
        const registry = RegistryAsMap.create();

        registry.add('a', { value: 1 });
        registry.add('a', { value: 2 });
        registry.add('b', { value: 3 });

        expect(Array.from(registry.getData().entries())).toEqual([
            ['a', { value: 1 }],
            ['b', { value: 3 }],
        ]);

        registry.delete('a');
        expect(Array.from(registry.getData().entries())).toEqual([
            ['b', { value: 3 }],
        ]);
    });
});
