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

import type { IUniverDebuggerConfig } from './config.schema';
import { Disposable, IConfigService, Inject, Injector } from '@univerjs/core';
import { BuiltInUIPart, ComponentManager, connectInjector, IUIPartsService } from '@univerjs/ui';
import { AIButton, FloatButton } from '../components/FloatButton';
import { ImageDemo } from '../components/Image';
import { RangeLoading } from '../components/RangeLoading';
import { Fab } from '../views/Fab';
import { DEBUGGER_PLUGIN_CONFIG_KEY } from './config.schema';
import { RecordController } from './local-save/record.controller';

export class DebuggerController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();

        this._initCustomComponents();

        this._injector.add([RecordController]);
    }

    private _initCustomComponents(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register('ImageDemo', ImageDemo));
        this.disposeWithMe(componentManager.register('RangeLoading', RangeLoading));
        this.disposeWithMe(componentManager.register('FloatButton', FloatButton));
        this.disposeWithMe(componentManager.register('AIButton', AIButton));

        const configs = this._configService.getConfig<IUniverDebuggerConfig>(DEBUGGER_PLUGIN_CONFIG_KEY);

        if (configs?.fab) {
            this.disposeWithMe(
                this._uiPartsService.registerComponent(BuiltInUIPart.GLOBAL, () => connectInjector(Fab, this._injector))
            );
        }
    }
}
