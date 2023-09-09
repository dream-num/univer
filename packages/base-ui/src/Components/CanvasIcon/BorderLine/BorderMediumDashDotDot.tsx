import { Component } from 'preact';
import { JSXComponent } from '../../../BaseComponent';
import { IconComponent } from '../../../Interfaces';
import { CanvasIcon } from '../CanvasIcon';

interface IProps {
    width?: string;
    height?: string;
}
interface IState {}

class BorderMediumDashDotDot extends Component<IProps, IState> {
    render() {
        const { width = '100', height = '10' } = this.props;
        return (
            <CanvasIcon
                width={width}
                height={height}
                type="MediumDashDotDot"
                hv="h"
                mSt={0}
                mEd={5}
                lineSt={100}
                lineEd={5}
            />
        );
    }
}
export class UniverBorderMediumDashDotDot implements IconComponent {
    render(): JSXComponent<IProps> {
        return BorderMediumDashDotDot;
    }
}

export default BorderMediumDashDotDot;
