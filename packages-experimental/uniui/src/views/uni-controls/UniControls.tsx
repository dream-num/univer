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

import {
    useReactFlow,
} from '@xyflow/react';
import React, { useState } from 'react';
import { FullscreenSingle, IncreaseSingle, ViewModeSingle, ZoomReduceSingle } from '@univerjs/icons';
import { UniDiv } from '../uni-toolbar/UniFloatToolbar';
import styles from './index.module.less';

export const UniControlButton = (props: { children?: React.ReactElement; onClick: () => void; style?: React.CSSProperties }) => {
    const { children, onClick, style } = props;
    return (
        <div className={styles.uniControlButton} onClick={onClick} style={style}>
            {children}
        </div>
    );
};

export const UniControls = () => {
    const { zoomIn, zoomOut, setViewport, fitView } = useReactFlow();
    const onZoomInHandler = () => {
        zoomIn();
    };
    const onZoomOutHandler = () => {
        zoomOut();
    };

    const onFitViewHandler = () => {
        fitView();
    };

    const onFullscreenHandler = () => {
        document.body.requestFullscreen();
    };
    const [zoomLevel, setZoomLevel] = useState(1);

    return (
        <div className={styles.uniControls}>
            <UniControlButton onClick={onFullscreenHandler}>
                <FullscreenSingle />
            </UniControlButton>
            <UniControlButton onClick={onZoomInHandler}>
                <IncreaseSingle />
            </UniControlButton>
            <UniControlButton onClick={onFitViewHandler}>
                <ViewModeSingle />
            </UniControlButton>
            <UniControlButton onClick={onZoomOutHandler}>
                <ZoomReduceSingle />
            </UniControlButton>
            <UniDiv />
            <UniControlButton onClick={() => {}} style={{ background: '#274FEE' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5.09091 19C4.63904 19 4.27273 18.6337 4.27273 18.1818C4.27273 17.7299 4.63904 17.3636 5.09091 17.3636C5.54278 17.3636 5.90909 17.7299 5.90909 18.1818C5.90909 18.6337 5.54278 19 5.09091 19Z" fill="white" />
                    <path d="M14.9091 2.63636C14.4572 2.63636 14.0909 2.27005 14.0909 1.81818C14.0909 1.36631 14.4572 1 14.9091 1C15.361 1 15.7273 1.36631 15.7273 1.81818C15.7273 2.27005 15.361 2.63636 14.9091 2.63636Z" fill="white" />
                    <path d="M18.1818 5.90909C17.7299 5.90909 17.3636 5.54278 17.3636 5.09091C17.3636 4.63904 17.7299 4.27273 18.1818 4.27273C18.6337 4.27273 19 4.63904 19 5.09091C19 5.54278 18.6337 5.90909 18.1818 5.90909Z" fill="white" />
                    <path d="M8.93208 4.29446C9.20363 3.17457 10.7964 3.17457 11.0679 4.29446L11.8151 7.3759C11.9121 7.77574 12.2243 8.08792 12.6241 8.18487L15.7055 8.93208C16.8254 9.20363 16.8254 10.7964 15.7055 11.0679L12.6241 11.8151C12.2243 11.9121 11.9121 12.2243 11.8151 12.6241L11.0679 15.7055C10.7964 16.8254 9.20363 16.8254 8.93208 15.7055L8.18487 12.6241C8.08792 12.2243 7.77574 11.9121 7.3759 11.8151L4.29446 11.0679C3.17457 10.7964 3.17457 9.20363 4.29446 8.93208L7.3759 8.18487C7.77574 8.08792 8.08792 7.77574 8.18487 7.3759L8.93208 4.29446Z" fill="white" />
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M18.4393 12.4507C18.8203 12.5929 19.0139 13.0171 18.8717 13.3981C17.9506 15.8661 16.0383 17.8485 13.6187 18.8611C13.2435 19.0181 12.8121 18.8412 12.6551 18.4661C12.4981 18.0909 12.675 17.6595 13.0501 17.5025C15.0952 16.6467 16.7134 14.9692 17.4919 12.8831C17.6341 12.5021 18.0583 12.3085 18.4393 12.4507Z" fill="white" />
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.56245 1.56016C7.70495 1.94106 7.51169 2.36536 7.1308 2.50786C5.03326 3.29259 3.34878 4.92965 2.49933 6.9978C2.34482 7.37399 1.9146 7.55369 1.53842 7.39918C1.16223 7.24467 0.982523 6.81445 1.13703 6.43827C2.14164 3.99234 4.13199 2.05736 6.61475 1.1285C6.99565 0.986002 7.41995 1.17926 7.56245 1.56016Z" fill="white" />
                    <path d="M1.81818 15.7273C1.36631 15.7273 1 15.361 1 14.9091C1 14.4572 1.36631 14.0909 1.81818 14.0909C2.27005 14.0909 2.63636 14.4572 2.63636 14.9091C2.63636 15.361 2.27005 15.7273 1.81818 15.7273Z" fill="white" />
                </svg>
            </UniControlButton>
        </div>
    );
};

