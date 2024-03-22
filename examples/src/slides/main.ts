/**
 * Copyright 2023-present DreamNum Inc.
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

import { LocaleType, Univer } from '@univerjs/core';
import { greenTheme } from '@univerjs/design';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSlidesPlugin } from '@univerjs/slides';
import { UniverSlidesUIPlugin } from '@univerjs/slides-ui';
import { UniverUIPlugin } from '@univerjs/ui';

import { DEFAULT_SLIDE_DATA } from '../data';

// univer
const univer = new Univer({
    locale: LocaleType.ZH_CN,
    theme: greenTheme,
});

// base-render
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverUIPlugin, {
    container: 'univer-container',
    header: true,
    footer: true,
});
univer.registerPlugin(UniverSlidesPlugin);
univer.registerPlugin(UniverSlidesUIPlugin);

univer.createUniverSlide(DEFAULT_SLIDE_DATA);

// use for console test
declare global {
    interface Window {
        univer?: Univer;
    }
}

window.univer = univer;
