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

/* eslint-disable import/first */

import type { Injector } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';

const mocked = vi.hoisted(() => {
    const childEventHandlers = new Map<string, Set<(payload: unknown) => void>>();
    const processEventHandlers = new Map<string, Set<(payload: unknown) => void>>();

    const child = {
        send: vi.fn(),
        kill: vi.fn(),
        on: vi.fn((event: string, handler: (payload: unknown) => void) => {
            const bucket = childEventHandlers.get(event) || new Set<(payload: unknown) => void>();
            bucket.add(handler);
            childEventHandlers.set(event, bucket);
            return child;
        }),
        off: vi.fn((event: string, handler: (payload: unknown) => void) => {
            childEventHandlers.get(event)?.delete(handler);
            return child;
        }),
    };

    const processMock = {
        send: vi.fn(),
        on: vi.fn((event: string, handler: (payload: unknown) => void) => {
            const bucket = processEventHandlers.get(event) || new Set<(payload: unknown) => void>();
            bucket.add(handler);
            processEventHandlers.set(event, bucket);
            return processMock;
        }),
        off: vi.fn((event: string, handler: (payload: unknown) => void) => {
            processEventHandlers.get(event)?.delete(handler);
            return processMock;
        }),
    };

    return {
        child,
        childEventHandlers,
        processMock,
        processEventHandlers,
    };
});

vi.mock('rxjs', async () => {
    const actual = await vi.importActual<typeof import('rxjs')>('rxjs');
    return {
        ...actual,
        shareReplay: () => (source: unknown) => source,
    };
});

vi.mock('node:child_process', () => ({
    fork: vi.fn(() => mocked.child),
    default: {
        fork: vi.fn(() => mocked.child),
    },
}));

vi.mock('node:process', () => ({
    default: mocked.processMock,
}));

import {
    PLUGIN_CONFIG_KEY_MAIN_THREAD,
    PLUGIN_CONFIG_KEY_WORKER_THREAD,
} from './controllers/config.schema';
import { UniverRPCNodeMainPlugin as ReExportedMainPlugin, UniverRPCNodeWorkerPlugin as ReExportedWorkerPlugin } from './index';
import { UniverRPCNodeMainPlugin, UniverRPCNodeWorkerPlugin } from './plugin';

describe('rpc-node plugin', () => {
    it('should export plugins and config keys', () => {
        expect(ReExportedMainPlugin).toBe(UniverRPCNodeMainPlugin);
        expect(ReExportedWorkerPlugin).toBe(UniverRPCNodeWorkerPlugin);
        expect(PLUGIN_CONFIG_KEY_MAIN_THREAD).toBe('rpc-node.main-thread.config');
        expect(PLUGIN_CONFIG_KEY_WORKER_THREAD).toBe('rpc-node.worker-thread.config');
    });

    it('main plugin should throw when workerSrc is missing', () => {
        const plugin = new UniverRPCNodeMainPlugin(
            undefined as never,
            { add: vi.fn(), get: vi.fn() } as unknown as Injector,
            { setConfig: vi.fn() } as never
        );
        expect(() => plugin.onStarting()).toThrow(
            '[UniverRPCNodeMainPlugin] workerSrc is required for UniverRPCNodeMainPlugin'
        );
        expect(() => plugin.dispose()).not.toThrow();
    });

    it('main plugin should register deps, handle child events, and dispose child process', () => {
        mocked.child.send.mockClear();
        mocked.child.kill.mockClear();
        mocked.child.on.mockClear();
        mocked.child.off.mockClear();
        mocked.childEventHandlers.clear();

        const add = vi.fn();
        const log = vi.fn();
        const error = vi.fn();
        const get = vi.fn();
        get.mockImplementationOnce(() => ({ log, error }));
        get.mockImplementation(() => ({}));
        const setConfig = vi.fn();
        const plugin = new UniverRPCNodeMainPlugin(
            { workerSrc: '/tmp/fake-worker.js' },
            { add, get } as unknown as Injector,
            { setConfig } as never
        );

        plugin.onStarting();
        expect(setConfig).toHaveBeenCalledWith(PLUGIN_CONFIG_KEY_MAIN_THREAD, { workerSrc: '/tmp/fake-worker.js' });
        expect(add).toHaveBeenCalledTimes(3);
        expect(get).toHaveBeenCalled();

        const spawnHandler = [...(mocked.childEventHandlers.get('spawn') || [])][0];
        const errorHandler = [...(mocked.childEventHandlers.get('error') || [])][0];
        spawnHandler?.({});
        errorHandler?.(new Error('child error'));
        expect(log).toHaveBeenCalledWith('Child computing process spawned!');
        expect(error).toHaveBeenCalledWith(expect.any(Error));

        const channelDependency = add.mock.calls
            .map((args) => args[0])
            .find((dep) => Array.isArray(dep) && typeof dep[1]?.useFactory === 'function');
        expect(channelDependency).toBeDefined();
        const channelService = (channelDependency[1].useFactory as () => { dispose(): void })();
        expect(mocked.child.send).toHaveBeenCalled();

        const messageHandler = [...(mocked.childEventHandlers.get('message') || [])][0];
        messageHandler?.({ type: 'child-message' });

        channelService.dispose();
        expect(mocked.child.off).toHaveBeenCalled();

        plugin.dispose();
        expect(mocked.child.kill).toHaveBeenCalledTimes(1);
    });

    it('main plugin dispose should catch kill errors', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        mocked.child.kill.mockImplementationOnce(() => {
            throw new Error('kill failed');
        });

        const plugin = new UniverRPCNodeMainPlugin(
            { workerSrc: '/tmp/kill-error.js' },
            {
                add: vi.fn(),
                get: vi.fn()
                    .mockImplementationOnce(() => ({ log: vi.fn(), error: vi.fn() }))
                    .mockImplementation(() => ({})),
            } as unknown as Injector,
            { setConfig: vi.fn() } as never
        );
        plugin.onStarting();
        plugin.dispose();

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to kill child process:', expect.any(Error));
    });

    it('worker plugin should register deps and create worker message protocol', () => {
        mocked.processMock.send.mockClear();
        mocked.processMock.on.mockClear();
        mocked.processMock.off.mockClear();
        mocked.processEventHandlers.clear();

        const add = vi.fn();
        const get = vi.fn(() => ({}));
        const setConfig = vi.fn();
        const plugin = new UniverRPCNodeWorkerPlugin(
            undefined as never,
            { add, get } as unknown as Injector,
            { setConfig } as never
        );

        plugin.onStarting();
        expect(setConfig).toHaveBeenCalledWith(PLUGIN_CONFIG_KEY_WORKER_THREAD, {});
        expect(add).toHaveBeenCalledTimes(3);
        expect(get).toHaveBeenCalledTimes(1);

        const channelDependency = add.mock.calls
            .map((args) => args[0])
            .find((dep) => Array.isArray(dep) && typeof dep[1]?.useFactory === 'function');
        expect(channelDependency).toBeDefined();
        const channelService = (channelDependency[1].useFactory as () => { dispose(): void })();
        expect(mocked.processMock.send).toHaveBeenCalled();

        const messageHandler = [...(mocked.processEventHandlers.get('message') || [])][0];
        messageHandler?.({ type: 'process-message' });

        channelService.dispose();
        expect(mocked.processMock.off).toHaveBeenCalled();
    });
});
