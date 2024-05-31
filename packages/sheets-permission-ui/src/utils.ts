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

import type { ICollaborator } from '@univerjs/protocol';

export function getUserListEqual(userList1: ICollaborator[], userList2: ICollaborator[]) {
    if (userList1.length !== userList2.length) return false;

    const sorted1 = userList1.sort((a, b) => a.id.localeCompare(b.id));
    const sorted2 = userList2.sort((a, b) => a.id.localeCompare(b.id));

    return sorted1.every((user, index) => {
        return user.subject?.userID === sorted2[index].subject?.userID && user.role === sorted2[index].role;
    });
}
