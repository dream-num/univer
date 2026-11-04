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

// @vitest-environment node

import { LogLevel, Univer } from '@univerjs/core';
import { IRPCChannelService } from '@univerjs/rpc';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { UniverRPCNodeMainPlugin } from '../plugin';

describe('UniverRPCNodeMainPlugin', () => {
    it('preserves formula table maps and typed values across a real child process', async () => {
        const univer = new Univer({ logLevel: LogLevel.SILENT });
        try {
            univer.registerPlugin(UniverRPCNodeMainPlugin, {
                workerSrc: fileURLToPath(new URL('./fixtures/echo-worker.cjs', import.meta.url)),
            });
            const channel = univer.__getInjector().get(IRPCChannelService).requestChannel('serialization');
            const value = {
                parentPid: process.pid,
                titleMap: new Map([['Amount', 0]]),
                columns: new Set(['Amount']),
                values: new Float64Array([0, -5, 1.5]),
                optional: undefined,
                plain: { name: 'Sales', rows: [1, 2, 3] },
            };
            await expect(channel.call('echo', [value])).resolves.toEqual({
                value,
                amountColumn: 0,
                distinctProcess: true,
            });
        } finally {
            univer.dispose();
        }
    }, 10_000);
});
