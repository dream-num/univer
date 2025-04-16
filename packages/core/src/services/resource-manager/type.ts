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

import type { Observable } from 'rxjs';
import type { IDisposable } from '../../common/di';
import type { UniverInstanceType } from '../../common/unit';
import { createIdentifier } from '../../common/di';

export type IResources = Array<{ id?: string; name: string; data: string }>;

type IBusinessName = 'SHEET' | 'DOC';
export type IResourceName = `${IBusinessName}_${string}_PLUGIN`;
export interface IResourceHook<T = any> {
    pluginName: IResourceName;
    businesses: UniverInstanceType[];
    onLoad: (unitID: string, resource: T) => void;
    onUnLoad: (unitID: string) => void;
    toJson: (unitID: string, model?: T) => string;

    parseJson: (bytes: string) => T;
}

export interface IResourceManagerService {
    register$: Observable<IResourceHook>;
    registerPluginResource: <T = any>(hook: IResourceHook<T>) => IDisposable;
    disposePluginResource: (pluginName: IResourceName) => void;
    getAllResourceHooks: () => IResourceHook[];

    /**
     * @deprecated You should get resource with type specified.
     */
    getResources(unitId: string): IResources;
    getResources(unitId: string, type: UniverInstanceType): IResources;
    getResourcesByType: (unitId: string, type: UniverInstanceType) => IResources;
    loadResources: (unitId: string, resources?: IResources) => void;
    unloadResources(unitId: string): void;
}

export const IResourceManagerService = createIdentifier<IResourceManagerService>('core.resource-manager.service');
