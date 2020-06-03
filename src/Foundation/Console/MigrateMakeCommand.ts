/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/14/2020
 * Time: 4:26 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { args, flags } from '@tngraphql/console';
import { GeneratorCommand } from './GeneratorCommand';
import * as path from 'path';
import { GeneratorFile } from '@tngraphql/console/dist/Generator/File';
import { snakeCase } from 'snake-case';
import camelCase from 'camelcase'

export class MigrateMakeCommand extends GeneratorCommand {
    protected getStub(): string {
        return path.join(__dirname, 'stub/migration-make.stub');
    }

    protected getSuffix(): string {
        return '';
    }
    /**
     * Command name. The command will be registered using this name only. Make
     * sure their aren't any spaces inside the command name.
     */
    static commandName: string = 'make:migration';

    static description: string = 'Make a new migration file';

    /**
     * The name of the migration file. We use this to create the migration
     * file and generate the table name
     */
    @args.string({ description: 'Name of the migration file' })
    public name: string

    /**
     * Custom table name for creating a new table
     */
    @flags.string({ description: 'Define the table name for creating a new table' })
    public create: string

    /**
     * Custom table name for altering an existing table
     */
    @flags.string({ description: 'Define the table name for altering an existing table' })
    public table: string

    async handle(...args: any[]): Promise<boolean> {
        /**
         * Using the user defined table name or an empty string. We can attempt to
         * build the table name from the migration file name, but let's do that
         * later.
         */
        const tableName = this.table || this.create || ''

        /**
         * Prepend timestamp to keep schema files in the order they
         * have been created
         */
        const prefix = `${new Date().getTime()}_`

        const file = new GeneratorFile(this.buildClass(this.name), { pattern: 'snakecase', prefix});

        file.destinationDir(path.join(this.application.getBasePath(), 'database/migrations'));

        file.stub(this.getStub());

        file.apply({
            toClassName (filename: string) {
                return camelCase(tableName || filename.replace(prefix, ''), { pascalCase: true })
            },
            toTableName (filename: string) {
                return tableName || snakeCase(filename.replace(prefix, ''))
            }
        })

        const fileJSON = file.toJSON();
        const exists = await this.alreadyExists(fileJSON.filename);

        if ( exists ) {
            this.logger.skip(`${ fileJSON.relativepath } already exists`);
            return false;
        }

        await this.put(fileJSON.filepath, fileJSON.contents);
        this.logger.create(fileJSON.relativepath);

        return true;
    }
}
