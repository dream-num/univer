import {
    Autowrap24,
    LeftRotationFortyFiveDegrees24,
    LeftRotationNinetyDegrees24,
    Overflow24,
    RightRotationFortyFiveDegrees24,
    RightRotationNinetyDegrees24,
    TextDown24,
    TextHorizontallyCentered24,
    TextLeft24,
    TextRight24,
    TextRotation24,
    TextUp24,
    TextVertical24,
    TextVerticallyCentered24,
    Truncation24,
} from '@univerjs/icons';

import { BaseIconProps } from '../AddIcon';

export const LeftAlignIcon = (props: BaseIconProps) => <TextLeft24 />;

export const CenterAlignIcon = (props: BaseIconProps) => <TextHorizontallyCentered24 />;

export const RightAlignIcon = (props: BaseIconProps) => <TextRight24 />;

export const TopVerticalIcon = (props: BaseIconProps) => <TextUp24 />;

export const CenterVerticalIcon = (props: BaseIconProps) => <TextVerticallyCentered24 />;

export const BottomVerticalIcon = (props: BaseIconProps) => <TextDown24 />;

export const TextRotateIcon = (props: BaseIconProps) => <TextRotation24 />;
export const TextRotateAngleUpIcon = (props: BaseIconProps) => <LeftRotationFortyFiveDegrees24 />;
export const TextRotateAngleDownIcon = (props: BaseIconProps) => <RightRotationFortyFiveDegrees24 />;
export const TextRotateVerticalIcon = (props: BaseIconProps) => <TextVertical24 />;
export const TextRotateRotationUpIcon = (props: BaseIconProps) => <LeftRotationNinetyDegrees24 />;
export const TextRotateRotationDownIcon = (props: BaseIconProps) => <RightRotationNinetyDegrees24 />;

export const BrIcon = (props: BaseIconProps) => <Autowrap24 />;

export const OverflowIcon = (props: BaseIconProps) => <Overflow24 />;

export const CutIcon = (props: BaseIconProps) => <Truncation24 />;

export default {
    LeftAlignIcon,
    CenterAlignIcon,
    RightAlignIcon,
    TopVerticalIcon,
    CenterVerticalIcon,
    BottomVerticalIcon,
    TextRotateIcon,
    TextRotateAngleUpIcon,
    BrIcon,
    OverflowIcon,
    CutIcon,
};
