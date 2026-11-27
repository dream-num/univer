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
import { SerialTaskQueue } from '../serial-task-queue';

describe('SerialTaskQueue', () => {
    it('starts an idle task immediately and runs waiting tasks in order after a failure', async () => {
        const queue = new SerialTaskQueue();
        const started: string[] = [];
        let release!: () => void;
        const first = queue.run(() => {
            started.push('first');
            return new Promise<void>((resolve) => {
                release = resolve;
            });
        });
        const failure = new Error('failed task');
        const second = queue.run(() => {
            started.push('second');
            throw failure;
        });
        const third = queue.run(() => {
            started.push('third');
            return 3;
        });

        expect(started).toEqual(['first']);
        release();
        expect(await Promise.allSettled([first, second, third])).toEqual([
            { status: 'fulfilled', value: undefined },
            { status: 'rejected', reason: failure },
            { status: 'fulfilled', value: 3 },
        ]);
        expect(started).toEqual(['first', 'second', 'third']);
    });

    it('rejects overflow without discarding queued work and accepts new work once drained', async () => {
        const queue = new SerialTaskQueue();
        let processed = 0;
        const running = queue.run(() => undefined);
        const waiting = Array.from({ length: 1000 }, () => queue.run(() => {
            processed++;
        }));
        await expect(queue.run(() => -1)).rejects.toThrow('Too many pending tasks');

        await Promise.all([running, ...waiting]);
        await expect(queue.run(() => processed)).resolves.toBe(1000);
    });
});
