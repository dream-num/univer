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

import type { Injector } from '@univerjs/core';
import type { IUniverRPCMainThreadConfig } from './controllers/config.schema';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import {
    PLUGIN_CONFIG_KEY_MAIN_THREAD,
    PLUGIN_CONFIG_KEY_WORKER_THREAD,
} from './controllers/config.schema';
import {
    UniverRPCMainThreadPlugin as ReExportedMainThreadPlugin,
    UniverRPCWorkerThreadPlugin as ReExportedWorkerThreadPlugin,
} from './index';
import { UniverRPCMainThreadPlugin, UniverRPCWorkerThreadPlugin } from './plugin';
import * as WebWorkerRpc from './services/rpc/implementations/web-worker-rpc.service';

class MockWorker {
    readonly postMessage = vi.fn();
    readonly addEventListener = vi.fn();
    readonly removeEventListener = vi.fn();
    readonly terminate = vi.fn();

    constructor(readonly url: string | URL) {}
}

describe('rpc plugin', () => {
    it('should export plugins and config constants', () => {
        expect(ReExportedMainThreadPlugin).toBe(UniverRPCMainThreadPlugin);
        expect(ReExportedWorkerThreadPlugin).toBe(UniverRPCWorkerThreadPlugin);
        expect(PLUGIN_CONFIG_KEY_MAIN_THREAD).toBe('rpc.main-thread.config');
        expect(PLUGIN_CONFIG_KEY_WORKER_THREAD).toBe('rpc.worker-thread.config');
    });

    it('main-thread plugin should configure, register deps, and dispose internal worker', () => {
        const createOnMainSpy = vi.spyOn(WebWorkerRpc, 'createWebWorkerMessagePortOnMain').mockImplementation(() => ({
            send: vi.fn(),
            onMessage: new Subject<unknown>().asObservable(),
        }));
        const add = vi.fn();
        const get = vi.fn(() => ({}));
        const configService = { setConfig: vi.fn() };

        vi.stubGlobal('Worker', MockWorker);

        const plugin = new UniverRPCMainThreadPlugin(
            { workerURL: 'worker-entry.js' },
            { add, get } as unknown as Injector,
            configService as never
        );

        plugin.onStarting();

        expect(configService.setConfig).toHaveBeenCalledWith(PLUGIN_CONFIG_KEY_MAIN_THREAD, { workerURL: 'worker-entry.js' });
        expect(add).toHaveBeenCalledTimes(3);
        expect(get).toHaveBeenCalled();
        expect(createOnMainSpy).toHaveBeenCalledTimes(1);

        const channelDependency = add.mock.calls
            .map((args) => args[0])
            .find((dep) => Array.isArray(dep) && typeof dep[1]?.useFactory === 'function');
        expect(channelDependency).toBeDefined();
        (channelDependency[1].useFactory as () => unknown)();

        plugin.dispose();
        const workerInstance = createOnMainSpy.mock.calls[0][0] as unknown as MockWorker;
        expect(workerInstance.terminate).toHaveBeenCalledTimes(1);
    });

    it('main-thread plugin should throw without workerURL and ignore external worker on dispose', () => {
        vi.stubGlobal('Worker', MockWorker);
        const configService = { setConfig: vi.fn() };
        const add = vi.fn();
        const get = vi.fn();
        const createOnMainSpy = vi.spyOn(WebWorkerRpc, 'createWebWorkerMessagePortOnMain').mockImplementation(() => ({
            send: vi.fn(),
            onMessage: new Subject<unknown>().asObservable(),
        }));

        const missingConfigPlugin = new UniverRPCMainThreadPlugin(
            undefined as never,
            { add, get } as unknown as Injector,
            configService as never
        );
        expect(() => missingConfigPlugin.onStarting()).toThrow(
            '[UniverRPCMainThreadPlugin]: The workerURL is required for the RPC main thread plugin.'
        );

        const externalWorker = new MockWorker('existing-worker.js');
        const workerConfigPlugin = new UniverRPCMainThreadPlugin(
            { workerURL: externalWorker as unknown as IUniverRPCMainThreadConfig['workerURL'] },
            { add, get: vi.fn(() => ({})) } as unknown as Injector,
            configService as never
        );
        workerConfigPlugin.onStarting();
        workerConfigPlugin.dispose();

        expect(createOnMainSpy).toHaveBeenCalledWith(externalWorker as unknown as Worker);
        expect(externalWorker.terminate).not.toHaveBeenCalled();
    });

    it('worker-thread plugin should configure and register deps', () => {
        const createOnWorkerSpy = vi.spyOn(WebWorkerRpc, 'createWebWorkerMessagePortOnWorker').mockImplementation(() => ({
            send: vi.fn(),
            onMessage: new Subject<unknown>().asObservable(),
        }));
        const add = vi.fn();
        const get = vi.fn(() => ({}));
        const configService = { setConfig: vi.fn() };

        const plugin = new UniverRPCWorkerThreadPlugin(
            undefined as never,
            { add, get } as unknown as Injector,
            configService as never
        );
        plugin.onStarting();

        expect(configService.setConfig).toHaveBeenCalledWith(PLUGIN_CONFIG_KEY_WORKER_THREAD, {});
        expect(add).toHaveBeenCalledTimes(3);
        expect(get).toHaveBeenCalledTimes(1);

        const channelDependency = add.mock.calls
            .map((args) => args[0])
            .find((dep) => Array.isArray(dep) && typeof dep[1]?.useFactory === 'function');
        expect(channelDependency).toBeDefined();
        (channelDependency[1].useFactory as () => unknown)();
        expect(createOnWorkerSpy).toHaveBeenCalledTimes(1);
    });
});
