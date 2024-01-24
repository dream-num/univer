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

export enum PermissionStatus {
    INIT = 'init',
    FETCHING = 'fetching',
    DONE = 'done',
}
export abstract class PermissionPoint<T = any> {
    abstract id: string; // permission
    abstract value: T;
    abstract unitID: string;
    status = PermissionStatus.INIT;
}

export const getTypeFromPermissionItemList = (list: PermissionPoint[]) =>
    list.some((item) => item.status === PermissionStatus.INIT)
        ? PermissionStatus.INIT
        : list.some((item) => item.status === PermissionStatus.FETCHING)
            ? PermissionStatus.FETCHING
            : PermissionStatus.DONE;
