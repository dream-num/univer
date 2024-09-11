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

import { Inject, Injector, Plugin } from '@univerjs/core';
import type { Dependency } from '@univerjs/core';
import { ActionRecorderController } from './controllers/action-recorder.controller';
import { ActionRecorderService } from './services/action-recorder.service';
import { ActionReplayService } from './services/replay.service';

/**
 * This plugin provides a recorder for user's interactions with Univer,
 * it only records commands (and some special operations) so that it can be replayed later.
 */
export class UniverActionRecorderPlugin extends Plugin {
    static override pluginName = 'UNIVER_ACTION_RECORDER_PLUGIN';

    constructor(
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();
    }

    override onStarting(_injector?: Injector): void {
        ([
            [ActionRecorderService],
            [ActionReplayService],
            [ActionRecorderController],
        ] as Dependency[]).forEach((d) => this._injector.add(d));
    }

    override onSteady(): void {
        this._injector.get(ActionRecorderController);
    }
}
