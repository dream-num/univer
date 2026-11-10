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

import type { ComponentProps, ReactNode } from 'react';
import { ErrorIcon, InfoIcon, LoadingMultiIcon, SuccessIcon, WarningIcon } from '@univerjs/icons';
import { toast, Toaster } from 'sonner';
import { notificationClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';

export enum MessageType {
    Success = 'success',
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
    Loading = 'loading',
}

export interface IMessageProps {
    id?: string;
    content: string;
    duration?: number;
    type?: MessageType;
    onClose?: () => void;
}

export type IMessagerProps = Omit<ComponentProps<typeof Toaster>, 'id' | 'position' | 'visibleToasts' | 'toastOptions'>;

const MESSAGE_TOASTER_ID = 'univer-message-toaster';
const DEFAULT_MESSAGE_DURATION = 3000;
const activeMessageIds = new Set<string>();
const loadingIcon = (
    <LoadingMultiIcon
        className="
          univer-animate-spin univer-text-primary-600
          dark:!univer-text-primary-300
        "
    />
);

let messageCount = 0;

const iconMap: Record<MessageType, ReactNode> = {
    [MessageType.Success]: (
        <SuccessIcon
            className="
              univer-text-green-600
              dark:!univer-text-green-400
            "
        />
    ),
    [MessageType.Info]: (
        <InfoIcon
            className={`
              univer-text-primary-600
              dark:!univer-text-primary-300
            `}
        />
    ),
    [MessageType.Warning]: (
        <WarningIcon
            className="
              univer-text-yellow-600
              dark:!univer-text-yellow-400
            "
        />
    ),
    [MessageType.Error]: (
        <ErrorIcon
            className="
              univer-text-red-600
              dark:!univer-text-red-400
            "
        />
    ),
    [MessageType.Loading]: loadingIcon,
};

const typeClassMap: Record<MessageType, string> = {
    [MessageType.Success]: '[&_[data-icon]]:univer-text-green-600 dark:[&_[data-icon]]:!univer-text-green-400',
    [MessageType.Info]: '[&_[data-icon]]:univer-text-primary-600 dark:[&_[data-icon]]:!univer-text-primary-300',
    [MessageType.Warning]: '[&_[data-icon]]:univer-text-yellow-600 dark:[&_[data-icon]]:!univer-text-yellow-400',
    [MessageType.Error]: '[&_[data-icon]]:univer-text-red-600 dark:[&_[data-icon]]:!univer-text-red-400',
    [MessageType.Loading]: '[&_[data-icon]]:univer-text-primary-600 dark:[&_[data-icon]]:!univer-text-primary-300',
};

const resolveToastMethod = (type: MessageType) => {
    switch (type) {
        case MessageType.Success:
            return toast.success;
        case MessageType.Warning:
            return toast.warning;
        case MessageType.Error:
            return toast.error;
        case MessageType.Loading:
            return toast.loading;
        case MessageType.Info:
        default:
            return toast.info;
    }
};

const createMessageId = () => {
    const id = `univer-message-${messageCount}`;
    messageCount += 1;
    return id;
};

export const Messager = ({ className, ...props }: IMessagerProps) => (
    <Toaster
        id={MESSAGE_TOASTER_ID}
        position="top-center"
        visibleToasts={4}
        closeButton={false}
        expand={false}
        icons={{ loading: loadingIcon }}
        offset={{ top: 16 }}
        className={clsx(notificationClassName, className)}
        toastOptions={{
            duration: DEFAULT_MESSAGE_DURATION,
            classNames: {
                toast: `
                  univer-group univer-min-h-0 univer-min-w-0 univer-max-w-[520px] univer-px-3.5 univer-py-3
                  univer-font-sans univer-transition-all univer-duration-300
                `,
                title: `
                  univer-m-0 univer-font-sans univer-text-sm univer-font-medium univer-leading-5 univer-text-gray-700
                  dark:!univer-text-gray-100
                `,
                content: 'univer-gap-2.5',
                icon: '[&>svg]:univer-block [&>svg]:univer-size-4',
                success: typeClassMap[MessageType.Success],
                info: typeClassMap[MessageType.Info],
                warning: typeClassMap[MessageType.Warning],
                error: typeClassMap[MessageType.Error],
                loading: typeClassMap[MessageType.Loading],
            },
        }}
        {...props}
    />
);

export const message = ({ content, duration, id, onClose, type = MessageType.Info }: IMessageProps) => {
    const messageId = id ?? createMessageId();
    const method = resolveToastMethod(type);
    let closed = false;

    const handleClose = () => {
        if (closed) return;

        closed = true;
        activeMessageIds.delete(messageId);
        onClose?.();
    };

    method(content, {
        id: messageId,
        toasterId: MESSAGE_TOASTER_ID,
        duration: duration ?? DEFAULT_MESSAGE_DURATION,
        icon: type === MessageType.Loading ? undefined : iconMap[type],
        onDismiss: handleClose,
        onAutoClose: handleClose,
    });

    activeMessageIds.add(messageId);
    return messageId;
};

export const removeMessage = (id?: string) => {
    if (typeof id !== 'undefined') {
        toast.dismiss(id);
        activeMessageIds.delete(id);
        return;
    }

    activeMessageIds.forEach((messageId) => {
        toast.dismiss(messageId);
    });
    activeMessageIds.clear();
};
