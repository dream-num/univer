import { createRef, useState } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import { joinClassNames } from '../../Utils';
import style from './index.module.less';

// interface TooltipProps {
//     title: string;
//     children: ComponentChildren;
//     placement?: string;
//     color?: string;
//     styles?: {};
//     [index: number]: string;
// }

interface TooltipState {
    placement: string;
    placementClassName: string | undefined;
    top: number | string;
    left: number | string;
    show: boolean;
}

const placementClassNames: { [index: string]: string } = {
    top: style.top,
    bottom: style.bottom,
    left: style.left,
    right: style.right,
};

export interface BaseTooltipProps extends BaseComponentProps {
    [index: number]: string;

    title?: string;
    shortcut?: string;
    children: React.ReactNode;
    placement?: string;
    color?: string;
    styles?: {};
}

export function Tooltip(props: BaseTooltipProps) {
    const tooltip = createRef<HTMLDivElement>();
    const [state, setState] = useState<TooltipState>({
        placement: props.placement || 'top',
        placementClassName: joinClassNames(style.tooltipTitle, placementClassNames[props.placement || 'top']),
        top: '',
        left: '',
        show: false,
    });

    function handleMouseOver() {
        if (tooltip?.current) {
            const tooltipInfo = tooltip.current.getBoundingClientRect();
            const top = tooltipInfo.height;
            const left = tooltipInfo.width;

            if (state.placement === 'bottom') {
                setState({
                    ...state,
                    top: top + 10,
                    left: left / 2,
                    show: true,
                });
            } else if (state.placement === 'left') {
                setState({
                    ...state,
                    top: top / 2,
                    left: left + 5,
                    show: true,
                });
            } else if (state.placement === 'right') {
                setState({
                    ...state,
                    top: top / 2,
                    left: -left - 10,
                    show: true,
                });
            } else {
                setState({
                    ...state,
                    top: -top - 20,
                    left: left / 2,
                    show: true,
                });
            }
        }
    }

    function handleMouseLeave() {
        setState({
            ...state,
            show: false,
        });
    }

    return (
        <div ref={tooltip} className={style.tooltipGroup} style={props.styles}>
            <div className={style.tooltipBody} onMouseEnter={handleMouseOver} onMouseLeave={handleMouseLeave}>
                {props.children}
            </div>

            {props.title ? (
                <span
                    className={state.placementClassName}
                    style={{
                        top: `${state.top}px`,
                        left: `${state.left}px`,
                        display: `${state.show ? 'block' : 'none'}`,
                    }}
                >
                    {props.title}
                    <span className={style.tooltipTriangle}></span>
                </span>
            ) : null}
        </div>
    );
}
