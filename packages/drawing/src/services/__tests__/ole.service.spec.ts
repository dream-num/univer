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

import {
    DesktopLogService,
    ILogService,
    Injector,
    IResourceManagerService,
    ResourceManagerService,
    UniverInstanceType,
} from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { OLE_RESOURCE_NAME } from '../../models/ole-model';
import { OleService } from '../ole.service';

describe('headless OLE resource lifecycle', () => {
    it.each([UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_DOC, UniverInstanceType.UNIVER_SLIDE])('preserves resources across save and reload for host %s without UI', (type) => {
        const injector = new Injector([
            [ILogService, { useClass: DesktopLogService }],
            [IResourceManagerService, { useClass: ResourceManagerService }],
            [OleService],
        ]);
        const service = injector.get(OleService);
        const resources = injector.get(IResourceManagerService);
        const json = JSON.stringify({ version: 1, files: {}, objects: {} });
        resources.loadResources('first-host', [{ name: OLE_RESOURCE_NAME, data: json }]);
        const saved = resources.getResources('first-host', type);
        expect(saved).toEqual([{ name: OLE_RESOURCE_NAME, data: json }]);
        resources.loadResources('reopened-host', saved);
        expect(service.getResource('reopened-host')).toEqual({ version: 1, files: {}, objects: {} });
        resources.unloadResources('first-host', type);
        expect(service.getResource('first-host')).toBeUndefined();
        expect(service.getResource('reopened-host')).toBeDefined();
        injector.dispose();
    });
});
