/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { flags, Kernel } from '@tngraphql/console'
import { MigrationsBaseCommand } from './MigrationsBaseCommand'
import { ApplicationContract } from '../../Contracts/ApplicationContract';
import { Inject } from '../../Decorators';

/**
 * The command is meant to migrate the database by execute migrations
 * in `up` direction.
 */
export class RollbackCommand extends MigrationsBaseCommand {
  public static commandName = 'migration:rollback'
  public static description = 'Rollback migrations to a given batch number'

  @flags.string({ description: 'Define a custom database connection' })
  public connection: string

  @flags.boolean({ description: 'Print SQL queries, instead of running the migrations' })
  public dryRun: boolean

  @flags.boolean({ description: 'Explictly force to run migrations in production' })
  public force: boolean

  @flags.number({
    description: 'Define custom batch number for rollback. Use 0 to rollback to initial state',
  })
  public batch: number

  @flags.boolean({ description: 'Do not close database connection when seeder.run finishes' })
  public keepAlive: boolean

  /**
     * This command loads the application, since we need the runtime
     * to find the migration directories for a given connection
     */
  public static settings = {
    loadApp: true,
  }

  constructor (app: ApplicationContract, kernel: Kernel, @Inject('db') private db: any) {
    super(app as any, kernel)
  }

  /**
     * Handle command
     */
  public async handle (): Promise<void> {
    const connection = this.db.getRawConnection(this.connection || this.db.primaryConnectionName)
    let continueMigrations = ! this.application.inProduction || this.force

    /**
         * Ensure the define connection name does exists in the
         * config file
         */
    if (! connection) {
      this.logger.error(
        `${ this.connection } is not a valid connection name. Double check config/database file`,
      )
      return
    }

    /**
         * Ask for prompt when running in production and `force` flag is
         * not defined
         */
    if (! continueMigrations) {
      try {
        continueMigrations = await this.prompt
          .confirm('You are in production environment. Want to continue running migrations?')
      } catch (error) {
        continueMigrations = false
      }
    }

    /**
         * Prompt cancelled or rejected and hence do not continue
         */
    if (! continueMigrations) {
      return
    }

    /**
         * New up migrator
         */
    const { Migrator } = await import('@tngraphql/lucid/build/src/Migrator/Migrator')

    const migrator = new Migrator(this.db, this.application as any, {
      direction: 'down',
      batch: this.batch,
      connectionName: this.connection,
      dryRun: this.dryRun,
    })

    this.printPreviewMessage()
    await this.runMigrations(migrator)

    // close connection db
    if (! this.keepAlive) {
      await migrator.close()
    }
  }
}
