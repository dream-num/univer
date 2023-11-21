import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { Observable } from 'rxjs';

export interface IResourceHook<T = unknown> {
    onChange: (unitID: string, resource: T) => void;
    toJson: (unitID: string) => string;
    parseJson: (bytes: string) => T;
}

export interface IResourceManagerService {
    registerPluginResource: (unitID: string, pluginName: string, hook: IResourceHook) => IDisposable;
    disposePluginResource: (unitID: string, pluginName: string) => void;
    getAllResource: (unitID: string) => Array<{ unitID: string; resourceName: string; hook: IResourceHook }>;
    register$: Observable<{ resourceName: string; hook: IResourceHook; unitID: string }>;
}

export const IResourceManagerService = createIdentifier<IResourceManagerService>('resource-manager-service');
