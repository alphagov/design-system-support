# Design System Support

This repository contains code to help us do support on the GOV.UK Design System team.

## Requirements

- Git
- Node.js (npm)
- Security access to credentials

## Setup

Clone this repository to your machine locally and then pull it's dependencies using

```
npm install
```

## Adding credentials

You'll need access to the [Design System team credentials](https://github.com/alphagov/design-system-team-credentials) repository.

1. Copy .env.example to .env
2. Fill in credentials

**.env is ignored by git, but make sure not to put these credentials into version control**

## Generating support log CSVs

When doing analysis of our support, we take Slack, Zendesk and Github data and bring them together.

You can generate CSVs from Zendesk and Github, which then need to be copied into the main spreadsheet.

**all CSV files in this repository are ignored by git, but make sure not to put these credentials into version control**

### Build all

```
npm run build:csv
```

### Zendesk

```
npm run build:csv:zendesk
```

### Github

```
npm run build:csv:github
```

You can adjust how far back to pull Github issues by passing the `createdMonthsAgo` argument in the command line.

The default is 1 month.

```
npm run build:csv:github -- --createdMonthsAgo=3
```