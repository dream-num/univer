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

import { Optional } from '@wendellhu/redi';
import { Disposable, LifecycleStages, OnLifecycle, UserManagerService } from '@univerjs/core';
import { ITelemetryService } from '../services/telemetry-service';

@OnLifecycle(LifecycleStages.Starting, TelemetryController)
export class TelemetryController extends Disposable {
    constructor(
        @ITelemetryService private readonly _telemetryService: ITelemetryService,
        @Optional(UserManagerService) private readonly _userManagerService: UserManagerService
    ) {
        super();

        this._trackService();
    }

    _trackService() {
        // watch user change
        this.disposeWithMe(this._userManagerService?.currentUser$.subscribe((user) => {
            if (user) {
                this._telemetryService.identify(user.userID, {
                    name: user.name,
                    anonymous: String(Boolean((user as any).anonymous)),
                });
            }
        }));
    }
}
