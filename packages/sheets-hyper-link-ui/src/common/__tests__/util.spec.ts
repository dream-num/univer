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
import { hasProtocol, isEmail, serializeUrl } from '../util';

describe('hyper-link common util', () => {
    it('should detect protocols and email addresses', () => {
        expect(hasProtocol('https://univer.ai')).toBe(true);
        expect(hasProtocol('univer.ai')).toBe(false);
        expect(isEmail('test@example.com')).toBe(true);
        expect(isEmail('not-an-email')).toBe(false);
    });

    it('should normalize external URLs and keep same-page anchors compact', () => {
        Object.defineProperty(globalThis, 'location', {
            configurable: true,
            value: {
                hostname: 'localhost',
                port: '',
                protocol: 'http:',
                pathname: '/sheet',
            },
        });

        expect(serializeUrl('https://univer.ai')).toBe('https://univer.ai');
        expect(serializeUrl('not a legal link')).toBe('not a legal link');
    });
});
