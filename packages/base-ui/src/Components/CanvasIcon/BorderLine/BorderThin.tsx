import { CanvasIcon } from '../CanvasIcon';

interface IProps {
    width?: string;
    height?: string;
}

export function BorderThin(props: IProps) {
    const { width = '100', height = '10' } = props;
    return <CanvasIcon width={width} height={height} type="Thin" hv="h" mSt={0} mEd={5} lineSt={100} lineEd={5} />;
}
