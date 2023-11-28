import { Disposable } from '@univerjs/core';

export interface IScripteEditorServiceConfig {
    getWorkerUrl(moduleID: string, label: string): string;
}

/**
 * This service is for loading monaco editor.
 */
export class ScriptEditorService extends Disposable {
    constructor(private readonly config: IScripteEditorServiceConfig) {
        super();
    }
}
