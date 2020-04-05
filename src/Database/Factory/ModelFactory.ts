'use strict'
import _ = require('lodash')
import {chance } from './chance'
import { ContainerContract } from './ContainerContract'

/**
 * Model factory to seed database using Lucid
 * models
 *
 * @class ModelFactory
 * @constructor
 */
export class ModelFactory {
  constructor (protected app: ContainerContract, public Model, public dataCallback: (faker?: any, index?: number, data?: any) => any | Promise<any>) {
  }

  /**
     * New up a model with attributes
     *
     * @method _newup
     *
     * @param  {Object} attributes
     *
     * @return {Object}
     *
     * @private
     */
  protected _newup (attributes) {
    const modelInstance = new (this.app.use(this.Model))()
    modelInstance.fill(attributes)
    return modelInstance
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
    return _.transform(keys, (result, key, index) => {
      result[key] = values[index]
      return result
    }, {})
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
    const attributes = await this._makeOne(index, data)
    return this._newup(attributes)
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
    const modelInstance = await this.make(data, index)
    await modelInstance.save()
    return modelInstance
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
    return Promise.all(_.map(_.range(numberOfRows), (index) => this.create(data, index)))
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
    return this.app.use(this.Model).truncate()
  }
}
