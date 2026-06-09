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
import type { IResourceHook, IResourceName, IResourceSnapshot } from '../resource-manager/type';
import type { IResourceLoaderSaveUnitSnapshot, IResourceLoaderService } from './type';
import { isInternalEditorID } from '../../common/const';
import { Inject } from '../../common/di';
import { UniverInstanceType } from '../../common/unit';
import { Tools } from '../../shared';
import { Disposable } from '../../shared/lifecycle';
import { IUniverInstanceService } from '../instance/instance.service';
import { IResourceManagerService, resourceListToObject } from '../resource-manager/type';

export class ResourceLoaderService extends Disposable implements IResourceLoaderService {
    constructor(
        @Inject(IResourceManagerService) private readonly _resourceManagerService: IResourceManagerService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._init();
    }

    private _init() {
        const loadHookResource = (
            hook: IResourceHook,
            unitId: string,
            resources: unknown,
            errorLabel: string
        ) => {
            const data = getResourceData(resources, hook.pluginName);
            if (data !== undefined) {
                try {
                    const model = hook.parseJson(data);
                    hook.onLoad(unitId, model);
                } catch (err) {
                    console.error(`Load ${errorLabel}{${unitId}} Resources{${hook.pluginName}} Data Error.`);
                }
            }
        };
        const getResourceData = (resources: unknown, pluginName: IResourceName): string | undefined => {
            if (Array.isArray(resources)) {
                const data = resources.find((resource) => resource.name === pluginName)?.data;
                return typeof data === 'string' ? data : undefined;
            }

            if (!resources || typeof resources !== 'object') {
                return undefined;
            }

            const raw = (resources as Record<string, unknown>)[pluginName];
            if (typeof raw === 'string') {
                return raw;
            }

            if (raw && typeof raw === 'object') {
                const data = (raw as Record<string, unknown>).data;
                if (typeof data === 'string') {
                    return data;
                }

                return JSON.stringify(raw);
            }

            return undefined;
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
                        this._univerInstanceService.getAllUnitsForType<UnitModel<{ resources?: IResourceSnapshot }>>(UniverInstanceType.UNIVER_SLIDE).forEach((slide) => {
                            loadHookResource(hook, slide.getUnitId(), slide.getSnapshot().resources, 'Slide');
                        });
                        break;
                    }
                    case UniverInstanceType.UNIVER_SHEET: {
                        this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET).forEach((workbook) => {
                            loadHookResource(hook, workbook.getUnitId(), workbook.getSnapshot().resources, 'Workbook');
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
            this._univerInstanceService.getTypeOfUnitAdded$<UnitModel<{ resources?: IResourceSnapshot }>>(UniverInstanceType.UNIVER_SLIDE).subscribe((event) => {
                const { unit: slide } = event;
                this._resourceManagerService.loadResources(slide.getUnitId(), slide.getSnapshot().resources);
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
            this._univerInstanceService.getTypeOfUnitDisposed$<UnitModel>(UniverInstanceType.UNIVER_SLIDE).subscribe((slide) => {
                this._resourceManagerService.unloadResources(slide.getUnitId(), UniverInstanceType.UNIVER_SLIDE);
            })
        );
    }

    saveUnit<T = object>(unitId: string) {
        const unit = this._univerInstanceService.getUnit(unitId);
        if (!unit) {
            return null;
        }
        const resources = this._resourceManagerService.getResources(unitId, unit.type);
        const snapshot = Tools.deepClone(unit.getSnapshot()) as IResourceLoaderSaveUnitSnapshot<T>;
        (snapshot as { resources: IResourceSnapshot }).resources =
            unit.type === UniverInstanceType.UNIVER_SLIDE ? resourceListToObject(resources) : resources;
        return snapshot;
    }
}
