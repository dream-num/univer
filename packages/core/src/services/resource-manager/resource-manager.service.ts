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

import { Subject } from 'rxjs';
import { Disposable, toDisposable } from '../../shared/lifecycle';
import type { IWorkbookData } from '../../types/interfaces/i-workbook-data';
import type { IResourceHook, IResourceManagerService, IResourceName } from './type';

export class ResourceManagerService extends Disposable implements IResourceManagerService {
    private _resourceMap = new Map<IResourceName, IResourceHook>();

    private _register$ = new Subject<IResourceHook>();
    public register$ = this._register$.asObservable();

    public getAllResourceHooks() {
        const list = [...this._resourceMap.values()];
        return list;
    }

    public getResources(unitId: string) {
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

    public loadResources(unitId: string, resources: IWorkbookData['resources']) {
        this.getAllResourceHooks().forEach((hook) => {
            const data = resources?.find((resource) => resource.name === hook.pluginName)?.data;
            if (data) {
                try {
                    const model = hook.parseJson(data);
                    hook.onLoad(unitId, model);
                } catch (err) {
                    console.error('LoadResources Error!');
                }
            }
        });
    }

    public unloadResources(unitId: string) {
        this.getAllResourceHooks().forEach((hook) => {
            hook.onUnLoad(unitId);
        });
    }

    override dispose(): void {
        this._register$.complete();
        this._resourceMap.clear();
    }
}
