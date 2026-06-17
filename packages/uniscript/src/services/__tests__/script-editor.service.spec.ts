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

import { IConfigService, Injector } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UNISCRIPT_PLUGIN_CONFIG_KEY } from '../../config/config';
import { ScriptEditorService } from '../script-editor.service';

describe('ScriptEditorService', () => {
    let service: ScriptEditorService;

    beforeEach(() => {
        vi.stubGlobal('window', globalThis);
        Reflect.deleteProperty(window, 'MonacoEnvironment');
        const injector = new Injector();
        class TestConfigService {
            getConfig = (key: string) => key === UNISCRIPT_PLUGIN_CONFIG_KEY ? { getWorkerUrl: () => 'worker.js' } : undefined;
        }

        injector.add([IConfigService, { useClass: TestConfigService as never }]);
        injector.add([ScriptEditorService]);
        service = injector.get(ScriptEditorService);
    });

    afterEach(() => {
        Reflect.deleteProperty(window, 'MonacoEnvironment');
        vi.unstubAllGlobals();
    });

    it('keeps the active Monaco editor instance until the registration is disposed', () => {
        const editor = { dispose: vi.fn() };

        const disposable = service.setEditorInstance(editor as never);

        expect(service.getEditorInstance()).toBe(editor);
        disposable.dispose();
        expect(service.getEditorInstance()).toBeNull();
    });

    it('initializes Monaco worker loading from plugin config', () => {
        service.requireVscodeEditor();

        expect(window.MonacoEnvironment?.getWorkerUrl?.('', '')).toBe('worker.js');
    });
});
