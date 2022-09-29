import { BaseRadioGroupProps, BaseRadioIProps, cloneElement, Component, JSXComponent, RadioComponent, VNode } from '@univer/base-component';
import styles from './index.module.less';
// interface IProps {
//     value: string;
//     active?: boolean;
//     onClick?: () => void;
//     label?: string;
// }

interface IState {}

// interface RadioGroupProps {
//     className?: string;
//     active: string | number;
//     vertical?: boolean;
//     onChange: (value: string) => void;
//     children: Array<VNode<IProps>>;
// }

class RadioGroup extends Component<BaseRadioGroupProps, IState> {
    handleActiveChange(value: string) {
        this.props.onChange(value);
    }

    render() {
        const { vertical, className } = this.props;
        return (
            <div className={`${vertical ? styles.radioGroup : ''} ${className || ''}`}>
                {this.props.children.map((item: VNode<BaseRadioIProps>) => {
                    let isActive = this.props.active === item.props.value;
                    /**
                     * 
                     * Use item as VNode
                     * 
                     * fix : No overload matches this call.
                                Overload 1 of 2, '(vnode: VNode<any>, props?: any, ...children: ComponentChildren[]): VNode<any>', gave the following error.
                                Argument of type 'Radio & ComponentChildren' is not assignable to parameter of type 'VNode<any>'.
                    */
                    return cloneElement(item, {
                        label: item.props.label,
                        children: item.props.children,
                        value: item.props.value,
                        active: isActive,
                        onClick: this.handleActiveChange.bind(this),
                    });
                })}
            </div>
        );
    }
}

class Radio extends Component<BaseRadioIProps, IState> {
    render() {
        return (
            <div className={styles.radioWrap}>
                <div className={styles.radioLeft}>
                    <div onClick={this.props.onClick!.bind(this, this.props.value)}>
                        <div className={`${styles.circle} ${this.props.active && styles.active}`}>
                            <div className={styles.fork}></div>
                        </div>
                        <div className={styles.label}>{this.props.label}</div>
                    </div>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export class UniverRadio implements RadioComponent {
    render(): JSXComponent<BaseRadioIProps> {
        return Radio;
    }
}
export class UniverRadioGroup implements RadioComponent {
    render(): JSXComponent<BaseRadioIProps> {
        return Radio;
    }
}

export { RadioGroup, Radio };
