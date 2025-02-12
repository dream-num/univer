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

import type { IDisposable } from '@univerjs/core';
import type { editor } from 'monaco-editor';
import type { IUniverUniscriptConfig } from '../controllers/config.schema';
import { Disposable, IConfigService, toDisposable } from '@univerjs/core';
import { UNISCRIPT_PLUGIN_CONFIG_KEY } from '../controllers/config.schema';

/**
 * This service is for loading monaco editor and its resources. It also holds the
 * monaco editor instance so user can interact with the editor programmatically.
 */
export class ScriptEditorService extends Disposable {
    private _editorInstance: editor.IStandaloneCodeEditor | null = null;

    constructor(@IConfigService private readonly _configService: IConfigService) {
        super();
    }

    override dispose(): void {
        super.dispose();

        if (this._editorInstance) {
            this._editorInstance.dispose();
        }
    }

    setEditorInstance(editor: editor.IStandaloneCodeEditor): IDisposable {
        this._editorInstance = editor;
        return toDisposable(() => (this._editorInstance = null));
    }

    getEditorInstance(): editor.IStandaloneCodeEditor | null {
        return this._editorInstance;
    }

    requireVscodeEditor(): void {
        if (!window.MonacoEnvironment) {
            const config = this._configService.getConfig<IUniverUniscriptConfig>(UNISCRIPT_PLUGIN_CONFIG_KEY);
            window.MonacoEnvironment = { getWorkerUrl: config?.getWorkerUrl };
        }
    }
}
