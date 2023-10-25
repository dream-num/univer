import { Close16, Fail16, Success16, Warning16 } from '@univerjs/icons';
import { useNotification } from 'rc-notification';
import { Placement } from 'rc-notification/es/interface';
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';

import { joinClassNames } from '../../Utils/util';
import styles from './index.module.less';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

const iconMap = {
    success: <Success16 className={styles.notificationIconSuccess} />,
    info: <Warning16 className={styles.notificationIconInfo} />,
    warning: <Warning16 className={styles.notificationIconWarning} />,
    error: <Fail16 className={styles.notificationIconError} />,
};

export interface INotificationMethodOptions {
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
     * popup position
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

interface INotificationProps extends INotificationMethodOptions {
    /**
     * close button icon
     */
    closeIcon?: React.ReactNode;

    /**
     * The maximum number of displays. When the limit is exceeded, the oldest message will be automatically closed.
     */
    maxCount?: number;
}

export const notificationObserver = new Subject<INotificationMethodOptions>();

export const PureContent = (props: INotificationMethodOptions) => {
    const { type, content, title, lines = 0 } = props;

    const contentClassName = joinClassNames(styles.notificationContent, {
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

export function Notification(props: INotificationProps) {
    const { maxCount = 3 } = props;
    const [api, contextHolder] = useNotification({
        prefixCls: styles.notification,
        maxCount,
        closeIcon: <Close16 />,
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
                placement: options.placement ?? 'topRight',
                duration: options.duration ?? 4.5,
                closable: options.closable ?? true,
            });
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return <>{contextHolder}</>;
}

class NotificationInstance {
    div: HTMLDivElement;
    root: ReturnType<typeof createRoot>;

    constructor() {
        this.div = document.createElement('div');
        document.body.appendChild(this.div);
        this.root = createRoot(this.div);

        this.render();
    }

    show(options: INotificationMethodOptions) {
        notificationObserver.next(options);
    }

    render() {
        this.root.render(<Notification content="" title="" type="success" />);
    }
}

const instance = new NotificationInstance();

const notification = {
    show: (options: INotificationMethodOptions) => instance.show(options),
};

export { notification };
