import { Button } from '@univerjs/base-ui';
import { Component } from 'preact';

interface IProps {
    label: string;
    children: IPropsChildren[];
}

interface IPropsChildren {
    label: string;
}

export class RightMenuButton extends Component<IProps> {
    render() {
        const { label, children } = this.props;

        return (
            <div>
                {label}
                {children.map((item: IPropsChildren, index) => (
                    <Button key={index} type="primary">{item.label}</Button>
                ))}
            </div>
        );
    }
}
