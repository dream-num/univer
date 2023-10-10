import { createRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { joinClassNames } from '../../Utils';
import style from './index.module.less';

interface TooltipState {
    top: number | string;
    left: number | string;
    visible: boolean;
    triangleLeft?: number | string;
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
        triangleLeft: '',
    });

    function handleMouseEnter() {
        if (!tooltipRef?.current || !tooltipContentRef?.current) return;

        const { height, width, x, y } = tooltipRef.current.getBoundingClientRect();

        const { clientWidth } = tooltipContentRef.current;

        let left = x;
        let top = y;
        let triangleLeft = clientWidth / 2 - 5;
        switch (placement) {
            case 'bottom':
                top = y + height + 10;
                left = x + width / 2 - clientWidth / 2;
                break;
            case 'top':
            default:
                top = y + -height - 20;
                left = x + width / 2 - clientWidth / 2;
                break;
        }

        if (left < 0) {
            left = 0;
            triangleLeft = x + width / 2;
        }

        if (x + width / 2 + clientWidth / 2 > document.body.clientWidth) {
            left = document.body.clientWidth - clientWidth;
            triangleLeft = x + width / 2 - left;
        }

        setState({
            top,
            left,
            visible: true,
            triangleLeft,
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
        <div className={style.tooltipGroup} style={styles}>
            <span
                ref={tooltipRef}
                className={style.tooltipBody}
                onMouseMove={handleMouseEnter}
                onMouseOut={handleMouseLeave}
            >
                {children}
            </span>

            {title
                ? createPortal(
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
                                  left: `${state.triangleLeft}px`,
                              }}
                          />
                      </span>,
                      document.body
                  )
                : null}
        </div>
    );
}
