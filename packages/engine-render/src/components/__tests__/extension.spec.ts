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

import type { IScale } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { ComponentExtension } from '../extension';

class TestExtension extends ComponentExtension<unknown, string, unknown> {
    constructor() {
        super();
        this.uKey = 'test-extension';
        this.type = 'test';
    }

    getParentScale(parentScale: IScale) {
        return this._getScale(parentScale);
    }
}

describe('ComponentExtension', () => {
    it('uses the larger parent scale for extension rendering math', () => {
        const extension = new TestExtension();

        expect(extension.getParentScale({ scaleX: 1.25, scaleY: 2 })).toBe(2);
        expect(extension.getParentScale({})).toBe(1);
    });

    it('clears transient render offsets and parent links on dispose', () => {
        const extension = new TestExtension();
        extension.parent = {} as never;
        extension.extensionOffset = {
            renderConfig: {},
        };

        extension.dispose();

        expect(extension.parent).toBeNull();
        expect(extension.extensionOffset).toEqual({});
    });
});
