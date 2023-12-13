/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ISnapshotPersistenceService, Workbook } from '@univerjs/core';
import { Disposable, IResourceManagerService, IUniverInstanceService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

export class LocalSnapshotService extends Disposable implements ISnapshotPersistenceService {
    constructor(
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initWorkBook();
    }

    private _initWorkBook() {
        this._univerInstanceService.sheetAdded$.subscribe((workbook) => this._initWorkbookFromSnapshot(workbook));
        const workbooks = this._univerInstanceService.getAllUniverSheetsInstance();
        workbooks.forEach((workbook) => {
            this._initWorkbookFromSnapshot(workbook);
        });
    }

    private _initWorkbookFromSnapshot(workbook: Workbook) {
        const unitId = workbook.getUnitId();
        const snapshot = workbook.getSnapshot();
        const resources = this._resourceManagerService.getAllResource(unitId);
        resources.forEach((resource) => {
            const resourceSnapshot = (snapshot.resources || []).find((item) => item.name === resource.resourceName);
            if (resourceSnapshot) {
                const model = resource.hook.parseJson(resourceSnapshot.data);
                resource.hook.onChange(unitId, model);
            }
        });
    }

    saveWorkbook(workbook: Workbook) {
        const snapshot = { ...workbook.getSnapshot() };
        const unitId = workbook.getUnitId();
        const resourceHooks = this._resourceManagerService.getAllResource(workbook.getUnitId());
        const resources = resourceHooks.map((resourceHook) => {
            const data = resourceHook.hook.toJson(unitId);
            return {
                name: resourceHook.resourceName,
                data,
            };
        });
        snapshot.resources = resources;
        return snapshot;
    }
}
