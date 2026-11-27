/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IConditionalFormattingIcon } from '@univerjs/sheets-conditional-formatting';
import { clsx } from '@univerjs/design';
import {
    ArrowDownIcon,
    ArrowRightIcon,
    ArrowTiltDownIcon,
    ArrowTiltUpIcon,
    ArrowUpIcon,
    Cell0DoubleIcon,
    Cell100DoubleIcon,
    Cell25DoubleIcon,
    Cell50DoubleIcon,
    Cell75DoubleIcon,
    CheckMarkIcon,
    CloseIcon,
    CorrectDoubleIcon,
    CrossIcon,
    DissatisfiedDoubleIcon,
    DownIcon,
    ExclamationIcon,
    FlagIcon,
    GuffawDoubleIcon,
    ImpatientDoubleIcon,
    IndicateDoubleIcon,
    MistakeDoubleIcon,
    NoninductiveDoubleIcon,
    Progress0DoubleIcon,
    Progress100DoubleIcon,
    Progress25DoubleIcon,
    Progress50DoubleIcon,
    Progress75DoubleIcon,
    RhomboidIcon,
    RoundnessIcon,
    Signal0DoubleIcon,
    Signal100DoubleIcon,
    Signal25DoubleIcon,
    Signal50DoubleIcon,
    Signal75DoubleIcon,
    SlashDoubleIcon,
    SmileDoubleIcon,
    StarEmptyDoubleIcon,
    StarFullDoubleIcon,
    StarIncompleteDoubleIcon,
    TriangleIcon,
    UpIcon,
    WarnDoubleIcon,
} from '@univerjs/icons';

const components = {
    'arrow-down-icon': ArrowDownIcon,
    'arrow-right-icon': ArrowRightIcon,
    'arrow-tilt-down-icon': ArrowTiltDownIcon,
    'arrow-tilt-up-icon': ArrowTiltUpIcon,
    'arrow-up-icon': ArrowUpIcon,
    'cell-0-double-icon': Cell0DoubleIcon,
    'cell-100-double-icon': Cell100DoubleIcon,
    'cell-25-double-icon': Cell25DoubleIcon,
    'cell-50-double-icon': Cell50DoubleIcon,
    'cell-75-double-icon': Cell75DoubleIcon,
    'check-mark-icon': CheckMarkIcon,
    'close-icon': CloseIcon,
    'correct-double-icon': CorrectDoubleIcon,
    'cross-icon': CrossIcon,
    'dissatisfied-double-icon': DissatisfiedDoubleIcon,
    'down-icon': DownIcon,
    'exclamation-icon': ExclamationIcon,
    'flag-icon': FlagIcon,
    'guffaw-double-icon': GuffawDoubleIcon,
    'impatient-double-icon': ImpatientDoubleIcon,
    'indicate-double-icon': IndicateDoubleIcon,
    'mistake-double-icon': MistakeDoubleIcon,
    'noninductive-double-icon': NoninductiveDoubleIcon,
    'progress-0-double-icon': Progress0DoubleIcon,
    'progress-100-double-icon': Progress100DoubleIcon,
    'progress-25-double-icon': Progress25DoubleIcon,
    'progress-50-double-icon': Progress50DoubleIcon,
    'progress-75-double-icon': Progress75DoubleIcon,
    'rhomboid-icon': RhomboidIcon,
    'roundness-icon': RoundnessIcon,
    'signal-0-double-icon': Signal0DoubleIcon,
    'signal-100-double-icon': Signal100DoubleIcon,
    'signal-25-double-icon': Signal25DoubleIcon,
    'signal-50-double-icon': Signal50DoubleIcon,
    'signal-75-double-icon': Signal75DoubleIcon,
    'smile-double-icon': SmileDoubleIcon,
    'star-empty-double-icon': StarEmptyDoubleIcon,
    'star-full-double-icon': StarFullDoubleIcon,
    'star-incomplete-double-icon': StarIncompleteDoubleIcon,
    'triangle-icon': TriangleIcon,
    'up-icon': UpIcon,
    'warn-double-icon': WarnDoubleIcon,
} satisfies Record<IConditionalFormattingIcon['name'], typeof ArrowUpIcon>;

export function ConditionalFormattingPresetIcon({ icon, className }: { icon?: IConditionalFormattingIcon; className?: string }) {
    if (!icon) {
        return <SlashDoubleIcon aria-hidden="true" className={className} />;
    }

    const Icon = components[icon.name];
    const { colors } = icon;
    return (
        <Icon
            aria-hidden="true"
            className={clsx(className, colors?.white && '[&_[fill=white]]:univer-fill-current')}
            style={{ color: colors?.black ?? 'black' }}
            extend={{ colorChannel1: colors?.['#E5E5E5'] ?? '#E5E5E5' }}
        />
    );
}
