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

import type { Dependency, ICommand } from '@univerjs/core';
import type { IUniverDocsConfig } from './controllers/config.schema';
import {
    ICommandService,
    IConfigService,
    Inject,
    Injector,
    merge,
    Plugin,
} from '@univerjs/core';
import { RichTextEditingMutation } from './commands/mutations/core-editing.mutation';
import { DocsRenameMutation } from './commands/mutations/docs-rename.mutation';
import { SetTextSelectionsOperation } from './commands/operations/text-selection.operation';
import { defaultPluginConfig, DOCS_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { DocCustomRangeController } from './controllers/custom-range.controller';
import { DocSelectionManagerService } from './services/doc-selection-manager.service';
import { DocStateEmitService } from './services/doc-state-emit.service';

const PLUGIN_NAME = 'DOCS_PLUGIN';

export class UniverDocsPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    // static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        private readonly _config: Partial<IUniverDocsConfig> = defaultPluginConfig,
        @Inject(Injector) override _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(DOCS_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        this._initializeDependencies();
        this._initializeCommands();
    }

    private _initializeCommands(): void {
        (
            [
                RichTextEditingMutation,
                DocsRenameMutation,
                SetTextSelectionsOperation,
            ] as ICommand[]
        ).forEach((command) => {
            this._injector.get(ICommandService).registerCommand(command);
        });
    }

    private _initializeDependencies() {
        (
            [
                [DocSelectionManagerService],
                [DocStateEmitService],
                [DocCustomRangeController],
            ] as Dependency[]
        ).forEach((d) => this._injector.add(d));
    }

    override onReady(): void {
        this._injector.get(DocCustomRangeController);
    }
}
