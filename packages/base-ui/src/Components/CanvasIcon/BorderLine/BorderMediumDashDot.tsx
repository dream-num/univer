import { Component } from 'preact';
import { JSXComponent } from '../../../BaseComponent';
import { IconComponent } from '../../../Interfaces';
import { CanvasIcon } from '../CanvasIcon';

interface IProps {
    width?: string;
    height?: string;
}
interface IState {}

class BorderMediumDashDot extends Component<IProps, IState> {
    render() {
        const { width = '100', height = '10' } = this.props;
        return (
            <CanvasIcon
                width={width}
                height={height}
                type="MediumDashDot"
                hv="h"
                mSt={0}
                mEd={5}
                lineSt={100}
                lineEd={5}
            />
        );
    }
}

export class UniverBorderMediumDashDot implements IconComponent {
    render(): JSXComponent<IProps> {
        return BorderMediumDashDot;
    }
}

export default BorderMediumDashDot;
