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

import type { EmbedHostEntry } from '@univerjs/embed';

export type EmbedTabPeerWorkbenchRole =
    | 'sheets-main-workbench'
    | 'bases-main-workbench'
    | 'slides-main-workbench';

export type EmbedTabPeerHostHeaderMode =
    | 'hide-host-header'
    | 'extend-host-header';

const TAB_PEER_WORKBENCH_ROLES: Partial<Record<EmbedHostEntry, EmbedTabPeerWorkbenchRole>> = {
    'sheets-sheet-tab': 'sheets-main-workbench',
    'bases-table-list-block': 'bases-main-workbench',
    'slides-page-list-block': 'slides-main-workbench',
};

const TAB_PEER_HOST_HEADER_MODES: Partial<Record<EmbedHostEntry, EmbedTabPeerHostHeaderMode>> = {
    'sheets-sheet-tab': 'hide-host-header',
    'bases-table-list-block': 'hide-host-header',
    'slides-page-list-block': 'extend-host-header',
};

export function isEmbedTabPeerEntry(entry: EmbedHostEntry): boolean {
    return TAB_PEER_WORKBENCH_ROLES[entry] != null;
}

export function getEmbedTabPeerWorkbenchRole(entry: EmbedHostEntry): EmbedTabPeerWorkbenchRole | undefined {
    return TAB_PEER_WORKBENCH_ROLES[entry];
}

export function getEmbedTabPeerHostHeaderMode(entry: EmbedHostEntry): EmbedTabPeerHostHeaderMode | undefined {
    return TAB_PEER_HOST_HEADER_MODES[entry];
}
