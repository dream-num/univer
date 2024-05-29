# @univerjs/sheets-thread-comment

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-thread-comment)](https://npmjs.org/packages/@univerjs/sheets-thread-comment)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-thread-comment)](https://img.shields.io/npm/l/@univerjs/sheets-thread-comment)

## 简介

`@univerjs/sheets-thread-comment` 提供了 Univer Sheets 的评论/批注功能。


## 使用指南

### 安装

```shell
# 使用 npm
npm install @univerjs/sheets-thread-comment

# 使用 pnpm
pnpm add @univerjs/sheets-thread-comment
```

### 使用
```js
import { UniverSheetsThreadCommentPlugin, IThreadCommentMentionDataService } from '@univerjs/sheets-thread-comment';

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
