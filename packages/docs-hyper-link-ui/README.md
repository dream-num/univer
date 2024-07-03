# @univerjs/docs-hyper-link-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/docs-hyper-link-ui)](https://npmjs.org/packages/@univerjs/docs-hyper-link-ui )
[![license](https://img.shields.io/npm/l/@univerjs/docs-hyper-link-ui)](https://img.shields.io/npm/l/@univerjs/sheets- thread-comment)

## Introduction

`@univerjs/docs-hyper-link-ui` provides the comment/annotation function of Univer Sheets.


## Usage

### Install

```shell
# Use npm
npm install @univerjs/docs-hyper-link-ui

# Use pnpm
pnpm add @univerjs/docs-hyper-link-ui
```

### use
```js
import { UniverSheetsThreadCommentPlugin, IThreadCommentMentionDataService} from '@univerjs/docs-hyper-link-ui';

const mockUser = {
    userID: 'mockId',
    name: 'MockUser',
    avatar: 'icon-url',
    anonymous: false,
    canBindAnonymous: false,
};

class CustomMentionDataService implements IThreadCommentMentionDataService {
    trigger: string = '@';

     // Get the common interface implementation of the mentioned user
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
