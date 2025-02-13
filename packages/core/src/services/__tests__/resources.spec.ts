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

import { beforeEach, describe, expect, it } from 'vitest';
import { IResourceLoaderService } from '../resource-loader/type';
import { IResourceManagerService } from '../resource-manager/type';
import type { Univer } from '../../univer';
import { UniverInstanceType } from '../../common/unit';
import { createTestBed } from './index';

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
        const model: Record<string, any> = {};
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
        // update model
        model.a = 123;
        const snapshotRev1 = resourceLoaderService.saveUnit('test');
        const resourceRev1 = snapshotRev1?.resources.find((item) => item.name === pluginName);
        expect(resourceRev1?.data).toBe(JSON.stringify(model));
    });

    it('test resources load', () => {
        const resourceManagerService = univer.__getInjector().get(IResourceManagerService);
        const pluginName = 'SHEET_test_PLUGIN';
        const model: Record<string, any> = {};
        let result = '';
        resourceManagerService.registerPluginResource({
            pluginName,
            businesses: [UniverInstanceType.UNIVER_SHEET],
            onLoad: (v, r) => { result = r; },
            onUnLoad: () => { },
            toJson: () => JSON.stringify(model),
            parseJson: (bytes) => JSON.parse(bytes),
        });
        // The value in the snapshot
        expect(result).toEqual({ a: 123 });
    });
});
