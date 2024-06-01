# @univerjs/univer-condition

[![npm version](https://img.shields.io/npm/v/@univerjs/univer-condition)](https://npmjs.org/packages/@univerjs/univer-condition)
[![license](https://img.shields.io/npm/l/@univerjs/univer-condition)](https://img.shields.io/npm/l/@univerjs/univer-condition)

## Introduction

> In sheet, there are many features have ability to custom a rule , when the rule is match, something will happen.

- A formatter will be used, (condition format)
- A hidden row action will execute, (filter)
- A validation will be apply (data validation)
- A pivot filter will be execute (pivot table filter)

### design 

``` typescript
interface ICondition {
    conType :ConType;
    compareType:compareType
    expect:any;
}

enum ConType{

}
enum compareType{

}
```

## Usage

### Installation

```shell
# Using npm
npm i @univerjs/univer-condition

# Using pnpm
pnpm add @univerjs/univer-condition
```

### Classification

#### Number

> For compare type operator , the following table list all

| enum               | description                                                                                                                   |
| :----------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| equal              | The given value is equal to the expected                                                                                      |
| notEqual           | a value is not equal to a expected value                                                                                      |
| greaterThan        | a value is greater than to a expected value                                                                                   |
| greaterThanOrEqual | a value is greater than or equal to a expected value                                                                          |
| lessThan           | a value is less than a expected value                                                                                         |
| lessThanOrEqual    | a value is less than than or equal to a expected value                                                                        |
| between            | closed interval , a value is greater than or equal to the smaller expected value, and  less than or equal to the bigger value |
| notBetween         | open interval, a value is greater than or equal to the bigger expected value, and  less than or equal to the smaller value    |

> The following show statistics operator

| enum  | description                                |
| :---- | :----------------------------------------- |
| above | the value is bigger than the average value |
| below | the value is less than the average value   |
| top10 | Value in the top/bottom N values           |



#### Date
> The date is a special type in excel, but in fact ,there are no date value in excel , the date be expressed by a number value and a format

For date type condition , there are there kinds: Date dynamic condition , Date Compare condition, Date Choose Condition, Date group

- when using whole day is set, it means the data 2024/05/27 00-00-01 is equal to the data 2024/05/27 23-59-59

##### Date dynamic condition

- Notice : In most country , the Saturday is last day of a week

| enum        | description                                  |
| :---------- | :------------------------------------------- |
| tomorrow    | day after today                              |
| today       | today                                        |
| yesterday   | yesterday                                    |
| nextWeek    | next week                                    |
| thisWeek    | this week                                    |
| lastWeek    | last week                                    |
| nextMonth   | next month                                   |
| thisMonth   | this month                                   |
| lastMonth   | last month                                   |
| nextQuarter | next quarter                                 |
| thisQuarter | this quarter                                 |
| lastQuarter | last quarter                                 |
| nextYear    | next year                                    |
| thisYear    | this year                                    |
| lastYear    | last year                                    |
| yearToDate  | the time area for this year begin to current |

##### Date Compare condition



| enum                 | description                               |
| :------------------- | :---------------------------------------- |
| dateEqual            | the same date                             |
| dateNotEqual         | not the same date                         |
| dateOlderThan        | old than expected date                    |
| dateOlderThanOrEqual | old than  or equal date                   |
| dateNewerThan        | before  expected date                     |
| dateNewerThanOrEqual | before or equal expected date             |
| dateBetween          | a date is between two other expected date |
| dateNotBetween       | a date is between two other expected date |

##### Date Choose Condition

| enum | description                  |
| :--- | :--------------------------- |
| Q1   | The first quarter of a year  |
| Q2   | The second quarter of a year |
| Q3   | The 3'th quarter of a year   |
| Q4   | The last quarter of a year   |
| M1   | January                      |
| M2   | February                     |
| M3   | March                        |
| M4   | April                        |
| M5   | May                          |
| M6   | June                         |
| M7   | July                         |
| M8   | August                       |
| M9   | September                    |
| M10  | October                      |
| M11  | November                     |
| M12  | December                     |

#### Date group
| enum   | description     |
| :----- | :-------------- |
| day    | Group by day    |
| hour   | Group by hour   |
| minute | Group by minute |
| month  | Group by month  |
| second | Group by second |
| year   | Group by year   |



#### Text

| enum               | description                                                                                                                   |
| :----------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| Equal              | a value is equal a expected value                                                                                             |
| NotEqual           | a value is not equal a expected value                                                                                         |
| BeginsWith         | the string start with expected text                                                                                           |
| NotBeginsWith      | the string not start with expected text                                                                                       |
| EndsWith           | the string  end with expected text                                                                                            |
| NotEndsWith        | the string not end with expected text                                                                                         |
| Contains           | the string contain expected text                                                                                              |
| NotContains        | the string not contain expected text                                                                                          |
| GreaterThan        | a value is greater than  the expected value                                                                                   |
| GreaterThanOrEqual | a value is greater than or equal to the expected value                                                                        |
| LessThan           | a value is greater than  the expected value                                                                                   |
| LessThanOrEqual    | a value is greater than or equal  the expected value                                                                          |
| Between            | closed interval , a value is greater than or equal to the smaller expected value, and  less than or equal to the bigger value |
| NotBetween         | open interval, a value is greater than or equal to the bigger expected value, and  less than or equal to the smaller value    |

#### Logic
> A logic condition can combine some condition together 

| enum | description                                                                     |
| :--- | :------------------------------------------------------------------------------ |
| not  | return a opposite of expect condition                                           |
| and  | all  expect conditions is true it will return true , otherwise it will be false |
| or   | one of expect conditions is true , it will return true                          |

#### Color & IconSet

- For color , there are font color and cell color two kinds of a cell
- For icon set filter, this element specifies the icon set and particular icon within that set to filter by. For any cells whose icon does
not match the specified criteria, the corresponding rows shall be hidden from view when the filter is applied.

