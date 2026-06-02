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

import type { UniverInstanceType } from '../../common/unit';
import type { IResourceHook, IResourceManagerService, IResourceName, IResources } from './type';
import { Subject } from 'rxjs';
import { Disposable, toDisposable } from '../../shared/lifecycle';
import { ILogService } from '../log/log.service';

export class ResourceManagerService extends Disposable implements IResourceManagerService {
    private _resourceMap = new Map<IResourceName, IResourceHook>();

    private readonly _register$ = new Subject<IResourceHook>();
    public readonly register$ = this._register$.asObservable();

    constructor(@ILogService private readonly _logService: ILogService) {
        super();
    }

    public getAllResourceHooks() {
        const list = [...this._resourceMap.values()];
        return list;
    }

    public getResources(unitId: string): IResources;
    public getResources(unitId: string, type: UniverInstanceType): IResources;
    public getResources(unitId: string, type?: UniverInstanceType): IResources {
        if (type) {
            return this.getResourcesByType(unitId, type);
        }

        const resourceHooks = this.getAllResourceHooks();
        const resources = resourceHooks.map((resourceHook) => {
            const data = resourceHook.toJson(unitId);
            return {
                name: resourceHook.pluginName,
                data,
            };
        });
        return resources;
    }

    public getResourcesByType(unitId: string, type: UniverInstanceType) {
        const resourceHooks = this.getAllResourceHooks().filter((hook) => hook.businesses.includes(type));
        const resources = resourceHooks.map((resourceHook) => {
            const data = resourceHook.toJson(unitId);
            return {
                name: resourceHook.pluginName,
                data,
            };
        });
        return resources;
    }

    public registerPluginResource<T = unknown>(hook: IResourceHook<T>) {
        const resourceName = hook.pluginName;
        if (this._resourceMap.has(resourceName)) {
            throw new Error(`the pluginName is registered {${resourceName}}`);
        }
        this._resourceMap.set(resourceName, hook);
        this._register$.next(hook);
        return toDisposable(() => this._resourceMap.delete(resourceName));
    }

    public disposePluginResource(pluginName: IResourceName) {
        this._resourceMap.delete(pluginName);
    }

    public loadResources(unitId: string, resources?: IResources) {
        this.getAllResourceHooks().forEach((hook) => {
            const data = this._getResourceData(resources, hook.pluginName);
            if (data) {
                try {
                    const model = hook.parseJson(data);
                    hook.onLoad(unitId, model);
                } catch (err: unknown) {
                    this._logService.error('[ResourceManagerService]', 'loadResources error', err);
                }
            }
        });
    }

    public unloadResources(unitId: string, type: UniverInstanceType) {
        this.getAllResourceHooks().filter((hook) => hook.businesses.includes(type)).forEach((hook) => {
            hook.onUnLoad(unitId);
        });
    }

    private _getResourceData(resources: unknown, pluginName: IResourceName): string | undefined {
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
    }

    override dispose(): void {
        this._register$.complete();
        this._resourceMap.clear();
    }
}
