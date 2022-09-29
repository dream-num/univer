import { ComponentChildren } from '@univer/base-component';

type BaseGridProps = {
    children?: ComponentChildren;
    style?: {};
    className?: string;
    onClick?: (e: MouseEvent) => void;
};

/**
 * https://stackoverflow.com/questions/56549331/creating-a-flexbox-grid-with-gutters-and-fixed-widths
 * @param props
 * @returns
 */
export const Grid = (props: BaseGridProps) => {
    const { children, style, className } = props;

    return (
        <div class="flexrow">
            <div class="flexcol col-1">THING 1</div>
            <div class="flexcol col-2">THING 2</div>
            <div class="flexcol col-3">THING 3</div>
            <div class="flexcol col-4">THING 4</div>
            <div class="flexcol col-5">THING 5</div>
            <div class="flexcol col-6">THING 6</div>
        </div>
    );
};

// export class UniverGrid implements GridComponent {
//     render(): JSXComponent<BaseGridProps> {
//         return Grid;
//     }
// }
