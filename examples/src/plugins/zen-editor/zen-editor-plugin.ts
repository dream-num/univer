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

import { Plugin, PluginType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { ZenEditorController } from './controllers/zen-editor.controller';

export interface IZenEditorPluginConfig {}

export class ZenEditorPlugin extends Plugin {
    static override type = PluginType.Doc;

    constructor(
        config: IZenEditorPluginConfig,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super('zen-editor');
        this._initializeDependencies(this._injector);
    }

    private _initializeDependencies(injector: Injector) {
        const dependencies: Dependency[] = [[ZenEditorController]];

        dependencies.forEach((dependency) => injector.add(dependency));
    }

    override onRendered(): void {}

    override onDestroy(): void {}
}
