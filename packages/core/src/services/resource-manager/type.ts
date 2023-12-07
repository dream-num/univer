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
