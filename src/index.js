#!/usr/bin/env node

// import meow from 'meow'
const meow = require('meow')
const CommitGenerator = require('./commit-generator')

const cli = meow(
  `
  Usage
    $ fake-git-commit [options]

  Options
    --commitsPerDay, -c  Customize how many commits a day to make. (e.g., "0,3")
    --workdaysOnly, -w   Use this option if you don't want to commit on weekends.
    --startDate, -s      Start date in yyyy/MM/dd format.
    --endDate, -e        End date yyyy/MM/dd format.
    
  Examples
    $ fake-git-commit --workdaysOnly
    $ fake-git-commit --commitsPerDay "0,3"
    $ fake-git-commit --startDate yyyy/MM/dd --endDate yyyy/MM/dd
  `,
  {
    flags: {
      startDate: {
        type: 'string',
        alias: 's'
      },
      endDate: {
        type: 'string',
        alias: 'e'
      },
      workdaysOnly: {
        type: 'boolean',
        alias: 'w',
        default: false
      },
      commitsPerDay: {
        type: 'string',
        alias: 'c',
        default: '0,3'
      }
    }
  }
)

const { commitsPerDay, workdaysOnly, startDate, endDate } = cli.flags

const commitGenerator = new CommitGenerator({
  commitsPerDay,
  workdaysOnly,
  startDate,
  endDate
})

;(async () => {
  try {
    await commitGenerator.generate()
    console.log('Commit generation completed successfully.')
  } catch (error) {
    console.error('An error occurred:', error)
  }
})()
