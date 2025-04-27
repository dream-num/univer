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

import type { ILocale } from '../../locale/interface';

import React, { useContext } from 'react';
import { Button } from '../button/Button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { Dialog } from '../dialog/Dialog';

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

    /**
     * The width of the Confirm.
     */
    width?: number | string;

}

function Footer(props: { locale: ILocale['design']; cancelText?: string; confirmText?: string; onClose: (() => void) | undefined; onConfirm: (() => void) | undefined }) {
    const { locale, cancelText, confirmText, onClose, onConfirm } = props;

    return (
        <footer className="univer-flex univer-items-center univer-justify-end univer-gap-2">
            <Button onClick={onClose}>{cancelText ?? locale?.Confirm.cancel}</Button>
            <Button variant="primary" onClick={onConfirm}>
                {confirmText ?? locale?.Confirm.confirm}
            </Button>
        </footer>
    );
}

export function Confirm(props: IConfirmProps) {
    const { children, visible = false, title, cancelText, confirmText, width, onClose, onConfirm } = props;
    const { locale } = useContext(ConfigContext);

    return (
        <Dialog
            open={visible}
            title={title}
            maskClosable={false}
            footer={(
                <Footer
                    locale={locale!}
                    cancelText={cancelText}
                    confirmText={confirmText}
                    onClose={onClose}
                    onConfirm={onConfirm}
                />
            )}
            onClose={onClose}
            width={width}
        >
            {children}
        </Dialog>
    );
}
