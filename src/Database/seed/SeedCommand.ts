import { BaseCommand, flags } from '@tngraphql/console'
import * as path from 'path'
import _ = require('lodash')
import { requireAll } from '@poppinss/utils/build'
import { ApplicationContract } from '../../Contracts/ApplicationContract';
import { isClass } from '../../utils';

const prettyHrTime = require('pretty-hrtime')
var fs = require('fs')

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/22/2020
 * Time: 1:27 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const DEFAULT_EXCLUDE_DIR = /^\./
const DEFAULT_FILTER = /^([^\.].*)\.ts(on)?$/
const DEFAULT_RECURSIVE = true

export class SeedCommand extends BaseCommand {
  public static commandName: string = 'seed'
  public static description: string = 'Seed database using seed files'

  @flags.string({ description: 'Define a custom database connection' })
  public connection: string

  @flags.boolean({ description: 'Forcefully seed database in production' })
  public force: boolean

  @flags.string({ description: 'Run only selected files' })
  public files: string

  @flags.boolean({ description: 'Do not close database connection when seeder.run finishes' })
  public keepAlive: boolean

  protected _seedsPath: string = this.application.basePath('database/seeds')

  constructor (public application: ApplicationContract, kernel) {
    super(application, kernel)
  }

  public async handle (): Promise<any> {
    try {
      this._validateState(this.force)

      requireAll(this.application.basePath('database'), true)

      const startTime = process.hrtime()

      const files = this.files ? this.files.split(',') : null
      const allFiles: Function[] = this._getSeedFiles(files) as Function[]

      if (! _.size(allFiles)) {
        return this.logger.info('Nothing to seed');
      }

      for(const file of _.keys(allFiles)) {
        const resolve = this.getResolve(allFiles, file)
        const seedInstance: any = this.application.make(resolve)

        if (typeof (seedInstance.run) === 'function') {
          // eslint-disable-next-line no-shadow
          const startTime: any = process.hrtime()
          await seedInstance.run()
          const endTime = process.hrtime(startTime)
          this.logger.success(`Seeded [${ file }] ${ prettyHrTime(endTime) }`)
        } else {
          this.logger.warn(`[${ seedInstance.constructor.name }] does not have a run method`)
        }
      }

      const endTime = process.hrtime(startTime)

      this.logger.success(`Seeded database in ${ prettyHrTime(endTime) }`)
    } catch (e) {
      console.log(e)
    }
    if (! this.keepAlive) {
      await this.application.use('db').manager.closeAll()
    }
  }

  /**
     * Throws exception when trying to run migrations are
     * executed in production and not using force flag.
     *
     * @method _validateState
     *
     * @param  {Boolean}       force
     *
     * @return {void}
     *
     * @private
     *
     * @throws {Error} If NODE_ENV is production
     */
  protected _validateState (force) {
    if (this.application.inProduction && !force) {
      throw new Error('Cannot run seeds in production. Use --force flag to continue')
    }
  }

  public getResolve (files, file) {
    if (! files) {
      return
    }

    if (isClass(files[file])) {
      return files[file]
    }

    const object = files[file]

    if (typeof object === 'object') {
      if (object.default) {
        return object.default
      }

      if (object[path.basename(file, path.extname(file))]) {
        return object[path.basename(file, path.extname(file))]
      }
    }

    return
  }

  /**
     * Returns an object of all schema files
     *
     * @method _getSeedFiles
     *
     * @return {Object}
     *
     * @private
     */
  protected _getSeedFiles (selectedFiles) {
    return this.requireAll({
      dirname: this._seedsPath,
      filter: (fileName) => {
        if (! selectedFiles && fileName.match(/(.*)\.(ts|js)$/)) {
          return fileName
        }

        return _.find(selectedFiles, (file) => file.trim().endsWith(fileName))
      },
    })
  }

  /*private __getSeedFunction (seeds) {
    let result: any = []

    // @ts-ignore
    for(let [key, seed] of Object.entries(seeds)) {
      if (! seed) {
        continue
      }
      if (isClass(seed)) {
        result.push(seed)
      }
      if (typeof seed === 'object') {
        result = [...result, ...this.__getSeedFunction(seed)]
      }
    }

    return result as Function[]
  }*/

  public requireAll (options) {
    const dirname = typeof options === 'string' ? options : options.dirname
    const excludeDirs = options.excludeDirs === undefined ? DEFAULT_EXCLUDE_DIR : options.excludeDirs
    const filter = options.filter === undefined ? DEFAULT_FILTER : options.filter
    const modules = {}
    const recursive = options.recursive === undefined ? DEFAULT_RECURSIVE : options.recursive
    const resolve = options.resolve || this.identity
    const map = options.map || this.identity

    // eslint-disable-next-line no-shadow
    function excludeDirectory (dirname: any) {
      return ! recursive ||
                (excludeDirs && dirname.match(excludeDirs))
    }

    function filterFile (filename) {
      if (typeof filter === 'function') {
        return filter(filename)
      }

      var match = filename.match(filter)
      if (! match) {
        return
      }

      return match[1] || match[0]
    }

    const files = fs.readdirSync(dirname)

    files.forEach((file) => {
      const filepath = dirname + '/' + file
      if (fs.statSync(filepath).isDirectory()) {
        if (excludeDirectory(file)) {
          return
        }

        const subModules = this.requireAll({
          dirname: filepath,
          filter: filter,
          excludeDirs: excludeDirs,
          map: map,
          resolve: resolve,
        })

        if (Object.keys(subModules).length === 0) {
          return
        }

        modules[map(file, filepath)] = subModules
      } else {
        const name = filterFile(file)
        if (! name) {
          return
        }

        modules[map(name, filepath)] = resolve(require(filepath))
      }
    })

    return modules
  };

  public identity (val) {
    return val
  }
}
