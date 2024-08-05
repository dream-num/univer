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

import { LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { greenTheme } from '@univerjs/design';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSlidesPlugin } from '@univerjs/slides';
import { UniverSlidesUIPlugin } from '@univerjs/slides-ui';
import { UniverUIPlugin } from '@univerjs/ui';

import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverDocsHyperLinkPlugin } from '@univerjs/docs-hyper-link';
import { DEFAULT_SLIDE_DATA } from '../data';
import { enUS, ruRU, zhCN } from '../locales';

// univer
const univer = new Univer({
    theme: greenTheme,
    locale: LocaleType.ZH_CN,
    locales: {
        [LocaleType.ZH_CN]: zhCN,
        [LocaleType.EN_US]: enUS,
        [LocaleType.RU_RU]: ruRU,
    },
});

// core plugins
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverUIPlugin, { container: 'app' });
univer.registerPlugin(UniverDocsPlugin, { hasScroll: false });
univer.registerPlugin(UniverDocsUIPlugin);
univer.registerPlugin(UniverDocsHyperLinkPlugin);
// base-render
univer.registerPlugin(UniverFormulaEnginePlugin);
univer.registerPlugin(UniverSlidesPlugin);
univer.registerPlugin(UniverSlidesUIPlugin);

univer.createUnit(UniverInstanceType.UNIVER_SLIDE, DEFAULT_SLIDE_DATA);

window.univer = univer;
