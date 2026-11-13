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

import { Injector } from '@univerjs/core';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import type { IUserInfoProps } from '../UserInfo';
import { ComponentManager } from '../../../common/component-manager';
import { RediProvider } from '../../../utils/di';
import { DefaultUserInfo, USER_INFO_COMPONENT, UserInfo } from '../UserInfo';

function HostUserInfo({ user, part, context, className }: IUserInfoProps) {
    return createElement('ww-open-data', { openid: user.userId, type: part, 'data-unit': context.unitId, className });
}

it('renders opaque identities through the override and restores the default when reopened after disposal', () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const injector = new Injector([[ComponentManager]]);
    const components = injector.get(ComponentManager);
    const override = components.register(USER_INFO_COMPONENT, HostUserInfo, { override: true });
    components.register(USER_INFO_COMPONENT, DefaultUserInfo);
    const container = document.createElement('div');
    const root = createRoot(container);
    const render = (user: IUserInfoProps['user']) => act(() => root.render(
        <RediProvider value={{ injector }}>
            <UserInfo user={user} part="name" context={{ scene: 'comment-author', unitId: 'doc-1' }} />
            <UserInfo user={user} part="avatar" context={{ scene: 'comment-author', unitId: 'doc-1' }} />
        </RediProvider>
    ));
    try {
        render({ userId: 'opaque-1' });
        const names = container.querySelector('ww-open-data[type="name"]');
        expect(names?.getAttribute('openid')).toBe('opaque-1');
        expect(names?.getAttribute('data-unit')).toBe('doc-1');
        expect(container.querySelector('ww-open-data[type="avatar"]')?.getAttribute('openid')).toBe('opaque-1');
        render({ userId: 'opaque-2' });
        expect(names?.getAttribute('openid')).toBe('opaque-2');
        override.dispose();
        act(() => root.render(null));
        render({ userId: 'opaque-2', name: 'Local name', avatar: 'avatar.png' });
        expect(container.querySelector('ww-open-data')).toBeNull();
        expect(container.textContent).toContain('Local name');
        expect(container.querySelector('img')?.getAttribute('src')).toBe('avatar.png');
    } finally {
        act(() => root.unmount());
        injector.dispose();
        vi.unstubAllGlobals();
    }
});
