import { Component, createRef } from '../../Framework';
import { BaseTooltipProps } from '../../Interfaces';
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

export class Tooltip extends Component<BaseTooltipProps, TooltipState> {
    tooltip = createRef<HTMLDivElement>();

    override initialize(props: BaseTooltipProps) {
        this.state = {
            placement: props.placement || 'top',
            placementClassName: joinClassNames(style.tooltipTitle, placementClassNames[props.placement || 'top']),
            top: '',
            left: '',
            show: false,
        };
    }

    handleMouseOver() {
        if (this.tooltip && this.tooltip.current) {
            const tooltipInfo = this.tooltip.current.getBoundingClientRect();
            const top = tooltipInfo.height;
            const left = tooltipInfo.width;

            if (this.state.placement === 'bottom') {
                this.setState({
                    top: top + 10,
                    left: left / 2,
                    show: true,
                });
            } else if (this.state.placement === 'left') {
                this.setState({
                    top: top / 2,
                    left: left + 5,
                    show: true,
                });
            } else if (this.state.placement === 'right') {
                this.setState({
                    top: top / 2,
                    left: -left - 10,
                    show: true,
                });
            } else {
                this.setState({
                    top: -top - 20,
                    left: left / 2,
                    show: true,
                });
            }
        }
    }

    handleMouseLeave() {
        this.setState({
            show: false,
        });
    }

    render() {
        return (
            <div ref={this.tooltip} className={style.tooltipGroup} style={this.props.styles}>
                <div className={style.tooltipBody} onMouseEnter={this.handleMouseOver.bind(this)} onMouseLeave={this.handleMouseLeave.bind(this)}>
                    {this.props.children}
                </div>

                {this.props.title ? (
                    <span
                        className={this.state.placementClassName}
                        style={{
                            top: `${this.state.top}px`,
                            left: `${this.state.left}px`,
                            display: `${this.state.show ? 'block' : 'none'}`,
                        }}
                    >
                        {this.getLabel(this.props.title)}
                        <span className={style.tooltipTriangle}></span>
                    </span>
                ) : null}
            </div>
        );
    }
}
