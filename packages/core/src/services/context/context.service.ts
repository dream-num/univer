import { createIdentifier } from '@wendellhu/redi';

import { Disposable } from '../../Shared/lifecycle';

export interface IContextService {
    getContextValue(key: string): boolean;
    setContextValue(key: string, value: boolean): void;
}

export const IContextService = createIdentifier<IContextService>('univer.context-service');

export class ContextService extends Disposable implements IContextService {
    private readonly _contextMap = new Map<string, boolean>();

    getContextValue(key: string): boolean {
        return this._contextMap.get(key) ?? false;
    }

    setContextValue(key: string, value: boolean): void {
        this._contextMap.set(key, value);
    }
}
