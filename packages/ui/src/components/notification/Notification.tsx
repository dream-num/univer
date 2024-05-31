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

import { ConfigContext } from '@univerjs/design';
import { CloseSingle, ErrorSingle, SuccessSingle, WarningSingle } from '@univerjs/icons';
import clsx from 'clsx';
import { useNotification } from 'rc-notification';
import type { Placement } from 'rc-notification/es/interface';
import React, { useContext, useEffect, useRef } from 'react';
import { Subject } from 'rxjs';

import styles from './index.module.less';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

const iconMap = {
    success: <SuccessSingle className={styles.notificationIconSuccess} />,
    info: <WarningSingle className={styles.notificationIconInfo} />,
    warning: <WarningSingle className={styles.notificationIconWarning} />,
    error: <ErrorSingle className={styles.notificationIconError} />,
};

export interface INotificationOptions {
    /**
     * Key of the notification.
     */
    key?: string;
    /**
     * Component type, optional success, warning, error
     */
    type: NotificationType;
    /**
     * The title text of the notification
     */
    title: string;
    /**
     * The content text of the notification
     */
    content: string;
    /**
     * Popup position
     */
    placement?: Placement;
    /**
     * Automatic close time
     */
    duration?: number;
    /**
     * Whether to support closing
     */
    closable?: boolean;
    /**
     * The number of lines of content text. Ellipses will be displayed beyond the line number.
     */
    lines?: number;
}

export const notificationObserver = new Subject<INotificationOptions>();

export const PureContent = (props: INotificationOptions) => {
    const { type, content, title, lines = 0 } = props;

    const contentClassName = clsx(styles.notificationContent, {
        [styles.notificationContentEllipsis]: lines !== 0,
    });

    return (
        <>
            <span className={styles.notificationIcon}>{iconMap[type]}</span>
            <div className={styles.notificationContentContainer}>
                <span className={styles.notificationTitle}>{title}</span>
                <span className={contentClassName} style={{ WebkitLineClamp: lines }}>
                    {content}
                </span>
            </div>
        </>
    );
};

export function Notification() {
    const { mountContainer } = useContext(ConfigContext);
    if (!mountContainer) return null;

    const [api, contextHolder] = useNotification({
        prefixCls: styles.notification,
        maxCount: 3,
        closeIcon: <CloseSingle />,
        getContainer: () => mountContainer,
        motion: {
            motionName: styles.notificationFade,
            motionAppear: true,
            motionEnter: true,
            motionLeave: true,
        },
    });

    const observerRef = useRef(notificationObserver);

    useEffect(() => {
        const subscription = observerRef.current.subscribe((options) => {
            api.open({
                content: (
                    <PureContent
                        content={options.content}
                        type={options.type}
                        title={options.title}
                        lines={options.lines}
                    />
                ),
                key: options.key,
                placement: options.placement ?? 'topRight',
                duration: options.duration ?? 4.5,
                closable: options.closable ?? true,
            });
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [api]);

    return <>{contextHolder}</>;
}

export const notification = {
    show: (options: INotificationOptions) => {
        notificationObserver.next(options);
    },
};
