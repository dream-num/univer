import { Subject } from 'rxjs';

import { Disposable, toDisposable } from '../../shared/lifecycle';
import { IResourceHook, IResourceManagerService } from './type';

export class ResourceManagerService extends Disposable implements IResourceManagerService {
    private _resourceMap = new Map<string, IResourceHook<any>>();

    private _register$ = new Subject<{ pluginName: string; hook: IResourceHook<any> }>();
    register$ = this._register$.asObservable();

    /**
     * the pluginName is map to resourceId which is created by serve.
     * @param {string} pluginName
     * @param {ResourceHook<T>} hook
     */
    registerPluginResource<T = unknown>(pluginName: string, hook: IResourceHook<T>) {
        if (this._resourceMap.has(pluginName)) {
            throw new Error('the pluginName is registered');
        }
        this._resourceMap.set(pluginName, hook);
        this._register$.next({ pluginName, hook });
        return toDisposable(() => this._resourceMap.delete(pluginName));
    }

    override dispose(): void {
        this._register$.complete();
        this._resourceMap.clear();
    }
}
