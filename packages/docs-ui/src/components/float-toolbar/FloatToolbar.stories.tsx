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

import type { Meta } from '@storybook/react';

import type { Dependency } from '@univerjs/core';
import { LocaleService, LocaleType } from '@univerjs/core';
import { ColorPicker } from '@univerjs/design';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { ComponentManager, DesktopLayoutService, FontFamily, FontFamilyItem, FontSize, ILayoutService, IMenuManagerService, MenuManagerService, RediContext } from '@univerjs/ui';
import { useContext, useEffect, useState } from 'react';
import {
    SetInlineFormatBoldCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatSubscriptCommand,
    SetInlineFormatSuperscriptCommand,
    SetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from '../../commands/commands/inline-format.command';
import { menuSchema } from '../../controllers/menu.schema';
import enUS from '../../locale/en-US';
import ruRU from '../../locale/ru-RU';
import zhCN from '../../locale/zh-CN';
import { COLOR_PICKER_COMPONENT } from '../color-picker';
import { FONT_FAMILY_COMPONENT, FONT_FAMILY_ITEM_COMPONENT } from '../font-family';
import { FONT_SIZE_COMPONENT } from '../font-size';
import { FloatToolbar } from './FloatToolbar';

const meta: Meta<typeof FloatToolbar> = {
    title: 'FloatToolbar',
    component: FloatToolbar,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        const { injector } = useContext(RediContext);

        const [inject] = useState(() => {
            const deps: Dependency[] = [
                [ComponentManager],

                [ILayoutService, { useClass: DesktopLayoutService }],
                [IMenuManagerService, { useClass: MenuManagerService }],
                [DocSelectionManagerService],
                [IRenderManagerService, { useClass: RenderManagerService }],
            ];

            injector?.get(LocaleService).load({
                [LocaleType.EN_US]: enUS,
                [LocaleType.ZH_CN]: zhCN,
                [LocaleType.RU_RU]: ruRU,
            });

            deps.forEach((dependency) => injector?.add(dependency));

            return injector;
        });

        useEffect(() => {
            if (!inject) return;

            const componentManager = inject.get(ComponentManager);
            componentManager.register(COLOR_PICKER_COMPONENT, ColorPicker);
            componentManager.register(FONT_FAMILY_COMPONENT, FontFamily);
            componentManager.register(FONT_FAMILY_ITEM_COMPONENT, FontFamilyItem);
            componentManager.register(FONT_SIZE_COMPONENT, FontSize);

            const menuManagerService = inject.get(IMenuManagerService);
            menuManagerService.mergeMenu(menuSchema);
        }, [inject]);

        return (
            <RediContext.Provider value={{ injector: inject }}>
                <div>
                    <FloatToolbar
                        avaliableMenus={[
                            SetInlineFormatFontFamilyCommand.id,
                            SetInlineFormatFontSizeCommand.id,
                            SetInlineFormatBoldCommand.id,
                            SetInlineFormatItalicCommand.id,
                            SetInlineFormatUnderlineCommand.id,
                            SetInlineFormatStrikethroughCommand.id,
                            SetInlineFormatSubscriptCommand.id,
                            SetInlineFormatSuperscriptCommand.id,
                            SetInlineFormatTextColorCommand.id,
                            SetInlineFormatTextBackgroundColorCommand.id,
                        ]}
                    />
                </div>
            </RediContext.Provider>
        );
    },
};
