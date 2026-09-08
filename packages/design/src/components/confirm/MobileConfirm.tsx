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

import type { IConfirmProps } from './Confirm';
import { useContext } from 'react';
import { MobileActionRowGroup } from '../action-row/MobileActionRowGroup';
import { Button } from '../button/Button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { MobileDialog } from '../dialog/MobileDialog';

export type IMobileConfirmProps = IConfirmProps;

export function MobileConfirm(props: IMobileConfirmProps) {
    const {
        children,
        visible = false,
        title,
        cancelText,
        confirmText,
        onClose,
        onConfirm,
        closable = true,
    } = props;
    const { locale } = useContext(ConfigContext);

    return (
        <MobileDialog
            open={visible}
            title={title}
            maskClosable={false}
            footer={(
                <MobileActionRowGroup>
                    {closable && <Button onClick={onClose}>{cancelText ?? locale?.Confirm.cancel}</Button>}
                    <Button variant="primary" onClick={onConfirm}>
                        {confirmText ?? locale?.Confirm.confirm}
                    </Button>
                </MobileActionRowGroup>
            )}
            onClose={onClose}
            closable={closable}
        >
            {children}
        </MobileDialog>
    );
}
