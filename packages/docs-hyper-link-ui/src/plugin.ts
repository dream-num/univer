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

import { DependentOn, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { UniverDocHyperLinkPlugin } from '@univerjs/docs-hyper-link';
import { DOC_HYPER_LINK_UI_PLUGIN } from './types/const';
import { DocHyperLinkUIController } from './controllers/ui.controller';
import { DocHyperLinkService } from './services/hyper-link.service';

@DependentOn(UniverDocHyperLinkPlugin)
export class UniverDocHyperLinkUIPlugin extends Plugin {
    static override pluginName = DOC_HYPER_LINK_UI_PLUGIN;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        @Inject(Injector) protected override _injector: Injector
    ) {
        super();
    }

    override onStarting(injector: Injector): void {
        const deps: Dependency[] = [
            [DocHyperLinkService],
            [DocHyperLinkUIController],

        ];

        deps.forEach((dep) => {
            injector.add(dep);
        });
    }
}
