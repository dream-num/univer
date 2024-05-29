# @univerjs/sheets-thread-comment

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-thread-comment)](https://npmjs.org/packages/@univerjs/sheets-thread-comment )
[![license](https://img.shields.io/npm/l/@univerjs/sheets-thread-comment)](https://img.shields.io/npm/l/@univerjs/sheets- thread-comment)

## Introduction

`@univerjs/sheets-thread-comment` provides the comment/annotation function of Univer Sheets.


## Usage

### Install

```shell
# Use npm
npm install @univerjs/sheets-thread-comment

# Use pnpm
pnpm add @univerjs/sheets-thread-comment
```

### use
```js
import { UniverSheetsThreadCommentPlugin, IThreadCommentMentionDataService} from '@univerjs/sheets-thread-comment';

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
