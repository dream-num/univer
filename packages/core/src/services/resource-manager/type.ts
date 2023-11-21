import { createIdentifier, IDisposable } from '@wendellhu/redi';

export interface IResourceHook<T = unknown> {
    onChange: (resource: T) => void;
    toJson: () => string;
    parseJson: (bytes: string) => T;
}

export interface IResourceManagerService {
    registerPluginResource: <T>(pluginName: string, hook: IResourceHook<T>) => IDisposable;
}

export const IResourceManagerService = createIdentifier<IResourceManagerService>('resource-manager-service');
