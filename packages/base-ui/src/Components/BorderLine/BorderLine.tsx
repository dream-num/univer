import { CanvasIcon } from './Basic';

interface IProps {
    width?: string;
    height?: string;
}

export function BorderDashDot(props: IProps) {
    const { width = '100', height = '10' } = props;
    return <CanvasIcon width={width} height={height} type="DashDot" hv="h" mSt={0} mEd={5} lineSt={100} lineEd={5} />;
}

export function BorderDashDotDot(props: IProps) {
    const { width = '100', height = '10' } = props;
    return (
        <CanvasIcon width={width} height={height} type="DashDotDot" hv="h" mSt={0} mEd={5} lineSt={100} lineEd={5} />
    );
}

export function BorderDashed(props: IProps) {
    const { width = '100', height = '10' } = props;
    return <CanvasIcon width={width} height={height} type="Dashed" hv="h" mSt={0} mEd={5} lineSt={100} lineEd={5} />;
}

export function BorderDotted(props: IProps) {
    const { width = '100', height = '10' } = props;
    return <CanvasIcon width={width} height={height} type="Dotted" hv="h" mSt={0} mEd={5} lineSt={100} lineEd={5} />;
}

export function BorderHair(props: IProps) {
    const { width = '100', height = '10' } = props;
    return <CanvasIcon width={width} height={height} type="Hair" hv="h" mSt={0} mEd={5} lineSt={100} lineEd={5} />;
}

export function BorderMedium(props: IProps) {
    const { width = '100', height = '10' } = props;
    return <CanvasIcon width={width} height={height} type="Medium" hv="h" mSt={0} mEd={5} lineSt={100} lineEd={5} />;
}

export function BorderMediumDashDot(props: IProps) {
    const { width = '100', height = '10' } = props;
    return (
        <CanvasIcon width={width} height={height} type="MediumDashDot" hv="h" mSt={0} mEd={5} lineSt={100} lineEd={5} />
    );
}

export function BorderMediumDashDotDot(props: IProps) {
    const { width = '100', height = '10' } = props;
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

export function BorderMediumDashed(props: IProps) {
    const { width = '100', height = '10' } = props;
    return (
        <CanvasIcon width={width} height={height} type="MediumDashed" hv="h" mSt={0} mEd={5} lineSt={100} lineEd={5} />
    );
}

export function BorderThick(props: IProps) {
    const { width = '100', height = '10' } = props;
    return <CanvasIcon width={width} height={height} type="Thick" hv="h" mSt={0} mEd={5} lineSt={100} lineEd={5} />;
}

export function BorderThin(props: IProps) {
    const { width = '100', height = '10' } = props;
    return <CanvasIcon width={width} height={height} type="Thin" hv="h" mSt={0} mEd={5} lineSt={100} lineEd={5} />;
}
