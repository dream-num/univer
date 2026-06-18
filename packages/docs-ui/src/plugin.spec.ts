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

import { describe, expect, it, vi } from 'vitest';
import { registerDocsEmbedUIContributions } from './embed-register';
import { UniverDocsUIPlugin } from './plugin';

vi.mock('./embed-register', () => ({
    registerDocsEmbedUIContributions: vi.fn(),
}));

describe('UniverDocsUIPlugin embed boundary', () => {
    it('registers docs embed UI contributions from the UI plugin', () => {
        const injector = createInjector();
        const plugin = new UniverDocsUIPlugin(
            {},
            injector,
            createRenderManagerService(),
            createCommandService(),
            createLogService(),
            createConfigService()
        );

        plugin.onStarting();

        expect(registerDocsEmbedUIContributions).toHaveBeenCalledWith(injector);
    });
});

function createInjector() {
    return {
        add: vi.fn(),
        get: vi.fn(() => ({
            registerShortcut: vi.fn(),
        })),
        has: vi.fn(() => false),
    } as never;
}

function createRenderManagerService() {
    return {
        registerRenderModule: vi.fn(() => ({ dispose: vi.fn() })),
    } as never;
}

function createCommandService() {
    return {
        registerCommand: vi.fn(() => ({ dispose: vi.fn() })),
        registerMultipleCommand: vi.fn(() => ({ dispose: vi.fn() })),
    } as never;
}

function createLogService() {
    return {
        warn: vi.fn(),
    } as never;
}

function createConfigService() {
    return {
        setConfig: vi.fn(),
    } as never;
}
