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

import type { Univer } from '@univerjs/core';
import type { FUniver, IEventBase } from '@univerjs/core/facade';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SHEET_VIEW_KEY } from '@univerjs/sheets-ui';
import { IContextMenuService } from '@univerjs/ui';

interface IDisableContextMenuEventParams extends IEventBase {
    event: MouseEvent;
}

interface ICustomEventParamConfig {
    DisableContextMenu: IDisableContextMenuEventParams;
}

export function customRegisterEvent(univer: Univer, univerAPI: FUniver) {
    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
        if (stage === univerAPI.Enum.LifecycleStages.Steady) {
            registerMainRightClickEvent(univer, univerAPI);

            univerAPI.addEvent('DisableContextMenu', (params) => {
                params.cancel = true;
            });
        }
    });
}

function registerMainRightClickEvent(univer: Univer, univerAPI: FUniver) {
    const fWorkbook = univerAPI.getActiveWorkbook();
    if (!fWorkbook) return;

    const fWorksheet = fWorkbook.getActiveSheet();
    if (!fWorksheet) return;

    const injector = univer.__getInjector();
    const renderManagerService = injector.get(IRenderManagerService);
    const render = renderManagerService.getRenderById(fWorkbook.getId());
    if (!render) return;

    const { components } = render;
    const mainComponent = components.get(SHEET_VIEW_KEY.MAIN);
    if (!mainComponent) return;

    const contextMenuService = injector.get(IContextMenuService);

    univerAPI.registerEventHandler(
        'DisableContextMenu',
        () => mainComponent.onPointerDown$.subscribeEvent((event) => {
            if (event.button !== 2) return;
            const eventParams: IDisableContextMenuEventParams = {
                event,
            };
            univerAPI.fireEvent('DisableContextMenu', eventParams);
            if (eventParams.cancel) {
                requestAnimationFrame(() => {
                    contextMenuService.hideContextMenu();
                    contextMenuService.disable();
                });
            }
        })
    );
}

declare module '@univerjs/core/facade' {
    interface IEventParamConfig extends ICustomEventParamConfig { }
}
