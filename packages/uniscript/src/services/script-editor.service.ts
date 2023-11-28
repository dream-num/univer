import { Disposable } from '@univerjs/core';

export interface IScriptEditorServiceConfig {
    getWorkerUrl(moduleID: string, label: string): string;
}

/**
 * This service is for loading monaco editor and its resources.
 */
export class ScriptEditorService extends Disposable {
    constructor(private readonly _config: IScriptEditorServiceConfig) {
        super();
    }

    requireVscodeEditor(): void {
        if (!window.MonacoEnvironment) {
            window.MonacoEnvironment = {
                getWorkerUrl: this._config.getWorkerUrl,
            };
        }
    }
}
