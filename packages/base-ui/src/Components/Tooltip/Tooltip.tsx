import { createRef, useState } from 'react';

import { joinClassNames } from '../../Utils';
import style from './index.module.less';

interface TooltipState {
    top: number | string;
    left: number | string;
    visible: boolean;
    triangleTranslate?: number | string;
}

const placementClassNames: { [index: string]: string } = {
    top: style.tooltipTop,
    bottom: style.tooltipBottom,
};

export interface BaseTooltipProps {
    title?: string;
    children: React.ReactNode;
    placement?: 'top' | 'bottom';
    styles?: React.CSSProperties;
}

export function Tooltip(props: BaseTooltipProps) {
    const { title, children, placement = 'top', styles } = props;

    const tooltipRef = createRef<HTMLDivElement>();
    const tooltipContentRef = createRef<HTMLSpanElement>();
    const [state, setState] = useState<TooltipState>({
        top: '',
        left: '',
        visible: false,
        triangleTranslate: '',
    });

    function handleMouseEnter() {
        if (!tooltipRef?.current || !tooltipContentRef?.current) return;

        const { height, width, x, y } = tooltipRef.current.getBoundingClientRect();

        let left = x;
        let top = y;
        switch (placement) {
            case 'bottom':
                top = y + height + 10;
                left = x + width / 2;
                break;
            case 'top':
            default:
                top = y + -height - 20;
                left = x + width / 2;
                break;
        }

        const { clientWidth } = tooltipContentRef.current;

        let triangleTranslate = '';

        if (left - clientWidth / 2 < 0) {
            triangleTranslate = `${left - clientWidth / 2}px`;
            left = clientWidth / 2;
        }
        if (left + clientWidth / 2 > document.body.clientWidth) {
            triangleTranslate = `${left + clientWidth / 2 - document.body.clientWidth}px`;
            left = document.body.clientWidth - clientWidth / 2;
        }

        setState({
            top,
            left,
            visible: true,
            triangleTranslate,
        });
    }

    function handleMouseLeave() {
        setState({
            ...state,
            visible: false,
        });
    }

    const placementClassName = joinClassNames(style.tooltipTitle, placementClassNames[placement]);

    return (
        <div ref={tooltipRef} className={style.tooltipGroup} style={styles}>
            <div className={style.tooltipBody} onMouseMove={handleMouseEnter} onMouseOut={handleMouseLeave}>
                {children}
            </div>

            {title ? (
                <span
                    ref={tooltipContentRef}
                    className={placementClassName}
                    style={{
                        top: `${state.top}px`,
                        left: `${state.left}px`,
                        visibility: `${state.visible ? 'visible' : 'hidden'}`,
                        zIndex: 100,
                    }}
                >
                    {title}
                    <span
                        className={style.tooltipTriangle}
                        style={{
                            transform: `translateX(${state.triangleTranslate})`,
                        }}
                    />
                </span>
            ) : null}
        </div>
    );
}
