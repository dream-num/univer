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

import type { ICommandService, Injector, IUniverInstanceService } from '@univerjs/core';
import type { IRPCChannelService } from '../../../services/rpc/channel.service';
import type { IChannel } from '../../../services/rpc/rpc.service';
import { CommandType, UniverInstanceType } from '@univerjs/core';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { IRemoteInstanceService, IRemoteSyncService, RemoteInstanceServiceName, RemoteSyncServiceName } from '../../../services/remote-instance/remote-instance.service';
import { DataSyncPrimaryController } from '../data-sync-primary.controller';
import { DataSyncReplicaController } from '../data-sync-replica.controller';

interface IDependencyFactory {
    useFactory: () => unknown;
}

function buildRemoteChannel(target: Record<string, (...args: unknown[]) => unknown>): IChannel {
    return {
        call: (async (method: string, args?: unknown[]) => {
            const fn = target[method];
            if (!fn) {
                throw new Error(`missing method: ${method}`);
            }
            return args ? fn(...args) : fn();
        }) as IChannel['call'],
        subscribe: (() => new Subject<unknown>().asObservable()) as IChannel['subscribe'],
    };
}

describe('data-sync controllers', () => {
    it('DataSyncPrimaryController should sync add/dispose/mutation with branch guards', async () => {
        const added$ = new Subject<{ getUnitId(): string; getSnapshot(): unknown }>();
        const disposed$ = new Subject<{ getUnitId(): string }>();
        let commandCallback: ((commandInfo: unknown, options?: unknown) => void) | undefined;
        const dependencies: Array<[unknown, IDependencyFactory]> = [];
        let remoteProxy: unknown;

        const remoteInstanceImpl = {
            createInstance: vi.fn(async () => true),
            disposeInstance: vi.fn(async () => true),
            syncMutation: vi.fn(async () => true),
        };

        const remoteChannel = buildRemoteChannel(remoteInstanceImpl);

        const rpcChannelService: IRPCChannelService = {
            requestChannel: vi.fn(() => remoteChannel),
            registerChannel: vi.fn(),
        };

        const injector = {
            add: vi.fn((dependency: [unknown, IDependencyFactory]) => {
                dependencies.push(dependency);
            }),
            get: vi.fn((token: unknown) => {
                if (token === IRemoteInstanceService) {
                    if (!remoteProxy) {
                        const record = dependencies.find(([depToken]) => depToken === IRemoteInstanceService);
                        remoteProxy = record?.[1].useFactory();
                    }
                    return remoteProxy;
                }
                return undefined;
            }),
        } as unknown as Injector;

        const commandService = {
            onCommandExecuted: vi.fn((callback: (commandInfo: unknown, options?: unknown) => void) => {
                commandCallback = callback;
                return { dispose: vi.fn() };
            }),
        } as unknown as ICommandService;

        const univerInstanceService = {
            getTypeOfUnitAdded$: vi.fn(() => added$.asObservable()),
            getTypeOfUnitDisposed$: vi.fn(() => disposed$.asObservable()),
        } as unknown as IUniverInstanceService;

        const remoteSyncService = {
            syncMutation: vi.fn(async () => true),
        };

        const controller = new DataSyncPrimaryController(
            injector,
            commandService,
            univerInstanceService,
            rpcChannelService,
            remoteSyncService as never
        );

        expect(rpcChannelService.registerChannel).toHaveBeenCalledWith(RemoteSyncServiceName, expect.any(Object));
        expect(rpcChannelService.requestChannel).toHaveBeenCalledWith(RemoteInstanceServiceName);

        const workbook = {
            getUnitId: () => 'unit-1',
            getSnapshot: () => ({ snapshot: true }),
        };
        added$.next(workbook);
        await Promise.resolve();
        expect(remoteInstanceImpl.createInstance).toHaveBeenCalledWith({
            unitID: 'unit-1',
            type: UniverInstanceType.UNIVER_SHEET,
            snapshot: { snapshot: true },
        });

        disposed$.next({ getUnitId: () => 'unit-1' });
        await Promise.resolve();
        expect(remoteInstanceImpl.disposeInstance).toHaveBeenCalledWith({ unitID: 'unit-1' });

        controller.registerSyncingMutations({ id: 'm-sync' } as never);

        const unit2Disposable = controller.syncUnit('unit-2');

        commandCallback?.({
            id: 'm-sync',
            type: CommandType.MUTATION,
            params: { unitId: 'unit-2' },
        }, {});
        await Promise.resolve();
        expect(remoteInstanceImpl.syncMutation).toHaveBeenCalledTimes(1);

        commandCallback?.({
            id: 'm-sync',
            type: CommandType.COMMAND,
            params: { unitId: 'unit-2' },
        }, {});
        commandCallback?.({
            id: 'm-sync',
            type: CommandType.MUTATION,
            params: { unitId: 'other' },
        }, {});
        commandCallback?.({
            id: 'm-sync',
            type: CommandType.MUTATION,
            params: { unitId: 'unit-2' },
        }, { fromSync: true });
        commandCallback?.({
            id: 'm-ignore',
            type: CommandType.MUTATION,
            params: { unitId: 'unit-2' },
        }, {});
        commandCallback?.({
            id: 'm-sync',
            type: CommandType.MUTATION,
            params: {},
        }, {});
        await Promise.resolve();

        expect(remoteInstanceImpl.syncMutation).toHaveBeenCalledTimes(2);

        unit2Disposable.dispose();
        commandCallback?.({
            id: 'm-sync',
            type: CommandType.MUTATION,
            params: { unitId: 'unit-2' },
        }, {});
        await Promise.resolve();
        expect(remoteInstanceImpl.syncMutation).toHaveBeenCalledTimes(2);

        controller.dispose();
    });

    it('DataSyncReplicaController should sync only mutation not fromSync', async () => {
        let commandCallback: ((commandInfo: unknown, options?: unknown) => void) | undefined;
        const dependencies: Array<[unknown, IDependencyFactory]> = [];
        let remoteSyncProxy: unknown;

        const remoteSyncImpl = {
            syncMutation: vi.fn(async () => true),
        };

        const remoteChannel = buildRemoteChannel(remoteSyncImpl);

        const rpcChannelService: IRPCChannelService = {
            requestChannel: vi.fn(() => remoteChannel),
            registerChannel: vi.fn(),
        };

        const injector = {
            add: vi.fn((dependency: [unknown, IDependencyFactory]) => {
                dependencies.push(dependency);
            }),
            get: vi.fn((token: unknown) => {
                if (token === IRemoteSyncService) {
                    if (!remoteSyncProxy) {
                        const record = dependencies.find(([depToken]) => depToken === IRemoteSyncService);
                        remoteSyncProxy = record?.[1].useFactory();
                    }
                    return remoteSyncProxy;
                }
                return undefined;
            }),
        } as unknown as Injector;

        const remoteInstanceService = {
            createInstance: vi.fn(async () => true),
            disposeInstance: vi.fn(async () => true),
            syncMutation: vi.fn(async () => true),
            whenReady: vi.fn(async () => true),
        };

        const commandService = {
            onCommandExecuted: vi.fn((callback: (commandInfo: unknown, options?: unknown) => void) => {
                commandCallback = callback;
                return { dispose: vi.fn() };
            }),
        } as unknown as ICommandService;

        const controller = new DataSyncReplicaController(
            injector,
            remoteInstanceService as never,
            commandService,
            rpcChannelService
        );

        expect(rpcChannelService.registerChannel).toHaveBeenCalledWith(RemoteInstanceServiceName, expect.any(Object));
        expect(rpcChannelService.requestChannel).toHaveBeenCalledWith(RemoteSyncServiceName);

        commandCallback?.({
            id: 'm1',
            type: CommandType.MUTATION,
            params: { a: 1 },
        }, {});
        commandCallback?.({
            id: 'm2',
            type: CommandType.MUTATION,
            params: { a: 2 },
        }, { fromSync: true });
        commandCallback?.({
            id: 'c1',
            type: CommandType.COMMAND,
            params: { a: 3 },
        }, {});

        await Promise.resolve();
        expect(remoteSyncImpl.syncMutation).toHaveBeenCalledTimes(1);
        expect(remoteSyncImpl.syncMutation).toHaveBeenCalledWith({
            mutationInfo: {
                id: 'm1',
                type: CommandType.MUTATION,
                params: { a: 1 },
            },
        }, {});

        controller.dispose();
    });
});
