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

import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';

import type { Workbook } from '../../sheets/workbook';
import type { IWorkbookData } from '../../types/interfaces/i-workbook-data';
import { LifecycleStages, runOnLifecycle } from '../lifecycle/lifecycle';

export interface IResourceHook<T = any> {
    onChange: (unitID: string, resource: T) => void;
    toJson: (unitID: string) => string;
    parseJson: (bytes: string) => T;
}

export interface IResourceManagerService {
    registerPluginResource: <T = any>(unitID: string, pluginName: string, hook: IResourceHook<T>) => IDisposable;
    disposePluginResource: (unitID: string, pluginName: string) => void;
    getAllResource: (unitID: string) => Array<{ unitID: string; resourceName: string; hook: IResourceHook }>;
    register$: Observable<{ resourceName: string; hook: IResourceHook; unitID: string }>;
}

export const IResourceManagerService = createIdentifier<IResourceManagerService>('resource-manager-service');
export interface ISnapshotPersistenceService {
    saveWorkbook: (workbook: Workbook) => IWorkbookData;
}

export const ISnapshotPersistenceService = createIdentifier<ISnapshotPersistenceService>('ResourcePersistenceService');
runOnLifecycle(LifecycleStages.Ready, ISnapshotPersistenceService);
