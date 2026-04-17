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

import type { UniverType } from './constants/univer';

/** It should be the same as `ICommandInfo` in the frontend. */
export interface IMutation {
    /** ID of the mutation */
    id: string;
    /** serialized params */
    data: string;
}

/** It should be the same as `ICommand` in the frontend. */
export interface ICommand {
    /** ID of the command */
    id: string;
    /** serizlized params */
    data: string;
}

export interface IChangeset {
    /** unitID of the Univer document */
    unitID: string;
    type: UniverType;
    baseRev: number;
    revision: number;
    userID: string;
    mutations: IMutation[];
    memberID: string;
    /** sid works with reqId, represent the id of a unit edit session */
    sid?:
    | string
    | undefined;
    /** reqId works with sid, should be monotonically increasing and begin with 1 in the same edit session */
    reqId?:
    | number
    | undefined;
    /** mutationSize is the size of all mutations in bytes */
    mutationSize?:
    | number
    | undefined;
    /** additionalFields is a reserved field for future use */
    additionalFields?: string | undefined;
    createTime?: number | undefined;
}
