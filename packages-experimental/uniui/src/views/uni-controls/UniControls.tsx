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

import type { IProjectNode } from '../../services/unit-grid/unit-grid.service';
import { borderClassName, Button, clsx, Dropdown, Tooltip } from '@univerjs/design';
import { CheckMarkSingle, FullscreenSingle, IncreaseSingle, ZoomReduceSingle } from '@univerjs/icons';
import { ISidebarService, useDependency } from '@univerjs/ui';
import { useReactFlow } from '@xyflow/react';
import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import { IUnitGridService } from '../../services/unit-grid/unit-grid.service';
import { UniDiv } from '../uni-toolbar/UniFloatToolbar';

export const UniControlButton = (props: { tooltips: string; children?: React.ReactElement; onClick: () => void; style?: React.CSSProperties }) => {
    const { children, onClick, style, tooltips } = props;
    return (
        <Tooltip title={tooltips}>
            <Button
                variant="text"
                className="univer-p-1.5"
                onClick={onClick}
                style={style}
            >
                {children}
            </Button>
        </Tooltip>

    );
};

export const MAX_ZOOM = 2;
export const MIN_ZOOM = 0.1;
export const DEFAULT_ZOOM = 1;

// 0 means fit view
const shortcuts = [10, 50, 75, 100, 125, 150, 200, 0];

export enum UniControlItem {
    AI = 'AI',
}

