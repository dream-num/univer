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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UniverInstanceType } from '../../../common/unit';
import { DesktopLogService, LogLevel } from '../../log/log.service';
import { ResourceManagerService } from '../resource-manager.service';

describe('ResourceManagerService', () => {
    let logService: DesktopLogService;
    let service: ResourceManagerService;

    beforeEach(() => {
        logService = new DesktopLogService();
        logService.setLogLevel(LogLevel.SILENT);
        service = new ResourceManagerService(logService);
    });

    afterEach(() => {
        service.dispose();
        logService.dispose();
    });

    it('should register hooks, emit register event and filter resources by type', () => {
        const registered: string[] = [];
        service.register$.subscribe((hook) => registered.push(hook.pluginName));

        service.registerPluginResource({
            pluginName: 'SHEET_TEST_PLUGIN',
            businesses: [UniverInstanceType.UNIVER_SHEET],
            onLoad: () => {},
            onUnLoad: () => {},
            toJson: (unitId) => JSON.stringify({ unitId }),
            parseJson: JSON.parse,
        });
        service.registerPluginResource({
            pluginName: 'DOC_TEST_PLUGIN',
            businesses: [UniverInstanceType.UNIVER_DOC],
            onLoad: () => {},
            onUnLoad: () => {},
            toJson: () => 'doc',
            parseJson: JSON.parse,
        });

        expect(registered).toEqual(['SHEET_TEST_PLUGIN', 'DOC_TEST_PLUGIN']);
        expect(service.getAllResourceHooks()).toHaveLength(2);
        expect(service.getResources('u1')).toEqual([
            { name: 'SHEET_TEST_PLUGIN', data: '{"unitId":"u1"}' },
            { name: 'DOC_TEST_PLUGIN', data: 'doc' },
        ]);
        expect(service.getResourcesByType('u1', UniverInstanceType.UNIVER_DOC)).toEqual([
            { name: 'DOC_TEST_PLUGIN', data: 'doc' },
        ]);
    });

    it('should unregister resources through returned disposable and explicit disposal', () => {
        const disposable = service.registerPluginResource({
            pluginName: 'SHEET_TEST_PLUGIN',
            businesses: [UniverInstanceType.UNIVER_SHEET],
            onLoad: () => {},
            onUnLoad: () => {},
            toJson: () => 'sheet',
            parseJson: JSON.parse,
        });

        expect(() => service.registerPluginResource({
            pluginName: 'SHEET_TEST_PLUGIN',
            businesses: [UniverInstanceType.UNIVER_SHEET],
            onLoad: () => {},
            onUnLoad: () => {},
            toJson: () => 'sheet',
            parseJson: JSON.parse,
        })).toThrowError(/registered/);

        disposable.dispose();
        expect(service.getAllResourceHooks()).toHaveLength(0);

        service.registerPluginResource({
            pluginName: 'DOC_TEST_PLUGIN',
            businesses: [UniverInstanceType.UNIVER_DOC],
            onLoad: () => {},
            onUnLoad: () => {},
            toJson: () => 'doc',
            parseJson: JSON.parse,
        });
        service.disposePluginResource('DOC_TEST_PLUGIN');
        expect(service.getAllResourceHooks()).toHaveLength(0);
    });

    it('should load, unload and log parsing errors', () => {
        const loaded: unknown[] = [];
        const unloaded: string[] = [];
        const errorSpy = vi.spyOn(logService, 'error');

        service.registerPluginResource({
            pluginName: 'SHEET_TEST_PLUGIN',
            businesses: [UniverInstanceType.UNIVER_SHEET],
            onLoad: (_unitId, resource) => loaded.push(resource),
            onUnLoad: (unitId) => unloaded.push(unitId),
            toJson: () => 'sheet',
            parseJson: JSON.parse,
        });
        service.registerPluginResource({
            pluginName: 'DOC_TEST_PLUGIN',
            businesses: [UniverInstanceType.UNIVER_DOC],
            onLoad: () => {},
            onUnLoad: () => {},
            toJson: () => 'doc',
            parseJson: () => {
                throw new Error('bad json');
            },
        });

        service.loadResources('unit-1', [
            { name: 'SHEET_TEST_PLUGIN', data: '{"ok":true}' },
            { name: 'DOC_TEST_PLUGIN', data: 'boom' },
        ]);
        service.unloadResources('unit-1', UniverInstanceType.UNIVER_SHEET);

        expect(loaded).toEqual([{ ok: true }]);
        expect(unloaded).toEqual(['unit-1']);
        expect(errorSpy).toHaveBeenCalled();
    });
});
