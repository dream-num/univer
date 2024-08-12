# @univerjs/sheets-thread-comment

## Package Overview

| Package Name | UMD Namespace | Version | License | Downloads | Contains CSS | Contains i18n locales |
| --- | --- | --- | --- | --- | :---: | :---: |
| `@univerjs/sheets-thread-comment` | `UniverSheetsThreadComment` | [![][npm-version-shield]][npm-version-link] | ![][npm-license-shield] | ![][npm-downloads-shield] | ⭕️ | ⭕️ |

## Introduction

`@univerjs/sheets-thread-comment` provides the comment/annotation function of Univer Sheets.

## Usage

### Installation

```shell
# Use npm
npm install @univerjs/sheets-thread-comment

# Use pnpm
pnpm add @univerjs/sheets-thread-comment
```

### Register the plugin

```typescript
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

### API
```typescript
import {
    AddCommentCommand,
    DeleteCommentCommand,
    UpdateCommentCommand,
    ResolveCommentCommand,
    DeleteCommentTreeCommand,
} from '@univerjs/sheets-thread-comment';
import type {
    IAddCommentCommandParams,
    IDeleteCommentCommandParams,
    IResolveCommentCommandParams,
    IUpdateCommentCommandParams,
    IDeleteCommentTreeCommandParams,
} from '@univerjs/sheets-thread-comment';

// Add comment by command
const commandService = univer.__getInjector().get(ICommandService);

commandService.executeCommand(AddCommentCommand.id, {
    unitId: 'unitId',
    subUnitId: 'subUnitId',
    comment: {
        // comment content
    },
} as IAddCommentCommandParams);
```

<!-- Links -->
[npm-version-shield]: https://img.shields.io/npm/v/@univerjs/sheets-thread-comment?style=flat-square
[npm-version-link]: https://npmjs.com/package/@univerjs/sheets-thread-comment
[npm-license-shield]: https://img.shields.io/npm/l/@univerjs/sheets-thread-comment?style=flat-square
[npm-downloads-shield]: https://img.shields.io/npm/dm/@univerjs/sheets-thread-comment?style=flat-square
