'use strict'
import { chance } from './chance'
import _ = require('lodash')
import { ContainerContract } from './ContainerContract'

/**
 * Model factory to seed database using Lucid
 * models
 *
 * @class DatabaseFactory
 * @constructor
 */
export class DatabaseFactory {
  protected _returningColumn = null
  protected _connection = null

  constructor (protected app: ContainerContract, public tableName: string,
    public dataCallback: (faker?: any, index?: number, data?: any) => any| Promise<any>) {
  }

  /**
     * Returns the query builder instance for
     * a given connection
     *
     * @method _getQueryBuilder
     *
     * @return {Object}
     *
     * @private
     */
  protected _getQueryBuilder () {
    return this._connection
      ? this.app.use('db').connection(this._connection)
      : this.app.use('db')
  }

  /**
     * Make a single instance of blueprint for a given
     * index. This method will evaluate the functions
     * in the return payload from blueprint.
     *
     * @method _makeOne
     * @async
     *
     * @param  {Number} index
     * @param  {Object} data
     *
     * @return {Object}
     *
     * @private
     */
  protected async _makeOne (index, data) {
    const hash = await this.dataCallback(chance, index, data)
    const keys = _.keys(hash)

    /**
     * Evaluate all values
     */
    const values = await Promise.all(_.map(_.values(hash), (val) => {
      return typeof (val) === 'function' ? Promise.resolve(val()) : val
    }))

    /**
     * Pair them back in same order
     */
    // eslint-disable-next-line no-shadow
    return _.transform(keys, (result, key, index) => {
      result[key] = values[index]
      return result
    }, {})
  }

  /**
   * Set table to used for the database
   * operations
   *
   * @method table
   *
   * @param  {String} tableName
   *
   * @chainable
   */
  public table (tableName) {
    this.tableName = tableName
    return this
  }

  /**
   * Specify the returning column from the insert
   * query
   *
   * @method returning
   *
   * @param  {String}  column
   *
   * @chainable
   */
  public returning (column) {
    this._returningColumn = column
    return this
  }

  /**
   * Specify the connection to be used on
   * the query builder
   *
   * @method connection
   *
   * @param  {String}   connection
   *
   * @chainable
   */
  public connection (connection) {
    this._connection = connection
    return this
  }

  /**
   * Make a single model instance with attributes
   * from blueprint fake values
   *
   * @method make
   * @async
   *
   * @param  {Object} data
   * @param  {Number} [index = 0]
   *
   * @return {Object}
   */
  public async make (data = {}, index = 0) {
    return this._makeOne(index, data)
  }

  /**
   * Make x number of model instances with
   * fake data
   *
   * @method makeMany
   * @async
   *
   * @param  {Number} instances
   * @param  {Object} [data = {}]
   *
   * @return {Array}
   */
  public async makeMany (instances, data = {}) {
    return Promise.all(_.map(_.range(instances), (index) => this.make(data, index)))
  }

  /**
   * Create model instance and persist to database
   * and then return it back
   *
   * @method create
   * @async
   *
   * @param  {Object} data
   *
   * @return {Object}
   */
  public async create (data = {}, index = 0) {
    const attributes = await this.make(data, index)
    const query = this._getQueryBuilder().table(this.tableName)

    if (this._returningColumn) {
      query.returning(this._returningColumn)
    }

    return query.insert(attributes)
  }

  /**
   * Persist multiple model instances to database and get
   * them back as an array
   *
   * @method createMany
   * @async
   *
   * @param  {Number}   numberOfRows
   * @param  {Object}   [data = {}]
   *
   * @return {Array}
   */
  public async createMany (numberOfRows, data = {}) {
    const rows: any = []

    for(let index of _.range(numberOfRows)) {
      const row = await this.create(data, index)
      rows.push(row)
    }

    return rows
  }

  /**
   * Truncate the database table
   *
   * @method reset
   * @async
   *
   * @return {Number}
   */
  public async reset () {
    return this._getQueryBuilder()
      .connection(this._connection || this.app.use('db').primaryConnectionName)
      .truncate(this.tableName)
  }
}
