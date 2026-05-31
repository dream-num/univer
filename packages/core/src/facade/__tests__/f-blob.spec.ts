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
import { Injector } from '../../common/di';
import { FBlob } from '../f-blob';

describe('FBlob', () => {
    it('should copy, transform and read blob data through the injector', async () => {
        const injector = new Injector();
        const blob = injector.createInstance(FBlob, new Blob(['hello'], { type: 'text/plain' }));

        const copy = blob.copyBlob();
        const asJson = blob.getAs('application/json');

        expect(copy).not.toBe(blob);
        await expect(copy.getDataAsString()).resolves.toBe('hello');
        expect(asJson.getContentType()).toBe('application/json');
        await expect(asJson.getDataAsString()).resolves.toBe('hello');
        await expect(asJson.getBytes()).resolves.toEqual(new TextEncoder().encode('hello'));
    });

    it('should support byte and string setters plus charset decoding and null guards', async () => {
        const injector = new Injector();
        const blob = injector.createInstance(FBlob, null);

        await expect(blob.getDataAsString()).resolves.toBe('');
        await expect(blob.getBytes()).rejects.toThrow('Blob is undefined or null.');

        blob.setBytes(new Uint8Array([0xE9]));
        await expect(blob.getDataAsString('iso-8859-1')).resolves.toBe('é');

        blob.setDataFromString('payload', 'text/custom');
        expect(blob.getContentType()).toBe('text/custom');

        blob.setContentType('text/changed');
        expect(blob.getContentType()).toBe('text/changed');
        await expect(blob.getDataAsString()).resolves.toBe('payload');
    });
});
