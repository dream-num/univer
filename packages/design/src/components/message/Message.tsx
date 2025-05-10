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

import { ErrorSingle, InfoSingle, Loading, SuccessSingle, WarningSingle } from '@univerjs/icons';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from '../../helper/clsx';
import { isBrowser } from '../../helper/is-browser';

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

const iconMap = {
    [MessageType.Success]: <SuccessSingle className="univer-text-green-500" />,
    [MessageType.Info]: (
        <InfoSingle
            className={`
              univer-text-indigo-600
              dark:univer-text-primary-500
            `}
        />
    ),
    [MessageType.Warning]: <WarningSingle className="univer-text-yellow-400" />,
    [MessageType.Error]: <ErrorSingle className="univer-text-red-500" />,
    [MessageType.Loading]: <Loading className="univer-animate-spin univer-text-yellow-400" />,
};

const Message = ({ content, type = MessageType.Info }: IMessageProps) => {
    const icon = useMemo(() => iconMap[type], [type]);

    return (
        <div
            className={clsx(
                `
                  univer-min-w-[320px] univer-max-w-[480px] univer-rounded-xl univer-border univer-border-solid
                  univer-border-gray-200 univer-bg-white univer-p-4 univer-font-sans univer-shadow-md
                  univer-transition-all univer-duration-300 univer-animate-in univer-fade-in univer-slide-in-from-top-4
                  dark:univer-border-gray-600 dark:univer-bg-gray-700
                `
            )}
        >
            <div className="univer-flex univer-gap-2">
                <span className="[&>svg]:univer-relative [&>svg]:univer-top-0.5 [&>svg]:univer-block">
                    {icon}
                </span>
                <p
                    className={`
                      univer-m-0 univer-text-sm univer-text-gray-500 univer-opacity-90
                      dark:univer-text-gray-400
                    `}
                >
                    {content}
                </p>
            </div>
        </div>
    );
};

interface IMessageState {
    messages: IMessageProps[];
}

let messageCount = 0;

const createMessage = (() => {
    let addMessage: (message: Omit<IMessageProps, 'id'>) => void = () => {};
    let removeMessage: (id?: string) => void = () => {};

    const Messager = () => {
        if (!isBrowser()) return null;

        const [state, setState] = useState<IMessageState>({ messages: [] });

        removeMessage = (id?: string) => {
            if (!id) {
                setState({
                    messages: [],
                });
            }

            setState((prev) => ({
                messages: prev.messages.filter((t) => t.id !== id),
            }));
        };

        useEffect(() => {
            addMessage = (message) => {
                const id = String(messageCount++);
                setState((prev) => ({
                    messages: [...prev.messages, { ...message, id }],
                }));

                if (message.duration !== Infinity) {
                    setTimeout(() => {
                        setState((prev) => ({
                            messages: prev.messages.filter((t) => t.id !== id),
                        }));
                    }, message.duration || 3000);
                }
            };
        }, []);

        return createPortal(
            <div
                className={`
                  univer-fixed univer-left-1/2 univer-top-4 univer-z-50 univer-flex -univer-translate-x-1/2
                  univer-flex-col univer-items-center univer-gap-1
                `}
            >
                {state.messages.map((message, index) => (
                    <div
                        key={message.id}
                        style={{
                            position: 'relative',
                            top: `${index * 4}px`,
                            zIndex: 50 - index,
                        }}
                    >
                        <Message {...message} onClose={() => removeMessage(message.id)} />
                    </div>
                ))}
            </div>,
            document.body
        );
    };

    return {
        Messager,
        message: (props: Omit<IMessageProps, 'id'>) => addMessage(props),
        removeMessage,
    };
})();

export const { Messager, message, removeMessage } = createMessage;
