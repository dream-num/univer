import {
    BorderColor24,
    DownBorde24,
    InnerBorde24,
    LeftBorde24,
    MergeCell24,
    NoBorders24,
    OuterBorder24,
    RightBorde24,
    TableStyle24,
    UpBorde24,
} from '@univerjs/icons';

import { BaseIconProps } from '../AddIcon';

export const FillColorIcon = (props: BaseIconProps) => (
    <BorderColor24 extend={{ colorChannel1: props.color || 'white' }} />
);

export const FullBorderIcon = (props: BaseIconProps) => <TableStyle24 />;

export const TopBorderIcon = (props: BaseIconProps) => <UpBorde24 />;

export const BottomBorderIcon = (props: BaseIconProps) => <DownBorde24 />;

export const LeftBorderIcon = (props: BaseIconProps) => <LeftBorde24 />;

export const RightBorderIcon = (props: BaseIconProps) => <RightBorde24 />;

export const NoneBorderIcon = (props: BaseIconProps) => <NoBorders24 />;

export const OuterBorderIcon = (props: BaseIconProps) => <OuterBorder24 />;

export const InnerBorderIcon = (props: BaseIconProps) => <InnerBorde24 />;

export const StripingBorderIcon = (props: BaseIconProps) => <InnerBorde24 />;

export const VerticalBorderIcon = (props: BaseIconProps) => <InnerBorde24 />;

export const MergeIcon = (props: BaseIconProps) => <MergeCell24 />;

export default {
    FillColorIcon,
    FullBorderIcon,
    TopBorderIcon,
    BottomBorderIcon,
    LeftBorderIcon,
    RightBorderIcon,
    NoneBorderIcon,
    OuterBorderIcon,
    InnerBorderIcon,
    StripingBorderIcon,
    VerticalBorderIcon,
    MergeIcon,
};
