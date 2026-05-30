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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { codeToBlob } from '../blob';
import { isRealNum } from '../generate';
import { hashAlgorithm } from '../hash-algorithm';
import { awaitTime, delayAnimationFrame } from '../timer';

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('shared misc utils', () => {
    it('should convert code to a javascript blob url', async () => {
        const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL').mockImplementation(() => {
            return 'blob:univer-test';
        });

        const url = codeToBlob('export default 1;');

        expect(url).toBe('blob:univer-test');
        const firstCall = createObjectURLSpy.mock.calls[0];
        if (firstCall == null) {
            throw new Error('Expected createObjectURL to be called');
        }

        const [blobCandidate] = firstCall;
        if (!(blobCandidate instanceof Blob)) {
            throw new TypeError('Expected createObjectURL to receive a Blob');
        }

        const blob = blobCandidate;
        expect(blob.type).toBe('text/javascript');
        await expect(blob.text()).resolves.toBe('export default 1;');
    });

    it('should identify real numeric values across supported input types', () => {
        expect(isRealNum(null)).toBe(false);
        expect(isRealNum(undefined)).toBe(false);
        expect(isRealNum(false)).toBe(false);
        expect(isRealNum(Number.NaN)).toBe(false);
        expect(isRealNum(42)).toBe(true);
        expect(isRealNum(' 12e+3 ')).toBe(true);
        expect(isRealNum('   ')).toBe(false);
    });

    it('should produce stable unsigned hashes', () => {
        expect(hashAlgorithm('')).toBe(0);
        expect(hashAlgorithm('univer')).toBe(hashAlgorithm('univer'));
        expect(hashAlgorithm('univer')).not.toBe(hashAlgorithm('univer-core'));
        expect(hashAlgorithm('univer')).toBeGreaterThanOrEqual(0);
    });

    it('should resolve awaitTime after the requested delay', async () => {
        vi.useFakeTimers();

        let resolved = false;
        const pending = awaitTime(25).then(() => {
            resolved = true;
        });

        vi.advanceTimersByTime(24);
        expect(resolved).toBe(false);

        vi.advanceTimersByTime(1);
        await pending;
        expect(resolved).toBe(true);
    });

    it('should resolve delayAnimationFrame after the requested frame count', async () => {
        const callbacks: FrameRequestCallback[] = [];

        vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
            callbacks.push(callback);
            return callbacks.length;
        }));

        const pending = delayAnimationFrame(2);

        expect(callbacks).toHaveLength(1);
        callbacks.shift()!(16);
        expect(callbacks).toHaveLength(1);
        callbacks.shift()!(32);

        await expect(pending).resolves.toBeUndefined();
    });
});
