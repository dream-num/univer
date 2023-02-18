import { Component, createRef } from '../../Framework';
import { JSXComponent } from '../../BaseComponent';
import { BaseTooltipProps, TooltipComponent } from '../../Interfaces';
import style from './index.module.less';
import { joinClassNames } from '../../Utils';

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
}

const placementClassNames: { [index: string]: string } = {
    top: style.top,
    bottom: style.bottom,
    left: style.left,
    right: style.right,
};

export class Tooltip extends Component<BaseTooltipProps, TooltipState> {
    initialize(props: BaseTooltipProps) {
        this.state = {
            placement: props.placement || 'top',
            placementClassName: joinClassNames(style.tooltipTitle, placementClassNames[props.placement || 'top']),
            top: '',
            left: '',
        };
    }

    tooltip = createRef<HTMLDivElement>();

    handleMouseOver() {
        if (this.tooltip && this.tooltip.current) {
            let tooltipInfo = this.tooltip.current.getBoundingClientRect();
            let top = tooltipInfo.height;
            let left = tooltipInfo.width;

            if (this.state.placement === 'bottom') {
                this.setState({
                    top: top + 10,
                    left: left / 2,
                });
            } else if (this.state.placement === 'left') {
                this.setState({
                    top: top / 2,
                    left: left + 5,
                });
            } else if (this.state.placement === 'right') {
                this.setState({
                    top: top / 2,
                    left: -left - 10,
                });
            } else {
                this.setState({
                    top: -top - 20,
                    left: left / 2,
                });
            }
        }
    }

    render() {
        return (
            <div ref={this.tooltip} className={style.tooltipGroup} style={this.props.styles}>
                <div className={style.tooltipBody} onMouseEnter={this.handleMouseOver.bind(this)}>
                    {this.props.children}
                </div>

                {this.props.title ? (
                    <span
                        className={this.state.placementClassName}
                        style={{
                            top: `${this.state.top}px`,
                            left: `${this.state.left}px`,
                        }}
                    >
                        {this.props.title}
                        <span className={style.tooltipTriangle}></span>
                    </span>
                ) : null}
            </div>
        );
    }
}

export class UniverTooltip implements TooltipComponent {
    render(): JSXComponent<BaseTooltipProps> {
        return Tooltip;
    }
}
