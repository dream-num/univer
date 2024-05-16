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
import type { Workbook } from '../../sheets/workbook';
import type { IWorkbookData } from '../../types/interfaces';
import type { IResourceHook } from '../resource-manager/type';
import { IResourceManagerService } from '../resource-manager/type';
import { IUniverInstanceService } from '../instance/instance.service';
import { Disposable, toDisposable } from '../../shared/lifecycle';
import { UniverInstanceType } from '../../common/unit';
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
        const handleHookAdd = (hook: IResourceHook) => {
            hook.businesses.forEach((business) => {
                switch (business) {
                    case UniverInstanceType.UNRECOGNIZED:
                    case UniverInstanceType.UNIVER_UNKNOWN:
                    case UniverInstanceType.UNIVER_SLIDE:
                    case UniverInstanceType.UNIVER_DOC: {
                        // TODO@gggpound: wait to support.
                        break;
                    }
                    case UniverInstanceType.UNIVER_SHEET: {
                        this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET).forEach((workbook) => {
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
        };

        const allResourceHooks = this._resourceManagerService.getAllResourceHooks();
        allResourceHooks.forEach((hook) => {
            handleHookAdd(hook);
        });

        this.disposeWithMe(this._resourceManagerService.register$.subscribe((hook) => {
            handleHookAdd(hook);
        }));

        this.disposeWithMe(
            toDisposable(
                this._univerInstanceService.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
                    this._resourceManagerService.loadResources(workbook.getUnitId(), workbook.getSnapshot().resources);
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
                    this._resourceManagerService.unloadResources(workbook.getUnitId());
                })
            )
        );
    }

    saveWorkbook: (workbook: Workbook) => IWorkbookData = (workbook) => {
        const unitId = workbook.getUnitId();
        const resources = this._resourceManagerService.getResources(unitId) || [];
        const snapshot = workbook.getSnapshot();
        snapshot.resources = resources;
        return snapshot;
    };
}
