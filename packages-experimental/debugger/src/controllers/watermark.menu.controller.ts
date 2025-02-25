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

import { Disposable, Inject } from '@univerjs/core';
import { WatermarkSingle } from '@univerjs/icons';
import { ComponentManager, IMenuManagerService } from '@univerjs/ui';
import { WatermarkPanel } from '../views/watermark/WatermarkPanel';
import { WatermarkPanelFooter } from '../views/watermark/WatermarkPanelFooter';

export const UNIVER_WATERMARK_MENU = 'UNIVER_WATERMARK_MENU';
export const WATERMARK_PANEL = 'WATERMARK_PANEL';

export const WATERMARK_PANEL_FOOTER = 'WATERMARK_PANEL_FOOTER';

export class UniverWatermarkMenuController extends Disposable {
    constructor(
        @IMenuManagerService protected readonly _menuManagerService: IMenuManagerService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();
        this._initComponents();
    }

    private _initComponents() {
        ([
            [UNIVER_WATERMARK_MENU, WatermarkSingle],
            [WATERMARK_PANEL, WatermarkPanel],
            [WATERMARK_PANEL_FOOTER, WatermarkPanelFooter],
        ] as const).forEach(([key, component]) => {
            this.disposeWithMe(this._componentManager.register(key, component));
        });
    }
}
