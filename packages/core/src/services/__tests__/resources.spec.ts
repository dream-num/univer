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

import type { IDocumentData } from '../../types/interfaces';
import type { Univer } from '../../univer';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY } from '../../common/const';
import { UnitModel, UniverInstanceType } from '../../common/unit';
import { IUniverInstanceService } from '../instance/instance.service';
import { IResourceLoaderService } from '../resource-loader/type';
import { IResourceManagerService } from '../resource-manager/type';
import { createTestBed } from './create-test-bed';

function createDocData(id: string, resources?: NonNullable<IDocumentData['resources']>): Partial<IDocumentData> {
    return {
        id,
        resources,
        body: {
            dataStream: 'Hello\r\n',
        },
        documentStyle: {
            pageSize: { width: 100, height: 100 },
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
        },
    };
}

interface ITestSlideData {
    id: string;
    name?: string;
    resources?: unknown;
}

class MockSlideUnit extends UnitModel<ITestSlideData> {
    override type = UniverInstanceType.UNIVER_SLIDE;
    override name$ = new BehaviorSubject('');
    private readonly _snapshot: ITestSlideData;

    constructor(snapshot: Partial<ITestSlideData> = {}) {
        super();
        this._snapshot = {
            id: 'slide-resource',
            name: '',
            ...snapshot,
        };
        this.name$.next(this._snapshot.name ?? '');
    }

    override getUnitId(): string {
        return this._snapshot.id;
    }

    override setName(name: string): void {
        this._snapshot.name = name;
        this.name$.next(name);
    }

    override getSnapshot(): ITestSlideData {
        return this._snapshot;
    }

    override getRev(): number {
        return 1;
    }

    override incrementRev(): void { }

    override setRev(): void { }
}

