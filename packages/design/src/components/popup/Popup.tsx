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

import type { ReactElement } from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CSSTransition } from 'react-transition-group';
import { ConfigContext } from '../config-provider/ConfigProvider';
import './index.css';

export interface IPopupProps {
    children: ReactElement;

    /**
     * whether popup is visible
     * @default false
     */
    visible?: boolean;

    /**
     * the offset of popup
     * @default [0, 0]
     */
    offset?: [number, number];
}

export function Popup(props: IPopupProps) {
    const { children, visible = false, offset = [0, 0] } = props;

    const nodeRef = useRef(null);

    const [realOffset, setRealOffset] = useState<[number, number]>(offset);

    const { mountContainer } = useContext(ConfigContext);

    useEffect(() => {
        if (!visible) {
            setRealOffset([-9999, -9999]);
            return;
        }

        // edge avoidance
        const [left, top] = offset;
        const { clientWidth, clientHeight } = nodeRef.current!;
        const { innerWidth, innerHeight } = window;
        const x = left + clientWidth > innerWidth ? innerWidth - clientWidth : left;
        const y = top + clientHeight > innerHeight ? innerHeight - clientHeight : top;

        setRealOffset([x, y]);
    }, [offset, visible]);

    function preventDefault(event: React.MouseEvent) {
        event.preventDefault();
    }

    return createPortal(
        <CSSTransition
            in={visible}
            nodeRef={nodeRef}
            timeout={500}
            classNames={{
                enter: 'univer-popup-enter',
                enterActive: 'univer-popup-enter-active',
                enterDone: 'univer-popup-enter-done',
                exitActive: 'univer-popup-exit',
                exitDone: 'univer-popup-exit-active',
            }}
        >
            <section
                ref={nodeRef}
                className="univer-popup"
                style={{
                    // Fix #1089. If the popup does not have this 2px offset, the pointerup event's target would
                    // become the popup itself not the canvas element, hence the selection gesture is not terminated.
                    // It should be considered as debt of the rendering engine.
                    left: realOffset[0] + 2,
                    top: realOffset[1] + 2,
                }}
                onContextMenu={preventDefault}
            >
                {children}
            </section>
        </CSSTransition>,
        mountContainer!
    );
}
