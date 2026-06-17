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

import { ICommandService, ILogService, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { IRemoteInstanceService, IRemoteSyncService, RemoteSyncPrimaryService, WebWorkerRemoteInstanceService } from '../remote-instance.service';

describe('remote-instance.service', () => {
    it('RemoteSyncPrimaryService should sync mutation with normalized options', async () => {
        const syncExecuteCommand = vi.fn(async () => true);
        class TestCommandService {
            syncExecuteCommand = syncExecuteCommand;
        }

        const injector = new Injector();
        injector.add([ICommandService, { useClass: TestCommandService as never }]);
        injector.add([IRemoteSyncService, { useClass: RemoteSyncPrimaryService }]);
        const service = injector.get(IRemoteSyncService);
        await expect(service.syncMutation(
            {
                mutationInfo: {
                    id: 'mutation.id',
                    params: { a: 1 },
                } as never,
            },
            {
                fromCollab: true,
                source: 'test',
            } as never
        )).resolves.toBe(true);

        expect(syncExecuteCommand).toHaveBeenCalledWith('mutation.id', { a: 1 }, {
            source: 'test',
            onlyLocal: true,
            fromSync: true,
        });

        await expect(service.syncMutation({
            mutationInfo: {
                id: 'mutation.id.2',
                params: { b: 2 },
            } as never,
        })).resolves.toBe(true);
        expect(syncExecuteCommand).toHaveBeenCalledWith('mutation.id.2', { b: 2 }, {
            onlyLocal: true,
            fromSync: true,
        });
    });

    it('WebWorkerRemoteInstanceService should cover create/sync/dispose branches', async () => {
        const createUnit = vi.fn();
        const disposeUnit = vi.fn(() => true);
        const syncExecuteCommand = vi.fn(() => true);
        const debug = vi.fn();

        class TestUniverInstanceService {
            createUnit = createUnit;
            disposeUnit = disposeUnit;
        }

        class TestCommandService {
            syncExecuteCommand = syncExecuteCommand;
        }

        class TestLogService {
            debug = debug;
        }

        const injector = new Injector();
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([ICommandService, { useClass: TestCommandService as never }]);
        injector.add([ILogService, { useClass: TestLogService as never }]);
        injector.add([IRemoteInstanceService, { useClass: WebWorkerRemoteInstanceService }]);
        const service = injector.get(IRemoteInstanceService);

        await expect(service.whenReady()).resolves.toBe(true);

        await expect(service.syncMutation(
            {
                mutationInfo: {
                    id: 'm1',
                    params: { x: 1 },
                } as never,
            },
            {
                fromCollab: true,
                source: 'sync',
            } as never
        )).resolves.toBe(true);
        expect(syncExecuteCommand).toHaveBeenCalledWith('m1', { x: 1 }, {
            source: 'sync',
            onlyLocal: true,
            fromSync: true,
        });

        await expect(service.syncMutation({
            mutationInfo: {
                id: 'm1b',
                params: { y: 2 },
            } as never,
        })).resolves.toBe(true);
        expect(syncExecuteCommand).toHaveBeenCalledWith('m1b', { y: 2 }, {
            onlyLocal: true,
            fromSync: true,
        });

        await expect(service.createInstance({
            unitID: 'sheet-1',
            type: UniverInstanceType.UNIVER_SHEET,
            snapshot: { id: 'snapshot' } as never,
        })).resolves.toBe(true);
        expect(createUnit).toHaveBeenCalledWith(UniverInstanceType.UNIVER_SHEET, { id: 'snapshot' });

        await expect(service.createInstance({
            unitID: 'base-1',
            type: UniverInstanceType.UNIVER_BASE,
            snapshot: { id: 'base-snapshot' } as never,
        })).resolves.toBe(true);
        expect(createUnit).toHaveBeenCalledWith(UniverInstanceType.UNIVER_BASE, { id: 'base-snapshot' });

        await expect(service.disposeInstance({ unitID: 'sheet-1' })).resolves.toBe(true);
        expect(disposeUnit).toHaveBeenCalledWith('sheet-1');
        expect(debug).toHaveBeenCalled();

        await expect(service.createInstance({
            unitID: 'doc-1',
            type: UniverInstanceType.UNIVER_DOC,
            snapshot: {} as never,
        })).rejects.toThrow(`[WebWorkerRemoteInstanceService]: cannot create replica for document type: ${UniverInstanceType.UNIVER_DOC}.`);

        createUnit.mockImplementationOnce(() => {
            throw new Error('create error');
        });
        await expect(service.createInstance({
            unitID: 'sheet-2',
            type: UniverInstanceType.UNIVER_SHEET,
            snapshot: {} as never,
        })).rejects.toThrow('create error');

        createUnit.mockImplementationOnce(() => {
            const nonError: unknown = 'bad-value';
            throw nonError;
        });
        await expect(service.createInstance({
            unitID: 'sheet-3',
            type: UniverInstanceType.UNIVER_SHEET,
            snapshot: {} as never,
        })).rejects.toThrow('bad-value');
    });
});
