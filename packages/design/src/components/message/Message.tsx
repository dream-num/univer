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

import { ErrorSingle, SuccessSingle, WarningSingle } from '@univerjs/icons';
import { render } from 'rc-util/lib/React/render';
import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import styles from './index.module.less';

export enum MessageType {
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
}

export interface IMessageProps {
    key: number;
    type: MessageType;
    content?: string;
}

export interface IMessageMethodOptions {
    content: string;
    delay?: number;
}

const iconMap = {
    [MessageType.Success]: <SuccessSingle className={styles.messageIconSuccess} />,
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
    private _div: HTMLDivElement;
    private _messages: IMessageProps[] = [];

    constructor(container: HTMLElement) {
        this._div = document.createElement('div');
        container.appendChild(this._div);

        this.render();
    }

    append(type: MessageType, options: IMessageMethodOptions) {
        const { content, delay = 3000 } = options;
        const key = Date.now();

        this._messages.push({
            key,
            type,
            content,
        });

        setTimeout(() => {
            this.teardown(key);
        }, delay);

        this.render();
    }

    teardown(key: number) {
        this._messages = this._messages.filter((message) => message.key !== key);

        this.render();
    }

    render() {
        render(<MessageContainer messages={this._messages} />, this._div);
    }

    success(options: IMessageMethodOptions) {
        this.append(MessageType.Success, options);
    }

    warning(options: IMessageMethodOptions) {
        this.append(MessageType.Warning, options);
    }

    error(options: IMessageMethodOptions) {
        this.append(MessageType.Error, options);
    }
}