// The component on the bottom right corner of the screen, providing zoom in, zoom out, fit view,
// and AI button and other shared functionalities.
export const UniControls = ({ zoom, onItemClick }: { zoom: number; onItemClick?: (key: UniControlItem) => void }) => {
    const unitGridService = useDependency(IUnitGridService);
    const { zoomIn, zoomOut, fitView, getNodes, setCenter, getZoom } = useReactFlow();

    const zoomPercent = Math.floor(zoom * 100);
    const rightPadding = useRightSidebarVisible() ? 360 : 12;

    const onZoomInHandler = () => {
        zoomIn();
    };
    const onZoomOutHandler = () => {
        zoomOut();
    };

    const onFullscreenHandler = () => {
        document.body.requestFullscreen();
    };

    const setZoomAtCenter = useCallback((zoom: number) => {
        const nodes = getNodes();
        const xLeftPositions = nodes.map((node) => node.position.x);
        const xRightPositions = nodes.map((node) => node.position.x + (node.measured?.width ?? 0));
        const yTopPositions = nodes.map((node) => node.position.y);
        const yDownPositions = nodes.map((node) => node.position.y + (node.measured?.height ?? 0));
        const centerX = (Math.min(...xLeftPositions) + Math.max(...xRightPositions)) / 2;
        const centerY = (Math.min(...yTopPositions) + Math.max(...yDownPositions)) / 2;
        setCenter(centerX, centerY, { zoom });
    }, [getNodes, setCenter]);

    const handleFitView = (node: IProjectNode | null) => {
        if (node) {
            const { x, y } = node.position;
            const width = Number.parseInt(`${node.style?.width}`) || 0;
            const height = Number.parseInt(`${node.style?.height}`) || 0;

          // Use the setCenter method to position the viewport to the center of the node.
            setCenter(x + width / 2, y + height / 2, {
                duration: 300,
                zoom: 1,
            });
        }
    };
    const onZoomMenuChange = useCallback((value: number) => {
        if (value === 0) {
            fitView();
        } else {
            setZoomAtCenter(value / 100);
        }
    }, [setZoomAtCenter, fitView]);

    useLayoutEffect(() => {
        setTimeout(() => {
            setZoomAtCenter(1);
        }, 1000);
    }, [setZoomAtCenter]);

    useEffect(() => {
        const newNodeSubscribe = unitGridService.newNode$.subscribe((node) => handleFitView(node));

        // const timer = setTimeout(() => {
        //     fitView();
        // }, 1000);

        return () => {
            // clearTimeout(timer);
            newNodeSubscribe.unsubscribe();
        };
    }, [fitView]);

    return (
        <div
            className={clsx(`
              univer-fixed univer-bottom-3 univer-right-3 univer-flex univer-w-fit univer-items-center univer-gap-3
              univer-rounded-[10px] univer-bg-white univer-p-2 univer-shadow
            `, borderClassName)}
            style={{ right: `${rightPadding}px` }}
        >
            <UniControlButton tooltips="Full screen" onClick={onFullscreenHandler}>
                <FullscreenSingle />
            </UniControlButton>
            <UniControlButton tooltips="Zoom in" onClick={onZoomInHandler}>
                <IncreaseSingle />
            </UniControlButton>
            <Dropdown
                overlay={(
                    <div
                        className={`
                          univer-box-border univer-grid univer-w-32 univer-items-center univer-gap-1 univer-p-4
                          univer-text-xs
                        `}
                    >
                        {shortcuts?.map((item) => (
                            <a
                                key={item}
                                className={clsx(
                                    `
                                      univer-relative univer-box-border univer-cursor-pointer univer-py-1 univer-pl-9
                                      univer-text-gray-900
                                      dark:univer-text-white
                                    `,
                                    `
                                      univer-rounded univer-no-underline univer-transition-colors univer-duration-200
                                      hover:univer-bg-gray-100
                                    `,
                                    item === zoomPercent ? 'univer-bg-gray-100' : ''
                                )}
                                onClick={() => onZoomMenuChange(item)}
                            >
                                {item === zoomPercent && (
                                    <span
                                        className={`
                                          univer-absolute univer-left-1 univer-top-0 univer-flex univer-h-full
                                          univer-items-center univer-text-green-600
                                        `}
                                    >
                                        <CheckMarkSingle />
                                    </span>
                                )}
                                <span>
                                    {item === 0 ? 'Fit View' : `${item}%`}
                                </span>
                            </a>
                        ))}
                    </div>
                )}
            >
                <a
                    className={clsx(
                        `
                          univer-h-7 univer-w-[55px] univer-cursor-pointer univer-rounded univer-text-center
                          univer-text-xs univer-leading-loose univer-text-gray-700 univer-no-underline
                          univer-transition-all univer-duration-200
                          group-data-[open=true]:univer-bg-gray-200
                          hover:univer-bg-gray-200
                        `
                    )}
                >
                    {zoomPercent}
                    %
                </a>
            </Dropdown>
            <UniControlButton tooltips="Zoom out" onClick={onZoomOutHandler}>
                <ZoomReduceSingle />
            </UniControlButton>
            <UniDiv />
            <UniControlButton tooltips="AI" onClick={() => onItemClick?.(UniControlItem.AI)} style={{ background: '#274FEE' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5.09091 19C4.63904 19 4.27273 18.6337 4.27273 18.1818C4.27273 17.7299 4.63904 17.3636 5.09091 17.3636C5.54278 17.3636 5.90909 17.7299 5.90909 18.1818C5.90909 18.6337 5.54278 19 5.09091 19Z" fill="white" />
                    <path d="M14.9091 2.63636C14.4572 2.63636 14.0909 2.27005 14.0909 1.81818C14.0909 1.36631 14.4572 1 14.9091 1C15.361 1 15.7273 1.36631 15.7273 1.81818C15.7273 2.27005 15.361 2.63636 14.9091 2.63636Z" fill="white" />
                    <path d="M18.1818 5.90909C17.7299 5.90909 17.3636 5.54278 17.3636 5.09091C17.3636 4.63904 17.7299 4.27273 18.1818 4.27273C18.6337 4.27273 19 4.63904 19 5.09091C19 5.54278 18.6337 5.90909 18.1818 5.90909Z" fill="white" />
                    <path d="M8.93208 4.29446C9.20363 3.17457 10.7964 3.17457 11.0679 4.29446L11.8151 7.3759C11.9121 7.77574 12.2243 8.08792 12.6241 8.18487L15.7055 8.93208C16.8254 9.20363 16.8254 10.7964 15.7055 11.0679L12.6241 11.8151C12.2243 11.9121 11.9121 12.2243 11.8151 12.6241L11.0679 15.7055C10.7964 16.8254 9.20363 16.8254 8.93208 15.7055L8.18487 12.6241C8.08792 12.2243 7.77574 11.9121 7.3759 11.8151L4.29446 11.0679C3.17457 10.7964 3.17457 9.20363 4.29446 8.93208L7.3759 8.18487C7.77574 8.08792 8.08792 7.77574 8.18487 7.3759L8.93208 4.29446Z" fill="white" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M18.4393 12.4507C18.8203 12.5929 19.0139 13.0171 18.8717 13.3981C17.9506 15.8661 16.0383 17.8485 13.6187 18.8611C13.2435 19.0181 12.8121 18.8412 12.6551 18.4661C12.4981 18.0909 12.675 17.6595 13.0501 17.5025C15.0952 16.6467 16.7134 14.9692 17.4919 12.8831C17.6341 12.5021 18.0583 12.3085 18.4393 12.4507Z" fill="white" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M7.56245 1.56016C7.70495 1.94106 7.51169 2.36536 7.1308 2.50786C5.03326 3.29259 3.34878 4.92965 2.49933 6.9978C2.34482 7.37399 1.9146 7.55369 1.53842 7.39918C1.16223 7.24467 0.982523 6.81445 1.13703 6.43827C2.14164 3.99234 4.13199 2.05736 6.61475 1.1285C6.99565 0.986002 7.41995 1.17926 7.56245 1.56016Z" fill="white" />
                    <path d="M1.81818 15.7273C1.36631 15.7273 1 15.361 1 14.9091C1 14.4572 1.36631 14.0909 1.81818 14.0909C2.27005 14.0909 2.63636 14.4572 2.63636 14.9091C2.63636 15.361 2.27005 15.7273 1.81818 15.7273Z" fill="white" />
                </svg>
            </UniControlButton>
        </div>
    );
};

function useRightSidebarVisible() {
    const sidebarService = useDependency(ISidebarService);
    const [visible, setVisible] = React.useState(false);
    useEffect(() => {
        const sidebarSubscription = sidebarService.sidebarOptions$.subscribe((options) => {
            setVisible(!!options.visible);
        });

        return () => {
            sidebarSubscription.unsubscribe();
        };
    }, [sidebarService]);

    return visible;
}
