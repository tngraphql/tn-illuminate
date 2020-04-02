import { Application } from '../Application';
import { BaseCommand } from 'tn-console';
import { outputFile, pathExists } from 'fs-extra'
import { GeneratorFile } from 'tn-console/dist/Generator/File';
import * as path from 'path';
import camelCase from "camelcase";
import {snakeCase} from "snake-case";

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/14/2020
 * Time: 8:00 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
export abstract class GeneratorCommand extends BaseCommand {
    application: Application;

    /**
     * Get the stub file for the generator.
     *
     * @return string
     */
    protected abstract getStub(): string;

    protected abstract getSuffix(): string;

    // /**
    //  * The name of the class file.
    //  */
    // @args.string({ description: 'Name of the class file' })
    public name: string

    protected fileOptions() {
        return { suffix: '' };
    }

    /**
     * Execute the console command.
     *
     * @return bool|null
     */
    public async handle(...args: any[]): Promise<boolean> {
        await this.generateFile(this.getDestinationPath(), null, this.fileOptions());

        return true;
    }

    async generateFile(filePath, template, options) {
        const file = new GeneratorFile(this.buildClass(this.name), options);

        file.destinationDir(filePath);

        file.stub(this.getStub());

        if (template) {
            file.apply(template);
        }

        const fileJSON = file.toJSON();
        const exists = await this.alreadyExists(fileJSON.filepath);

        if ( exists && !this['force']) {
            this.logger.skip(`${ fileJSON.relativepath } already exists`);
            return false;
        }

        await this.put(fileJSON.filepath, fileJSON.contents);
        this.logger.create(fileJSON.relativepath);
    }

    getDestinationPath() {
        return path.join(this.application.getBasePath(), 'commands');
    }

    async alreadyExists(rawName: string): Promise<boolean> {
        return pathExists(rawName);
    }

    async put(filepath, contents): Promise<void> {
        return outputFile(filepath, contents);
    }

    /**
     * Build the class with the given name.
     *
     */
    buildClass(name: string) {
        return name;
    }
}
