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

import type { IListMentionParam, IListMentionResponse, IMentionIOService } from './type';
import { Inject } from '@wendellhu/redi';
import { MentionType } from '../../types/enum';
import { UserManagerService } from '../user-manager/user-manager.service';

export class MentionIOLocalService implements IMentionIOService {
    constructor(
        @Inject(UserManagerService) private _userManagerService: UserManagerService
    ) {}

    async list(params: IListMentionParam): Promise<IListMentionResponse> {
        return {
            list: [{
                type: MentionType.PERSON,
                mentions: [
                    {
                        objectType: MentionType.PERSON,
                        objectId: this._userManagerService.getCurrentUser().userID,
                        label: this._userManagerService.getCurrentUser().name,
                        metadata: {
                            icon: this._userManagerService.getCurrentUser().avatar,
                        },
                    },
                ],
                metadata: {},
                title: 'PEOPLE',
            }],
            page: params.page,
            size: params.size,
            total: 1,
        };
    }
}
