import { Component, createRef, RefObject } from '../../Framework';
import Style from './index.module.less';
type IProps = {
    width: string;
    height: string;
    drawLine: (dom: RefObject<CanvasIcon>) => void;
};
type IState = {};

class CanvasIcon extends Component<IProps, IState> {
    canvasRef = createRef();

    componentDidMount() {
        this.drawLine();
    }

    drawLine() {
        const canvas = this.canvasRef;
        this.props.drawLine(canvas);
    }

    /**
     *
     * @param ctx   View DOM
     * @param type  BorderLine Type
     * @param hv
     * @param m_st  Start X
     * @param m_ed  Start Y
     * @param line_st   End X
     * @param line_ed   End Y
     */
    setLineDash(ctx: CanvasRenderingContext2D, type: string, hv: string, m_st: number, m_ed: number, line_st: number, line_ed: number) {
        let borderType: { [index: string]: string } = {
            '0': 'none',
            '1': 'Thin',
            '2': 'Hair',
            '3': 'Dotted',
            '4': 'Dashed',
            '5': 'DashDot',
            '6': 'DashDotDot',
            '7': 'Double',
            '8': 'Medium',
            '9': 'MediumDashed',
            '10': 'MediumDashDot',
            '11': 'MediumDashDotDot',
            '12': 'SlantedDashDot',
            '13': 'Thick',
        };

        try {
            if (type === 'Hair') {
                ctx.setLineDash([1, 2]);
            } else if (type.indexOf('DashDotDot') > -1) {
                ctx.setLineDash([2, 2, 5, 2, 2]);
            } else if (type.indexOf('DashDot') > -1) {
                ctx.setLineDash([2, 5, 2]);
            } else if (type.indexOf('Dotted') > -1) {
                ctx.setLineDash([2]);
            } else if (type.indexOf('Dashed') > -1) {
                ctx.setLineDash([3]);
            } else {
                ctx.setLineDash([0]);
            }
        } catch (e) {
            console.log(e);
        }

        ctx.beginPath();

        if (type.indexOf('Medium') > -1) {
            if (hv === 'h') {
                ctx.moveTo(m_st, m_ed - 0.5);
                ctx.lineTo(line_st, line_ed - 0.5);
            } else {
                ctx.moveTo(m_st - 0.5, m_ed);
                ctx.lineTo(line_st - 0.5, line_ed);
            }

            ctx.lineWidth = 2;
        } else if (type === 'Thick') {
            ctx.moveTo(m_st, m_ed);
            ctx.lineTo(line_st, line_ed);
            ctx.lineWidth = 3;
        } else {
            ctx.moveTo(m_st, m_ed);
            ctx.lineTo(line_st, line_ed);
            ctx.lineWidth = 1;
        }
    }

    render() {
        return <canvas ref={this.canvasRef} className={Style.canvas} width={this.props.width} height={this.props.height} />;
    }
}

export { CanvasIcon };
