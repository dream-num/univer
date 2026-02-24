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
import { Toaster as Sonner, toast } from 'sonner';
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

export type IMessagerProps = Omit<ComponentProps<typeof Sonner>, 'id' | 'position' | 'visibleToasts' | 'toastOptions'>;

const MESSAGE_TOASTER_ID = 'univer-message-toaster';
const DEFAULT_MESSAGE_DURATION = 3000;
const activeMessageIds = new Set<string>();
const loadingIcon = <LoadingMultiIcon className="univer-animate-spin univer-text-violet-500" />;

let messageCount = 0;

const iconMap: Record<MessageType, ReactNode> = {
    [MessageType.Success]: <SuccessIcon className="univer-text-green-500" />,
    [MessageType.Info]: (
        <InfoIcon
            className={`
              univer-text-sky-500
              dark:!univer-text-sky-400
            `}
        />
    ),
    [MessageType.Warning]: <WarningIcon className="univer-text-amber-500" />,
    [MessageType.Error]: <ErrorIcon className="univer-text-red-500" />,
    [MessageType.Loading]: loadingIcon,
};

const typeClassMap: Record<MessageType, string> = {
    [MessageType.Success]: '[&_[data-icon]]:univer-text-green-500',
    [MessageType.Info]: '[&_[data-icon]]:univer-text-sky-500',
    [MessageType.Warning]: '[&_[data-icon]]:univer-text-amber-500',
    [MessageType.Error]: '[&_[data-icon]]:univer-text-red-500',
    [MessageType.Loading]: '[&_[data-icon]]:univer-text-violet-500',
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
    <Sonner
        id={MESSAGE_TOASTER_ID}
        position="top-center"
        visibleToasts={4}
        closeButton={false}
        expand={false}
        icons={{ loading: loadingIcon }}
        offset={{ top: 16 }}
        className={clsx(
            `
              [&_[data-sonner-toast]]:univer-bg-white/95
              dark:[&_[data-sonner-toast]]:!univer-bg-gray-800/95
              [&_[data-sonner-toast]]:univer-rounded-2xl [&_[data-sonner-toast]]:univer-border
              [&_[data-sonner-toast]]:univer-border-solid [&_[data-sonner-toast]]:univer-border-gray-200
              [&_[data-sonner-toast]]:univer-shadow-[0_16px_40px_-20px_rgba(15,23,42,0.55)]
              [&_[data-sonner-toast]]:univer-backdrop-blur-sm
              dark:[&_[data-sonner-toast]]:!univer-border-gray-600
            `,
            className
        )}
        toastOptions={{
            duration: DEFAULT_MESSAGE_DURATION,
            classNames: {
                toast: `
                  univer-group univer-min-h-0 univer-min-w-[320px] univer-max-w-[520px] univer-px-3.5 univer-py-3
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
