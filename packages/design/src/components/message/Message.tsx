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

/* eslint-disable react-refresh/only-export-components */

import { ErrorSingle, SuccessSingle, WarningSingle } from '@univerjs/icons';
import { render } from 'rc-util/lib/React/render';
import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import type { IDisposable } from '../../type';

import styles from './index.module.less';

export enum MessageType {
    Success = 'success',
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
}

export interface IMessageProps {
    key: string;
    type: MessageType;
    content: string;
}

export interface IMessageOptions extends
    Partial<Pick<IMessageProps, 'key' | 'type' >>,
    Pick<IMessageProps, 'content'> {
    duration?: number;
}

const iconMap = {
    [MessageType.Success]: <SuccessSingle className={styles.messageIconSuccess} />,
    [MessageType.Info]: <WarningSingle className={styles.messageIconInfo} />,
    [MessageType.Warning]: <WarningSingle className={styles.messageIconWarning} />,
    [MessageType.Error]: <ErrorSingle className={styles.messageIconError} />,
};

const MessageItem = (props: IMessageProps) => {
    const { type, content } = props;

    const messageElement = (
        <div className={styles.messageItem}>
            <div className={styles.messageContent}>
                <span className={styles.messageIcon}>{iconMap[type]}</span>
                <span>{content}</span>
            </div>
        </div>
    );

    return messageElement;
};

const MessageContainer = (props: { messages: IMessageProps[] }) => {
    const { messages } = props;

    return (
        <TransitionGroup className={styles.message}>
            {messages.map((message) => (
                <CSSTransition
                    key={message.key}
                    timeout={200}
                    classNames={{
                        enterActive: styles.enterActive,
                        enterDone: styles.enterDone,
                        exitActive: styles.exit,
                        exitDone: styles.exitActive,
                    }}
                >
                    <MessageItem {...message} />
                </CSSTransition>
            ))}
        </TransitionGroup>
    );
};

export class Message {
    protected _container: HTMLDivElement;

    protected _messages: IMessageProps[] = [];

    constructor(container: HTMLElement) {
        this._container = document.createElement('div');
        container.appendChild(this._container);

        this.render();
    }

    append(type: MessageType, options: IMessageOptions): IDisposable {
        const { content, duration = 3000 } = options;
        const key = `${Date.now()}`;

        this._messages.push({
            key,
            type,
            content,
        });

        this.render();

        setTimeout(() => this.teardown(key), duration);
        return { dispose: () => this.teardown(key) };
    }

    teardown(key: string) {
        this._messages = this._messages.filter((message) => message.key !== key);

        this.render();
    }

    render() {
        render(<MessageContainer messages={this._messages} />, this._container);
    }

    success(options: IMessageOptions): IDisposable {
        return this.append(MessageType.Success, options);
    }

    info(options: IMessageOptions): IDisposable {
        return this.append(MessageType.Info, options);
    }

    warning(options: IMessageOptions): IDisposable {
        return this.append(MessageType.Warning, options);
    }

    error(options: IMessageOptions): IDisposable {
        return this.append(MessageType.Error, options);
    }
}
