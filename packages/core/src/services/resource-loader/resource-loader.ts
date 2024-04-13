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

import { Inject } from '@wendellhu/redi';
import { UniverType } from '@univerjs/protocol';
import type { Workbook } from '../../sheets/workbook';
import type { IWorkbookData } from '../../types/interfaces';
import { IResourceManagerService } from '../resource-manager/type';
import { IUniverInstanceService } from '../instance/instance.service';
import { Disposable, toDisposable } from '../../shared/lifecycle';
import type { IResourceLoaderService } from './type';


export class ResourceLoaderService extends Disposable implements IResourceLoaderService {
    constructor(
        @Inject(IResourceManagerService) private readonly _resourceManagerService: IResourceManagerService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService


    ) {
        super();
        this._init();
    }

    private _init() {
        this.disposeWithMe(
            toDisposable(
                this._univerInstanceService.sheetAdded$.subscribe((workbook) => {
                    this._resourceManagerService.loadResources(workbook.getUnitId(), workbook.getSnapshot().resources);
                })
            )
        );
        this.disposeWithMe(
            toDisposable(
                this._univerInstanceService.sheetDisposed$.subscribe((workbook) => {
                    this._resourceManagerService.unloadResources(workbook.getUnitId());
                })
            )
        );
        const allResourceHooks = this._resourceManagerService.getAllResourceHooks();
        allResourceHooks.forEach((hook) => {
            hook.businesses.forEach((business) => {
                switch (business) {
                    case UniverType.UNRECOGNIZED:
                    case UniverType.UNIVER_UNKNOWN:
                    case UniverType.UNIVER_SLIDE:
                    case UniverType.UNIVER_DOC: {
                        // TODO@gggpound: wait to support.
                        break;
                    }
                    case UniverType.UNIVER_SHEET: {
                        this._univerInstanceService.getAllUniverSheetsInstance().forEach((workbook) => {
                            const snapshotResource = workbook.getSnapshot().resources || [];
                            const plugin = snapshotResource.find((r) => r.name === hook.pluginName);
                            if (plugin) {
                                try {
                                    const data = hook.parseJson(plugin.data);
                                    hook.onLoad(workbook.getUnitId(), data);
                                } catch (err) {
                                    console.error(`Load Workbook{${workbook.getUnitId()}} Resources{${hook.pluginName}} Data Error.`);
                                }
                            }
                        });
                    }
                }
            });
        });
    }

    saveWorkbook: (workbook: Workbook) => IWorkbookData = (workbook) => {
        const unitId = workbook.getUnitId();
        const resources = this._resourceManagerService.getResources(unitId) || [];
        const snapshot = workbook.getSnapshot();
        snapshot.resources = resources;
        return snapshot;
    };
}
