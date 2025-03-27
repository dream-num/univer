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
import { Inject, Injector, LocaleType, Plugin, Univer, UniverInstanceType } from '@univerjs/core';
import React, { useState } from 'react';
import { ComponentManager } from '../../../common';
import { ContextMenuPosition } from '../../../services/menu/types';
import { IPlatformService, PlatformService } from '../../../services/platform/platform.service';
import { IShortcutService, ShortcutService } from '../../../services/shortcut/shortcut.service';
import { RediContext } from '../../../utils/di';
import { MobileMenu } from './MobileMenu';

const meta: Meta = {
    title: 'Components / MobileMenuItem',
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

function createMobileMenuStorybookBed() {
    const univer = new Univer({
        locale: LocaleType.EN_US,
        locales: {
            [LocaleType.EN_US]: {},
        },
    });
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override type = UniverInstanceType.UNIVER_UNKNOWN;
        static override pluginName = 'test-plugin';

        constructor(
            private readonly _config: undefined,
            @Inject(Injector) protected override _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            const injector = this._injector;
            injector.add([IPlatformService, { useClass: PlatformService }]);
            injector.add([IShortcutService, { useClass: ShortcutService }]);
            injector.add([ComponentManager]);
        }
    }

    univer.registerPlugin(TestPlugin);

    return { univer, injector };
}

export const Playground = {
    render() {
        const [bed] = useState(() => createMobileMenuStorybookBed());

        return (
            <RediContext.Provider value={{ injector: bed.injector }}>
                <MobileMenu menuType={ContextMenuPosition.MAIN_AREA} />
            </RediContext.Provider>
        );
    },
};
