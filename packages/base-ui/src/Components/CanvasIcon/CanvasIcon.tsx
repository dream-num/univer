import { useEffect, useRef } from 'react';
import Style from './index.module.less';

type IProps = {
    width: string;
    height: string;
    type: string;
    hv: string;
    mSt: number;
    mEd: number;
    lineSt: number;
    lineEd: number;
};
type IState = {};

export function CanvasIcon(props: IProps) {
    const { type, hv, mSt: m_st, mEd: m_ed, lineSt: line_st, lineEd: line_ed } = props

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d')!;
        setLineDash(ctx);
    }, [])

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
    function setLineDash(ctx: CanvasRenderingContext2D) {
        // const borderType: { [index: string]: string } = {
        //     '0': 'none',
        //     '1': 'Thin',
        //     '2': 'Hair',
        //     '3': 'Dotted',
        //     '4': 'Dashed',
        //     '5': 'DashDot',
        //     '6': 'DashDotDot',
        //     '7': 'Double',
        //     '8': 'Medium',
        //     '9': 'MediumDashed',
        //     '10': 'MediumDashDot',
        //     '11': 'MediumDashDotDot',
        //     '12': 'SlantedDashDot',
        //     '13': 'Thick',
        // };

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

        ctx.stroke();
        ctx.closePath();
    }

    return <canvas ref={canvasRef} className={Style.canvas} width={props.width} height={props.height} />;
}
