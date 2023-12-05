import React, { useContext } from 'react';

import { Button } from '../button/Button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { Dialog } from '../dialog/Dialog';
import styles from './index.module.less';

export interface IConfirmProps {
    children: React.ReactNode;

    /**
     * Whether the Confirm is visible.
     * @default false
     */
    visible?: boolean;

    /**
     * The title of the Confirm.
     */
    title?: React.ReactNode;

    /**
     * The text of the Confirm's confirm button.
     */
    cancelText?: string;

    /**
     * The text of the Confirm's cancel button.
     */
    confirmText?: string;

    /**
     * Callback when the Confirm is closed.
     */
    onClose?: () => void;

    /**
     * Callback when the Confirm is confirmed.
     */
    onConfirm?: () => void;
}

export function Confirm(props: IConfirmProps) {
    const { children, visible = false, title, cancelText, confirmText, onClose, onConfirm } = props;

    const { locale } = useContext(ConfigContext);

    function Footer() {
        return (
            <footer className={styles.confirmFooter}>
                <Button onClick={onClose}>{cancelText ?? locale.design.Confirm.cancel}</Button>
                <Button type="primary" onClick={onConfirm}>
                    {confirmText ?? locale.design.Confirm.confirm}
                </Button>
            </footer>
        );
    }

    return (
        <Dialog visible={visible} title={title} footer={<Footer />} onClose={onClose}>
            {children}
        </Dialog>
    );
}
