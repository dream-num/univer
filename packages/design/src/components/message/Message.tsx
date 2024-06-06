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

import { ErrorSingle, Loading, SuccessSingle, WarningSingle } from '@univerjs/icons';
import { render, unmount } from 'rc-util/lib/React/render';
import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import canUseDom from 'rc-util/lib/Dom/canUseDom';
import type { IDisposable } from '../../type';

import styles from './index.module.less';

export enum MessageType {
    Success = 'success',
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
    Loading = 'loading',
}

export interface IMessageProps {
    key: string;
    type: MessageType;
    content: string;
    icon?: ReactElement;
    style?: CSSProperties;
}

export interface IMessageOptions extends
    Partial<Pick<IMessageProps, 'key' | 'type'>>,
    Pick<IMessageProps, 'content'> {

    /**
     * After `duration` milliseconds, the message would be removed automatically. However, if `duration` is set to 0,
     * the message would not be removed automatically.
     */
    duration?: number;
}

const iconMap = {
    [MessageType.Success]: <SuccessSingle className={styles.messageIconSuccess} />,
    [MessageType.Info]: <WarningSingle className={styles.messageIconInfo} />,
    [MessageType.Warning]: <WarningSingle className={styles.messageIconWarning} />,
    [MessageType.Error]: <ErrorSingle className={styles.messageIconError} />,
    [MessageType.Loading]: <Loading className={styles.messageIconError} />,
};

const MessageItem = (props: IMessageProps) => {
    const { type, content, icon, style } = props;

    const messageElement = (
        <div className={styles.messageItem} style={style}>
            <div className={styles.messageContent}>
                <span className={styles.messageIcon}>{icon || iconMap[type]}</span>
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

export class Message implements IDisposable {
    protected _container: HTMLDivElement;

    protected _messages: IMessageProps[] = [];

    constructor(container: HTMLElement) {
        if (canUseDom()) {
            this._container = document.createElement('div');
            container.appendChild(this._container);
        } else {
            this._container = container as HTMLDivElement;
        }

        this.render();
    }

    dispose(): void {
        unmount(this._container);
        this._container.remove();
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

        if (duration !== 0) {
            setTimeout(() => this.teardown(key), duration);
        }

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

    loading(options: IMessageOptions): IDisposable {
        return this.append(MessageType.Loading, options);
    }
}
