# @univerjs/docs-hyper-link-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/docs-hyper-link-ui)](https://npmjs.org/packages/@univerjs/docs-hyper-link-ui)
[![license](https://img.shields.io/npm/l/@univerjs/docs-hyper-link-ui)](https://img.shields.io/npm/l/@univerjs/docs-hyper-link-ui)

## 简介

`@univerjs/docs-hyper-link-ui` 提供了 Univer Docs 的链接功能。


## 使用指南

### 安装

```shell
# 使用 npm
npm install @univerjs/docs-hyper-link-ui

# 使用 pnpm
pnpm add @univerjs/docs-hyper-link-ui
```

### 使用
```js
import { UniverSheetsThreadCommentPlugin, IThreadCommentMentionDataService } from '@univerjs/docs-hyper-link-ui';

const mockUser = {
    userID: 'mockId',
    name: 'MockUser',
    avatar: 'avatar-icon-url',
    anonymous: false,
    canBindAnonymous: false,
};

class CustomMentionDataService implements IThreadCommentMentionDataService {
    trigger: string = '@';

    // 获取提及用户的通用接口实现
    async getMentions(search: string) {
        return [
            {
                id: mockUser.userID,
                label: mockUser.name,
                type: 'user',
                icon: mockUser.avatar,
            },
            {
                id: '2',
                label: 'User2',
                type: 'user',
                icon: mockUser.avatar,
            },
        ];
    }
}

univer.registerPlugin(UniverSheetsThreadCommentPlugin, {
    overrides: [[IThreadCommentMentionDataService, { useClass: CustomMentionDataService }]],
});
```
