import { Component, createRef, RefObject } from 'preact';
import { JSXComponent } from '../../../BaseComponent';
import { IconComponent } from '../../../Interfaces';
import { CanvasIcon } from '../CanvasIcon';

interface IProps {
    width?: string;
    height?: string;
}
interface IState {}

class BorderDashDot extends Component<IProps, IState> {
    ref = createRef();

    drawLine(ref: RefObject<CanvasIcon>) {
        const canvas = ref.current! as unknown as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        this.ref.current.setLineDash(ctx, 'DashDot', 'h', 0, 5, 100, 5);
        ctx.stroke();
        ctx.closePath();
    }

    render() {
        const { width = '100', height = '10' } = this.props;
        return <CanvasIcon ref={this.ref} width={width} height={height} drawLine={(dom) => this.drawLine(dom)} />;
    }
}

export class UniverBorderDashDot implements IconComponent {
    render(): JSXComponent<IProps> {
        return BorderDashDot;
    }
}

export default BorderDashDot;
