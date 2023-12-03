import { ComponentType } from 'react';

import { Notification } from '../components/notification/Notification';
import { ConfirmPart } from './components/confirm-part/ConfirmPart';
import { ContextMenu } from './components/context-menu/ContextMenu';
import { DialogPart } from './components/dialog-part/DialogPart';

export const globalComponents: Set<() => ComponentType> = new Set([
    () => DialogPart,
    () => ConfirmPart,
    () => Notification,
    () => ContextMenu,
]);
