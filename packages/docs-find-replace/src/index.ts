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

import { DependentOn, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverFindReplacePlugin } from '@univerjs/find-replace';
import pkg from '../package.json';
import { DocsFindReplaceController } from './controllers/docs-find-replace.controller';
import { DocsFindReplaceProvider } from './services/docs-find-replace.provider';

@DependentOn(UniverDocsPlugin, UniverDocsUIPlugin, UniverRenderEnginePlugin, UniverFindReplacePlugin)
export class UniverDocsFindReplacePlugin extends Plugin {
    static override pluginName = 'DOCS_FIND_REPLACE_PLUGIN';
    static override packageName = pkg.name;
    static override version = pkg.version;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        _config: undefined,
        @Inject(Injector) protected override readonly _injector: Injector
    ) {
        super();
    }

    override onStarting(): void {
        this._injector.add([DocsFindReplaceProvider]);
        this._injector.add([DocsFindReplaceController]);
    }

    override onSteady(): void {
        this._injector.get(DocsFindReplaceController);
    }
}
