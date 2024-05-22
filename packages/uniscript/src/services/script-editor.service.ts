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

import { Disposable, toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import type { editor } from 'monaco-editor';
import type { IUniverUniscriptConfig } from '../controllers/uniscript.controller';

/**
 * This service is for loading monaco editor and its resources. It also holds the
 * monaco editor instance so user can interact with the editor programmatically.
 */
export class ScriptEditorService extends Disposable {
    private _editorInstance: editor.IStandaloneCodeEditor | null = null;

    constructor(private readonly _config: Partial<IUniverUniscriptConfig>) {
        super();
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
            window.MonacoEnvironment = {
                getWorkerUrl: this._config.getWorkerUrl,
            };
        }
    }
}
