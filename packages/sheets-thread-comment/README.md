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
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';

const mockUser = {
    userID: 'mockId',
    name: 'MockUser',
    avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAInSURBVHgBtZU9TxtBEIbfWRzFSIdkikhBSqRQk JqkCKTCFkqVInSUSaT0wC8w/gXxD4gU2nRJkXQWhAZowDUUWKIwEgWWbEEB3mVmx3dn4DA2nB/ppNuPeWd29mMIPXDr+RxwtgRHeW6+guNPRxogqnL7Dwz9psJ27S4NShaeZTH3kwXy6I81 dlRKcmRui88swdq9AcSFL7Buz1Vmlns64MiLsCjzwnIYHLH57tbfFbs7KRaXyEU8FVZofqccOfA5 l7Q8LPIkGrwnb2RPNEXWFVMUF3L+kDCk0btDDAMzOm5YfAHDwp4tG74wnzAsiOYMnJ3GoDybA7IT 98/jm5+JNnfiIzAS6LlqHQBN/i6b2t/cV1Hh6BfwYlHnHP4AXi5q/8kmMMpOs8+BixZw/Fd6xUE HEbnkgclvQP2fGp7uShRKnQ3G32rkjV1th8JhIGG7tR/JyjGteSOZELwGMmNqIIigRCLRh2OZIE 6BjItdd7pCW6Uhm1zzkUtungSxwEUzNpQ+GQumtH1ej1MqgmNT6vwmhCq5yuwq56EYTbgeQUz 3yvrpV1b4ok3nYJ+eYhgYmjRUqErx2EDq0Fr8FhG++iqVGqxlUJI/70Ar0UgJaWHj6hYVHJrf KssAHot1JfqwE9WVWzXZVd5z2Ws/4PnmtEjkXeKJDvxUecLbWOXH/ DP6QQ4J72NS0adedp1aseBfXP8odlZFfPvBF7SN/8hky1TYuPOAXAEipMx15u5ToAAAAABJRU5ErkJggg==',
    anonymous: false,
    canBindAnonymous: false,
};

univer.registerPlugin(UniverSheetsThreadCommentPlugin, {
    mentions: [{
        trigger: '@',
        // Get the common interface implementation of the mentioned user
        getMentions: async () => {
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
        },
    }],
});
```
