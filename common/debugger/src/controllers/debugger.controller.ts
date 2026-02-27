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
import {
    BuiltInUIPart,
    ComponentManager,
    connectInjector,
    IMenuManagerService,
    IUIPartsService,
    // MenuItemType,
    // RibbonStartGroup,
} from '@univerjs/ui';
import { AIButton, FloatButton } from '../components/FloatButton';
import { ImageDemo } from '../components/Image';
import { RangeLoading } from '../components/RangeLoading';
// @ts-ignore
// import VueComponent from '../components/VueComponent.vue';
// import { CounterComponent } from '../components/WebComponent';
import { Fab } from '../views/Fab';
import { DEBUGGER_PLUGIN_CONFIG_KEY } from './config.schema';
import { RecordController } from './local-save/record.controller';

export class DebuggerController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();

        this._initCustomComponents();
        // this._menuManagerService.mergeMenu({
        //     [RibbonStartGroup.OTHERS]: {
        //         EMOJI: {
        //             order: 9999,
        //             menuItemFactory: () => {
        //                 return {
        //                     id: 'EMOJI',
        //                     icon: 'VueComponent',
        //                     type: MenuItemType.BUTTON,
        //                 };
        //             },
        //         },
        //         COUNTER: {
        //             order: 9999,
        //             menuItemFactory: () => {
        //                 return {
        //                     id: 'COUNTER',
        //                     icon: 'counter-component',
        //                     type: MenuItemType.BUTTON,
        //                 };
        //             },
        //         },
        //     },
        // });

        this._injector.add([RecordController]);
    }

    private _initCustomComponents(): void {
        ([
            ['ImageDemo', ImageDemo],
            ['RangeLoading', RangeLoading],
            ['FloatButton', FloatButton],
            ['AIButton', AIButton],
        ] as const).forEach(([key, comp]) => {
            this.disposeWithMe(
                this._componentManager.register(key, comp)
            );
        });

        // this.disposeWithMe(this._componentManager.register('VueComponent', VueComponent, {
        //     framework: 'vue3',
        // }));

        // this.disposeWithMe(this._componentManager.register('counter-component', CounterComponent, {
        //     framework: 'web-component',
        // }));

        const configs = this._configService.getConfig<IUniverDebuggerConfig>(DEBUGGER_PLUGIN_CONFIG_KEY);

        if (configs?.fab) {
            this.disposeWithMe(
                this._uiPartsService.registerComponent(BuiltInUIPart.GLOBAL, () => connectInjector(Fab, this._injector))
            );
        }
    }
}