describe('Test resources service', () => {
    let univer: Univer;

    beforeEach(() => {
        univer?.dispose();
        const instance = createTestBed();
        univer = instance.univer;
    });

    it('test register resources', () => {
        const resourceManagerService = univer.__getInjector().get(IResourceManagerService);
        const resourceLoaderService = univer.__getInjector().get(IResourceLoaderService);
        const pluginName = 'SHEET_test_PLUGIN';
        const model: Record<string, unknown> = {};
        resourceManagerService.registerPluginResource({
            pluginName,
            businesses: [UniverInstanceType.UNIVER_SHEET],
            onLoad: () => { },
            onUnLoad: () => { },
            toJson: () => JSON.stringify(model),
            parseJson: (bytes) => JSON.parse(bytes),
        });
        const snapshot = resourceLoaderService.saveUnit('test');
        const resource = snapshot?.resources.find((item) => item.name === pluginName);
        expect(!!resource).toBeTruthy();
        expect(resource?.data).toBe(JSON.stringify(model));
        model.a = 123;
        const snapshotRev1 = resourceLoaderService.saveUnit('test');
        const resourceRev1 = snapshotRev1?.resources.find((item) => item.name === pluginName);
        expect(resourceRev1?.data).toBe(JSON.stringify(model));
    });

    it('test resources load', () => {
        const resourceManagerService = univer.__getInjector().get(IResourceManagerService);
        const pluginName = 'SHEET_test_PLUGIN';
        const model: Record<string, unknown> = {};
        let result = '';
        resourceManagerService.registerPluginResource({
            pluginName,
            businesses: [UniverInstanceType.UNIVER_SHEET],
            onLoad: (_unitId, resource) => { result = resource; },
            onUnLoad: () => { },
            toJson: () => JSON.stringify(model),
            parseJson: (bytes) => JSON.parse(bytes),
        });
        expect(result).toEqual({ a: 123 });
    });

    it('should load and unload workbook/doc resources through the real unit lifecycle', () => {
        const injector = univer.__getInjector();
        const resourceManagerService = injector.get(IResourceManagerService);
        const resourceLoaderService = injector.get(IResourceLoaderService);
        const univerInstanceService = injector.get(IUniverInstanceService);
        const loads: Array<[string, string]> = [];
        const unloads: string[] = [];

        resourceManagerService.registerPluginResource({
            pluginName: 'DOC_test_PLUGIN',
            businesses: [UniverInstanceType.UNIVER_DOC],
            onLoad: (unitId, model: { kind: string }) => loads.push([unitId, model.kind]),
            onUnLoad: (unitId) => unloads.push(unitId),
            toJson: (unitId) => JSON.stringify({ unitId, kind: 'saved' }),
            parseJson: (bytes) => JSON.parse(bytes),
        });

        const doc = univer.createUnit(UniverInstanceType.UNIVER_DOC, createDocData('doc-resource', [
            { name: 'DOC_test_PLUGIN', data: '{"kind":"doc"}' },
        ]));
        const internalDoc = univer.createUnit(UniverInstanceType.UNIVER_DOC, createDocData(DOCS_NORMAL_EDITOR_UNIT_ID_KEY, [
            { name: 'DOC_test_PLUGIN', data: '{"kind":"internal"}' },
        ]));

        expect(loads).toContainEqual(['doc-resource', 'doc']);
        expect(loads).not.toContainEqual([DOCS_NORMAL_EDITOR_UNIT_ID_KEY, 'internal']);
        expect(resourceLoaderService.saveUnit('missing-unit')).toBeNull();
        expect(resourceLoaderService.saveUnit<IDocumentData>('doc-resource')?.resources).toEqual([
            { name: 'DOC_test_PLUGIN', data: JSON.stringify({ unitId: 'doc-resource', kind: 'saved' }) },
        ]);

        expect(univerInstanceService.disposeUnit(doc.getUnitId())).toBe(true);
        expect(univerInstanceService.disposeUnit(internalDoc.getUnitId())).toBe(true);
        expect(unloads).toEqual(expect.arrayContaining(['doc-resource', DOCS_NORMAL_EDITOR_UNIT_ID_KEY]));
    });

    it('should load and unload slide resources through the real unit lifecycle', () => {
        const injector = univer.__getInjector();
        const resourceManagerService = injector.get(IResourceManagerService);
        const resourceLoaderService = injector.get(IResourceLoaderService);
        const univerInstanceService = injector.get(IUniverInstanceService);
        const pluginName = 'SLIDE_TEST_PLUGIN' as never;
        const loads: Array<[string, string]> = [];
        const unloads: string[] = [];

        univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_SLIDE, MockSlideUnit as never);
        resourceManagerService.registerPluginResource<{ kind: string }>({
            pluginName,
            businesses: [UniverInstanceType.UNIVER_SLIDE],
            onLoad: (unitId, resource) => loads.push([unitId, resource.kind]),
            onUnLoad: (unitId) => unloads.push(unitId),
            toJson: (unitId) => JSON.stringify({ kind: `saved:${unitId}` }),
            parseJson: (bytes) => JSON.parse(bytes),
        });

        const slide = univer.createUnit<ITestSlideData, MockSlideUnit>(UniverInstanceType.UNIVER_SLIDE, {
            id: 'slide-resource',
            resources: [
                { name: pluginName, data: '{"kind":"loaded"}' },
            ],
        });

        expect(loads).toContainEqual(['slide-resource', 'loaded']);
        expect(resourceLoaderService.saveUnit<ITestSlideData>('slide-resource')?.resources).toEqual([
            { name: pluginName, data: '{"kind":"saved:slide-resource"}' },
        ]);

        expect(univerInstanceService.disposeUnit(slide.getUnitId())).toBe(true);
        expect(unloads).toEqual(['slide-resource']);
    });

    it('should load resources for existing slide units when hooks register later', () => {
        const injector = univer.__getInjector();
        const resourceManagerService = injector.get(IResourceManagerService);
        const univerInstanceService = injector.get(IUniverInstanceService);
        const pluginName = 'SLIDE_LATE_PLUGIN' as never;
        const loads: Array<[string, string]> = [];

        univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_SLIDE, MockSlideUnit as never);
        univer.createUnit<ITestSlideData, MockSlideUnit>(UniverInstanceType.UNIVER_SLIDE, {
            id: 'slide-late-resource',
            resources: [
                { name: pluginName, data: '{"kind":"late"}' },
            ],
        });

        resourceManagerService.registerPluginResource<{ kind: string }>({
            pluginName,
            businesses: [UniverInstanceType.UNIVER_SLIDE],
            onLoad: (unitId, resource) => loads.push([unitId, resource.kind]),
            onUnLoad: () => undefined,
            toJson: () => '{}',
            parseJson: (bytes) => JSON.parse(bytes),
        });

        expect(loads).toEqual([['slide-late-resource', 'late']]);
    });

    it('should load object-shaped slide plugin resources through the unit lifecycle', () => {
        const injector = univer.__getInjector();
        const resourceManagerService = injector.get(IResourceManagerService);
        const univerInstanceService = injector.get(IUniverInstanceService);
        const pluginName = 'SLIDE_OBJECT_PLUGIN' as never;
        const loads: Array<[string, string]> = [];

        univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_SLIDE, MockSlideUnit as never);
        resourceManagerService.registerPluginResource<{ kind: string }>({
            pluginName,
            businesses: [UniverInstanceType.UNIVER_SLIDE],
            onLoad: (unitId, resource) => loads.push([unitId, resource.kind]),
            onUnLoad: () => undefined,
            toJson: () => '{}',
            parseJson: (bytes) => JSON.parse(bytes),
        });

        univer.createUnit<ITestSlideData, MockSlideUnit>(UniverInstanceType.UNIVER_SLIDE, {
            id: 'slide-object-resource',
            resources: {
                [pluginName]: {
                    data: '{"kind":"object"}',
                },
            },
        });

        expect(loads).toEqual([['slide-object-resource', 'object']]);
    });

    it('should ignore malformed persisted resource payloads when hooks are registered later', () => {
        const resourceManagerService = univer.__getInjector().get(IResourceManagerService);
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const onLoad = vi.fn();

        univer.createUnit(UniverInstanceType.UNIVER_DOC, createDocData('doc-bad-resource', [
            { name: 'DOC_BAD_PLUGIN', data: '{bad json}' },
        ]));

        resourceManagerService.registerPluginResource({
            pluginName: 'DOC_BAD_PLUGIN',
            businesses: [UniverInstanceType.UNIVER_DOC],
            onLoad,
            onUnLoad: () => undefined,
            toJson: () => '{}',
            parseJson: (bytes) => JSON.parse(bytes),
        });

        expect(onLoad).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith('Load Document{doc-bad-resource} Resources{DOC_BAD_PLUGIN} Data Error.');

        errorSpy.mockRestore();
    });
});
