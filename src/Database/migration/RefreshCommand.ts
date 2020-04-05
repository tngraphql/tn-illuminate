/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/22/2020
 * Time: 10:10 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { BaseCommand, flags } from '@tngraphql/console'

export class RefreshCommand extends BaseCommand {
  public static commandName = 'migration:refresh'
  public static description = 'Reset and re-run all migrations'

  @flags.string({ description: 'Define a custom database connection' })
  public connection: string

  @flags.boolean({ description: 'Print SQL queries, instead of running the migrations' })
  public dryRun: boolean

  @flags.boolean({ description: 'Explictly force to run migrations in production' })
  public force: boolean

  @flags.number({
    description: 'Define custom batch number for rollback. Default use 0 to rollback to initial state',
  })
  public batch: number = 0

  @flags.boolean({ description: 'Do not close database connection when seeder.run finishes' })
  public keepAlive: boolean

  async handle (): Promise<any> {
    if (! this.batch) {
      await this.runReset()
    } else {
      await this.runRollback()
    }

    await this.kernel.exec('migration:run', this.parse({
      '--force': this.force,
      '--dry-run': this.dryRun,
      '--connection': this.connection,
      '--keep-alive': this.keepAlive,
    }))
  }

  async runRollback () {
    return this.kernel.exec('migration:rollback', this.parse({
      '--batch': this.batch,
      '--keep-alive': true,
      '--force': this.force,
      '--dry-run': this.dryRun,
      '--connection': this.connection,
    }))
  }

  async runReset () {
    return this.kernel.exec('migration:reset', this.parse({
      '--keep-alive': true,
      '--force': this.force,
      '--dry-run': this.dryRun,
      '--connection': this.connection,
    }))
  }

  parse (argv: any) {
    const args: any = []
    for(let [key, value] of Object.entries(argv)) {
      if (typeof value === 'boolean' && value === true) {
        args.push(key)
      } else if (value || value === 0) {
        args.push(`${ key }=${ value }`)
      }
    }

    return args
  }
}
