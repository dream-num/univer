import { Button } from '@univerjs/base-ui';
import { Component } from 'react';

interface IProps {
    label: string;
    children: IPropsChildren[];
}

interface IPropsChildren {
    label: string;
}

export class RightMenuButton extends Component<IProps> {
    override render() {
        const { label, children } = this.props;

        return (
            <div>
                {label}
                {children.map((item: IPropsChildren, index) => (
                    <Button key={index} type="primary">
                        {item.label}
                    </Button>
                ))}
            </div>
        );
    }
}
