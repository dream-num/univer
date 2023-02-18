import { Button, Component } from '@univerjs/base-ui';

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
                {children.map((item: IPropsChildren) => (
                    <Button type="primary">{item.label}</Button>
                ))}
            </div>
        );
    }
}
