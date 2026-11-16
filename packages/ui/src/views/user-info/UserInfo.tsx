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

import { Avatar } from '@univerjs/design';
import { ComponentManager } from '../../common/component-manager';
import { useDependency } from '../../utils/di';

export const USER_INFO_COMPONENT = 'UserInfo';

export interface IUserInfoData {
    /** Source user identity, available even before the profile loads. Never a collaboration session ID. */
    userId?: string;
    /** Display-only data; custom components may render a name without obtaining its plaintext. */
    name?: string;
    avatar?: string;
    isAnonymous?: boolean;
}

export interface IUserInfoContext {
    scene: 'comment-author' | 'history-author' | 'history-filter' | 'permission-member' | 'permission-creator' | 'base-person';
    /** Absent for standalone controls which have no associated document. */
    unitId?: string;
    subUnitId?: string;
    commentId?: string;
    threadId?: string;
    versionId?: string;
    objectId?: string;
    tableId?: string;
    fieldId?: string;
    recordId?: string;
}

export interface IUserInfoProps {
    user: Readonly<IUserInfoData>;
    part: 'name' | 'avatar';
    context: Readonly<IUserInfoContext>;
    avatarSize?: number;
    fallbackSrc?: string;
    className?: string;
}

/** Default renderer, also usable by host overrides for scenes they do not customize. */
export function DefaultUserInfo(props: IUserInfoProps) {
    return renderDefaultUserInfo(props);
}

function renderDefaultUserInfo({ user, part, avatarSize = 24, fallbackSrc, className }: IUserInfoProps) {
    if (part === 'avatar') {
        return (
            <Avatar className={className} size={avatarSize} src={user.avatar || fallbackSrc} alt="">
                {Array.from(user.name ?? '')[0]}
            </Avatar>
        );
    }

    return className ? <span className={className}>{user.name}</span> : user.name ?? null;
}

/**
 * Renders user information through the host's registered component, including unresolved profiles.
 * Register USER_INFO_COMPONENT with FUniver.registerComponent before opening the view.
 * Hosts own external SDK initialization, identity mapping and asynchronous DOM rendering.
 * This does not change permissions, persisted mentions, search text or Canvas rendering.
 */
export function UserInfo(props: IUserInfoProps) {
    const componentManager = useDependency(ComponentManager);
    const Component = componentManager.get(USER_INFO_COMPONENT) ?? DefaultUserInfo;
    // Keep the default path free of an extra component per name/avatar in long member lists.
    return Component === DefaultUserInfo ? renderDefaultUserInfo(props) : <Component {...props} />;
}
