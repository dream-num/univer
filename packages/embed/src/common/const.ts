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

import type { ICreateUnitOptions } from '@univerjs/core';

export const EMBED_PLUGIN_NAME = 'UNIVER_EMBED_PLUGIN';
export const EMBED_RESOURCE_PLUGIN_NAME = 'UNIVER_EMBED_RESOURCE_PLUGIN';
export const CREATE_EMBED_HOST_ANCHOR_MUTATION_ID = 'embed.mutation.create-host-anchor';
export const REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID = 'embed.mutation.remove-host-anchor';
export const SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID = 'embed.mutation.set-host-anchor-record';
export const REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID = 'embed.mutation.remove-host-anchor-record';

export const EMBED_CHILD_CREATE_OPTIONS: ICreateUnitOptions = {
    makeCurrent: false,
    skipAutoRender: true,
    embeddedRender: true,
};
