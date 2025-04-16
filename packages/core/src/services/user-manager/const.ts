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

import type { IUser } from '@univerjs/protocol';
import { UnitRole } from '@univerjs/protocol';

import { Tools } from '../../shared/tools';

const nameMap = {
    [UnitRole.Editor]: 'Editor',
    [UnitRole.Owner]: 'Owner',
    [UnitRole.Reader]: 'Reader',
    [UnitRole.UNRECOGNIZED]: 'UNRECOGNIZED',
};
export const createDefaultUser = (type?: UnitRole) => {
    if (!type) {
        return {
            userID: '',
            name: '',
            avatar: '',
            anonymous: true,
            canBindAnonymous: false,
        } as IUser;
    }
    const user = {
        userID: `${nameMap[type]}_${Tools.generateRandomId(8)}`,
        name: nameMap[type],
        avatar: '',
    } as IUser;
    return user;
};
export const isDevRole = (userId: string, type: UnitRole) => {
    return userId.startsWith(nameMap[type]);
};
