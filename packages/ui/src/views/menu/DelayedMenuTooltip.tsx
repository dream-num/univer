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

import type { ITooltipProps } from '@univerjs/design';
import { Tooltip } from '@univerjs/design';
import { useCallback, useEffect, useRef, useState } from 'react';

const TOOLTIP_HOVER_OPEN_DELAY = 100;

export function DelayedMenuTooltip(props: Omit<ITooltipProps, 'visible' | 'onVisibleChange'>) {
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const handleVisibleChange = (nextVisible: boolean) => {
        clearTimer();
        if (nextVisible) {
            timerRef.current = setTimeout(() => {
                timerRef.current = null;
                setVisible(true);
            }, TOOLTIP_HOVER_OPEN_DELAY);
        } else {
            setVisible(false);
        }
    };

    useEffect(() => clearTimer, [clearTimer]);

    return (
        <Tooltip
            {...props}
            visible={visible}
            onVisibleChange={handleVisibleChange}
        />
    );
}
