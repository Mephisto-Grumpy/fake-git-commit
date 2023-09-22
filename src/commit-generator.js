const process = require('process')
const { exec } = require('child_process')
const { existsSync } = require('fs')
const { promisify } = require('util')
const {
  parse,
  addDays,
  addYears,
  isWeekend,
  setHours,
  setMinutes,
  setSeconds
} = require('date-fns')
const chalk = require('chalk')
const ora = require('ora')
const boxen = require('boxen')

class CommitGenerator {
  constructor({ commitsPerDay, workdaysOnly, startDate, endDate }) {
    this.commitsPerDay = commitsPerDay.split(',')
    this.workdaysOnly = workdaysOnly
    this.startDate = startDate ? parse(startDate) : addYears(new Date(), -1)
    this.endDate = endDate ? parse(endDate) : new Date()
  }

  async generate() {
    const commitDateList = this.createCommitDateList()

    const spinner = ora('Generating your GitHub activity\n').start()

    const historyFolder = 'src/committer-history'

    if (existsSync(`${historyFolder}`)) {
      await promisify(exec)(
        `${
          process.platform === 'win32' ? 'rmdir /s /q' : 'rm -rf'
        } ${historyFolder}`
      )
    }

    await promisify(exec)(`mkdir ${historyFolder}`)
    process.chdir(historyFolder)
    await promisify(exec)(`git init`)

    for (const date of commitDateList) {
      const dateFormatted = new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date)
      spinner.text = `Generating your Github activity... (${dateFormatted})\n`

      await promisify(exec)(`echo "${date}" > committer.txt`)
      await promisify(exec)(`git add .`)
      await promisify(exec)(
        `git commit --quiet --date "${date}" -m "fake commit"`
      )
    }

    spinner.succeed()

    console.log(
      boxen(
        `${chalk.green('Success')} ${
          commitDateList.length
        } commits have been created.`,
        { padding: 1 }
      )
    )
  }

  getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  createCommitDateList() {
    const commitDateList = []
    let currentDate = this.startDate

    while (currentDate <= this.endDate) {
      if (this.workdaysOnly && isWeekend(currentDate)) {
        currentDate = addDays(currentDate, 1)
        continue
      }
      for (
        let i = 0;
        i < this.getRandomIntInclusive(...this.commitsPerDay);
        i++
      ) {
        const dateWithHours = setHours(
          currentDate,
          this.getRandomIntInclusive(9, 16)
        )
        const dateWithHoursAndMinutes = setMinutes(
          dateWithHours,
          this.getRandomIntInclusive(0, 59)
        )
        const commitDate = setSeconds(
          dateWithHoursAndMinutes,
          this.getRandomIntInclusive(0, 59)
        )

        commitDateList.push(commitDate)
      }
      currentDate = addDays(currentDate, 1)
    }

    return commitDateList
  }
}

module.exports = CommitGenerator
