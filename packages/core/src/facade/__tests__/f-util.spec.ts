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
import { numfmt, Rectangle, Tools } from '../../index';
import { FUtil } from '../f-util';

describe('FUtil', () => {
    it('should expose singleton utility accessors and support extension', () => {
        class FeatureSource {
            static label = 'feature-source';

            speak(this: { prefix: string }, value: string) {
                return `${this.prefix}:${value}`;
            }
        }

        class ExtendedUtil extends FUtil {
            prefix = 'util';
        }

        FUtil._instance = null;
        const first = FUtil.get();
        const second = FUtil.get();

        expect(first).toBe(second);
        expect(first.rectangle).toBe(Rectangle);
        expect(first.numfmt).toBe(numfmt);
        expect(first.tools).toBe(Tools);

        ExtendedUtil.extend(FeatureSource);

        const ExtendedUtilWithStatics = ExtendedUtil as typeof ExtendedUtil & { label: string };
        const extended = new ExtendedUtil() as ExtendedUtil & { speak(value: string): string };
        expect(extended.speak('hello')).toBe('util:hello');
        expect(ExtendedUtilWithStatics.label).toBe('feature-source');
    });
});
