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

import type { IUniverDocsThreadCommentConfig } from './config/config';
import {
    DependentOn,
    ICommandService,
    IConfigService,
    Inject,
    Injector,
    merge,
    Plugin,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverThreadCommentPlugin } from '@univerjs/thread-comment';
import pkg from '../package.json';
import {
    AddDocCommentDecorationMutation,
    CreateDocTextRangeCommentCommand,
} from './commands/commands/create-doc-text-range-comment.command';
import { DOCS_THREAD_COMMENT_PLUGIN_NAME } from './common/const';
import { defaultPluginConfig, DOCS_THREAD_COMMENT_PLUGIN_CONFIG_KEY } from './config/config';
import { DocsThreadCommentResourceController } from './controllers/docs-thread-comment-resource.controller';

@DependentOn(UniverDocsPlugin, UniverThreadCommentPlugin)
export class UniverDocsThreadCommentPlugin extends Plugin {
    static override pluginName = DOCS_THREAD_COMMENT_PLUGIN_NAME;
    static override packageName = pkg.name;
    static override version = pkg.version;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        private readonly _config: Partial<IUniverDocsThreadCommentConfig> = defaultPluginConfig,
        @Inject(Injector) protected override _injector: Injector,
        @IConfigService private readonly _configService: IConfigService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(DOCS_THREAD_COMMENT_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        this._injector.add([DocsThreadCommentResourceController]);
        this._injector.get(DocsThreadCommentResourceController);
        this.disposeWithMe(this._commandService.registerCommand(CreateDocTextRangeCommentCommand));
        this.disposeWithMe(this._commandService.registerCommand(AddDocCommentDecorationMutation));
    }
}
