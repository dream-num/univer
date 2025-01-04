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

import type { IUser } from '../services/user-manager/user-manager.service';
import { Inject, Injector } from '../common/di';
import { UserManagerService } from '../services/user-manager/user-manager.service';
import { FBase } from './f-base';

export class FUserManager extends FBase {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(UserManagerService) private readonly _userManagerService: UserManagerService
    ) {
        super();
    }

    /**
     * Get current user info.
     * @returns {IUser} Current user info.
     * @example
     * ```typescript
     * univerAPI.getUserManager().getCurrentUser();
     * ```
     */
    getCurrentUser(): IUser {
        return this._userManagerService.getCurrentUser();
    }
}
