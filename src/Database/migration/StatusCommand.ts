import * as CliTable from 'cli-table3'
import { flags, Kernel } from '@tngraphql/console'
import { MigrationsBaseCommand } from './MigrationsBaseCommand'
import { ApplicationContract } from '../../Contracts/ApplicationContract';
import { Inject } from '../../Decorators';
import {DatabaseContract} from "@tngraphql/lucid/build/src/Contracts/Database/DatabaseContract";
import {MigrationListNode} from "@tngraphql/lucid/build/src/Contracts/MigratorContract";

interface DBInterface extends DatabaseContract {

}

/**
 * The command is meant to migrate the database by execute migrations
 * in `up` direction.
 */
export class StatusCommand extends MigrationsBaseCommand {
  public static commandName = 'migration:status'
  public static description = 'Check migrations current status'

  @flags.string({ description: 'Define a custom database connection' })
  public connection: string

  @flags.boolean({ description: 'Output as JSON' })
  public json: boolean

  /**
     * This command loads the application, since we need the runtime
     * to find the migration directories for a given connection
     */
  public static settings = {
    loadApp: true,
  }

  constructor (app: ApplicationContract, kernel: Kernel, @Inject('db') private db: DBInterface) {
    super(app as any, kernel)
  }

  /**
     * Colorizes the status string
     */
  private colorizeStatus (status: MigrationListNode['status']): string {
    switch (status) {
      case 'pending':
        return this.colors.yellow('pending')
      case 'migrated':
        return this.colors.green('completed')
      case 'corrupt':
        return this.colors.red('corrupt')
    }
  }

  /**
     * Handle command
     */
  public async handle (): Promise<void> {
    const connection = this.db.getRawConnection(this.connection || this.db.primaryConnectionName)

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

    const { Migrator } = await import('@tngraphql/lucid/build/src/Migrator/Migrator')

    const migrator = new Migrator(this.db, this.application as any, {
      direction: 'up',
      connectionName: this.connection,
    })

    const list = await migrator.getList()

    this.printPreviewMessage()

    if (this.json) {
      this.log(JSON.stringify(list))
    } else {
      this.log(this.outputTable(list))
    }
  }

  outputTable (list) {
    const table = new CliTable({
      head: ['Name', 'Status', 'Batch', 'Message'],
    })

    /**
         * Push a new row to the table
         */
    list.forEach((node) => {
      table.push([
        node.name,
        this.colorizeStatus(node.status),
        node.batch || 'NA',
        node.status === 'corrupt' ? 'The migration file is missing on filesystem' : '',
      ] as any)
    })
    return table
  }

  /**
     * Log message
     */
  log (message) {
    if (this.application.environment === 'test') {
      this.logger.logs.push(message)
    } else {
      console.log(message)
    }
  }
}
