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

import type { ComponentType } from 'react';

import { Notification } from '../components/notification/Notification';
import { ConfirmPart } from './components/confirm-part/ConfirmPart';
import { ContextMenu } from './components/context-menu/ContextMenu';
import { DialogPart } from './components/dialog-part/DialogPart';
import { GlobalZone } from './components/global-zone/GlobalZone';
import { CanvasPopup } from './components/popup';

export const globalComponents: Set<() => ComponentType> = new Set([
    () => DialogPart,
    () => ConfirmPart,
    () => Notification,
    () => ContextMenu,
    () => GlobalZone,
    () => CanvasPopup,
]);
