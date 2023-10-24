import { Close16, Fail16, Success16, Warning16 } from '@univerjs/icons';
import { useNotification } from 'rc-notification';
import { Placement } from 'rc-notification/es/interface';
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';

import { joinClassNames } from '../../Utils/util';
import styles from './index.module.less';

export type NotificationType = 'success' | 'warning' | 'error';

const iconMap = {
    success: <Success16 className={styles.messageIconSuccess} />,
    warning: <Warning16 className={styles.messageIconWarning} />,
    error: <Fail16 className={styles.messageIconError} />,
};

interface INotificationProps {
    content: string;
    title?: string;
    type?: NotificationType;
    closeIcon?: React.ReactNode;
    closable?: boolean;
    maxCount?: number;
    duration?: number;
    placement?: Placement;
}

export const notificationObserver = new Subject<INotificationProps>();

export const PureContent = (props: INotificationMethodOptions) => {
    const { type, content, title } = props;

    const className = joinClassNames(styles.notificationContainer, type);

    const contentElement = (
        <div className={className}>
            <span className={styles.notificationIcon}>{iconMap[type]}</span>
            {title ? <span className={styles.notificationTitle}>{title}</span> : ''}
            <span className={styles.notificationContent}>{content}</span>
        </div>
    );

    return contentElement;
};

export function Notification(props: INotificationProps) {
    const { maxCount = 3 } = props;
    const [api, contextHolder] = useNotification({
        prefixCls: styles.notification,
        maxCount,
    });

    const observerRef = useRef(notificationObserver);

    useEffect(() => {
        const subscription = observerRef.current.subscribe((options) => {
            api.open({
                content: (
                    <PureContent content={options.content} type={options.type || 'success'} title={options.title} />
                ),
                placement: options.placement || 'topRight',
                duration: options.duration || 0,
                closable: options.closable || true,
                closeIcon: options.closeIcon || <Close16 />,
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
    content: string = 'notification';

    constructor() {
        this.div = document.createElement('div');
        document.body.appendChild(this.div);
        this.root = createRoot(this.div);

        this.render();
    }

    show(options: INotificationMethodOptions) {
        const { content } = options;
        this.content = content;
        notificationObserver.next(options);
    }

    render() {
        this.root.render(<Notification content={this.content} />);
    }
}

export type INotificationMethodOptions = { type: NotificationType; title?: string; content: string };

const instance = new NotificationInstance();

const notification = {
    show: (options: INotificationMethodOptions) => instance.show(Object.assign(options)),
};

export { notification };
