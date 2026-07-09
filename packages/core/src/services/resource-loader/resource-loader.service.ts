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

import type { UnitModel } from '../../common/unit';
import type { DocumentDataModel } from '../../docs';
import type { Workbook } from '../../sheets/workbook';
import type { IResourceHook, IResources } from '../resource-manager/type';
import type { IResourceLoaderService } from './type';
import { isInternalEditorID } from '../../common/const';
import { Inject } from '../../common/di';
import { UniverInstanceType } from '../../common/unit';
import { Tools } from '../../shared';
import { Disposable } from '../../shared/lifecycle';
import { IUniverInstanceService } from '../instance/instance.service';
import { IResourceManagerService } from '../resource-manager/type';

export class ResourceLoaderService extends Disposable implements IResourceLoaderService {
    constructor(
        @Inject(IResourceManagerService) private readonly _resourceManagerService: IResourceManagerService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._init();
    }

    // eslint-disable-next-line max-lines-per-function
    private _init() {
        const loadHookResource = (
            hook: IResourceHook,
            unitId: string,
            resources: IResources = [],
            errorLabel: string
        ) => {
            const plugin = resources.find((r) => r.name === hook.pluginName);
            if (plugin) {
                try {
                    const data = hook.parseJson(plugin.data);
                    hook.onLoad(unitId, data);
                } catch (err) {
                    console.error(`Load ${errorLabel}{${unitId}} Resources{${hook.pluginName}} Data Error.`);
                }
            }
        };

        const handleHookAdd = (hook: IResourceHook) => {
            hook.businesses.forEach((business) => {
                switch (business) {
                    case UniverInstanceType.UNRECOGNIZED:
                    case UniverInstanceType.UNIVER_UNKNOWN:
                    case UniverInstanceType.UNIVER_DOC: {
                        this._univerInstanceService.getAllUnitsForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).forEach((doc) => {
                            loadHookResource(hook, doc.getUnitId(), doc.getSnapshot().resources, 'Document');
                        });
                        break;
                    }
                    case UniverInstanceType.UNIVER_SLIDE: {
                        this._univerInstanceService.getAllUnitsForType<UnitModel<{ resources?: IResources }>>(UniverInstanceType.UNIVER_SLIDE).forEach((slide) => {
                            loadHookResource(hook, slide.getUnitId(), slide.getSnapshot().resources, 'Slide');
                        });
                        break;
                    }
                    case UniverInstanceType.UNIVER_BOARD: {
                        this._univerInstanceService.getAllUnitsForType<UnitModel<{ resources?: IResources }>>(UniverInstanceType.UNIVER_BOARD).forEach((board) => {
                            loadHookResource(hook, board.getUnitId(), board.getSnapshot().resources, 'Board');
                        });
                        break;
                    }
                    case UniverInstanceType.UNIVER_SHEET: {
                        this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET).forEach((workbook) => {
                            loadHookResource(hook, workbook.getUnitId(), workbook.getSnapshot().resources, 'Workbook');
                        });
                        break;
                    }
                    case UniverInstanceType.UNIVER_BASE: {
                        this._univerInstanceService.getAllUnitsForType<UnitModel<{ resources?: IResources }>>(UniverInstanceType.UNIVER_BASE).forEach((base) => {
                            loadHookResource(hook, base.getUnitId(), base.getSnapshot().resources, 'Base');
                        });
                        break;
                    }
                }
            });
        };

        const allResourceHooks = this._resourceManagerService.getAllResourceHooks();
        allResourceHooks.forEach((hook) => handleHookAdd(hook));

        this.disposeWithMe(this._resourceManagerService.register$.subscribe((hook) => handleHookAdd(hook)));

        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((event) => {
                const { unit: workbook } = event;
                this._resourceManagerService.loadResources(workbook.getUnitId(), workbook.getSnapshot().resources);
            })
        );
        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitAdded$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).subscribe((event) => {
                const { unit: doc } = event;
                const unitId = doc.getUnitId();
                if (!isInternalEditorID(unitId)) {
                    this._resourceManagerService.loadResources(doc.getUnitId(), doc.getSnapshot().resources);
                }
            })
        );
        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitAdded$<UnitModel<{ resources?: IResources }>>(UniverInstanceType.UNIVER_SLIDE).subscribe((event) => {
                const { unit: slide } = event;
                this._resourceManagerService.loadResources(slide.getUnitId(), slide.getSnapshot().resources);
            })
        );
        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitAdded$<UnitModel<{ resources?: IResources }>>(UniverInstanceType.UNIVER_BOARD).subscribe((event) => {
                const { unit: board } = event;
                this._resourceManagerService.loadResources(board.getUnitId(), board.getSnapshot().resources);
            })
        );

        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitAdded$<UnitModel<{ resources?: IResources }>>(UniverInstanceType.UNIVER_BASE).subscribe((event) => {
                const { unit: base } = event;
                this._resourceManagerService.loadResources(base.getUnitId(), base.getSnapshot().resources);
            })
        );
        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
                this._resourceManagerService.unloadResources(workbook.getUnitId(), UniverInstanceType.UNIVER_SHEET);
            })
        );

        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitDisposed$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).subscribe((doc) => {
                this._resourceManagerService.unloadResources(doc.getUnitId(), UniverInstanceType.UNIVER_DOC);
            })
        );
        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitDisposed$<UnitModel<{ resources?: IResources }>>(UniverInstanceType.UNIVER_BASE).subscribe((base) => {
                this._resourceManagerService.unloadResources(base.getUnitId(), UniverInstanceType.UNIVER_BASE);
            })
        );
        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitDisposed$<UnitModel>(UniverInstanceType.UNIVER_SLIDE).subscribe((slide) => {
                this._resourceManagerService.unloadResources(slide.getUnitId(), UniverInstanceType.UNIVER_SLIDE);
            })
        );
        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitDisposed$<UnitModel>(UniverInstanceType.UNIVER_BOARD).subscribe((board) => {
                this._resourceManagerService.unloadResources(board.getUnitId(), UniverInstanceType.UNIVER_BOARD);
            })
        );
    }

    saveUnit<T = object>(unitId: string) {
        const unit = this._univerInstanceService.getUnit(unitId);
        if (!unit) {
            return null;
        }
        const resources = this._resourceManagerService.getResources(unitId, unit.type);
        const snapshot = Tools.deepClone(unit.getSnapshot()) as { resources: typeof resources } & T;
        snapshot.resources = resources;
        return snapshot;
    }
}
