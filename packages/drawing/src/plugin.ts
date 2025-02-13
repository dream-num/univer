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

import type { Dependency } from '@univerjs/core';
import type { IUniverDrawingConfig } from './controllers/config.schema';

import { ICommandService, IConfigService, Inject, Injector, merge, mergeOverrideWithDependencies, Plugin } from '@univerjs/core';
import { SetDrawingSelectedOperation } from './commands/operations/set-drawing-selected.operation';
import { defaultPluginConfig, DRAWING_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { DrawingManagerService } from './services/drawing-manager-impl.service';
import { IDrawingManagerService } from './services/drawing-manager.service';
import { ImageIoService } from './services/image-io-impl.service';
import { IImageIoService } from './services/image-io.service';

const PLUGIN_NAME = 'UNIVER_DRAWING_PLUGIN';

export class UniverDrawingPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;

    constructor(
        private readonly _config: Partial<IUniverDrawingConfig> = defaultPluginConfig,
        @Inject(Injector) protected _injector: Injector,
        @IConfigService private readonly _configService: IConfigService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(DRAWING_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        this._initCommands();
        this._initDependencies();
    }

    private _initDependencies(): void {
        const dependencies: Dependency[] = [
            [IImageIoService, { useClass: ImageIoService }],
            [IDrawingManagerService, { useClass: DrawingManagerService }],
        ];

        const dependency = mergeOverrideWithDependencies(dependencies, this._config?.override);
        dependency.forEach((d) => this._injector.add(d));
    }

    private _initCommands() {
        [
            SetDrawingSelectedOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }
}
