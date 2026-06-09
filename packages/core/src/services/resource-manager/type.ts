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

export interface IResourceItem { id?: string; name: string; data: string }
export type IResources = IResourceItem[];
export type IResourceObject = Record<string, unknown>;
export type IResourceSnapshot = IResources | IResourceObject;

export function resourceListToObject(resources: IResources | null | undefined): IResourceObject {
    const result: IResourceObject = {};

    resources?.forEach((resource) => {
        if (!resource?.name) {
            return;
        }

        result[resource.name] = parseResourceItemData(resource);
    });

    return result;
}

function parseResourceItemData(resource: IResourceItem): unknown {
    const { data } = resource;
    try {
        return JSON.parse(data);
    } catch {
        if (resource.id !== undefined) {
            return {
                id: resource.id,
                data,
            };
        }

        return data;
    }
}

type IBusinessName = 'SHEET' | 'DOC' | 'SLIDE';
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

    getResources(unitId: string, type: UniverInstanceType): IResources;
    getResourcesByType: (unitId: string, type: UniverInstanceType) => IResources;
    loadResources: (unitId: string, resources?: IResourceSnapshot) => void;
    unloadResources(unitId: string, type: UniverInstanceType): void;
}

export const IResourceManagerService = createIdentifier<IResourceManagerService>('core.resource-manager.service');
