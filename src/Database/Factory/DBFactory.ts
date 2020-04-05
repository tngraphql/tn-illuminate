'use strict'
import { DatabaseFactory } from './DatabaseFactory'
import { ModelFactory } from './ModelFactory'
import { ContainerContract } from './ContainerContract'
import { Container } from './Container'
import { InvalidArgumentException } from './InvalidArgumentException'
import { Chance } from 'chance'
import { BlueprintResolutionException } from './BlueprintResolutionException'

export interface Blueprint<T = any> {
  name: string;
  callback: (faker: Chance, index: number, data: any) => Promise<T>
}

/**
 * Factory class is used to define blueprints
 * and then get model or database factory
 * instances to seed the database.
 *
 * @class Factory
 * @constructor
 */
export class DBFactory {
  protected _blueprints: Blueprint[] = []

  protected app: ContainerContract = new Container()

  constructor (app?: ContainerContract) {
    if (app) {
      this.app = app
    }
  }

  /**
     * Register a new blueprint with model or table name
     * and callback to be called to return the fake data
     * for model instance of table insert query.
     *
     * @method blueprint
     *
     * @param  {String}   name
     * @param  {Function} callback
     *
     * @chainable
     *
     * @example
     * ```js
     * Factory.blueprint('App/Model/User', (fake) => {
     *   return {
     *     username: fake.username(),
     *     password: async () => {
     *       return await Hash.make('secret')
     *     }
     *   }
     * })
     * ```
     */
  public blueprint (name, callback): this {
    if (typeof (callback) !== 'function') {
      throw new InvalidArgumentException('Factory.blueprint expects a callback as 2nd parameter')
      // .invalidParameter('Factory.blueprint expects a callback as 2nd parameter', callback)
    }
    this._blueprints.push({ name, callback })
    return this
  }

  /**
     * Returns the blueprint map with the map
     * and the callback.
     *
     * @method getBlueprint
     *
     * @param  {String}     name
     *
     * @return {Object}
     */
  public getBlueprint (name): Blueprint | undefined {
    return this._blueprints.find((blueprint) => blueprint.name === name)
  }

  /**
     * Get model factory for a registered blueprint.
     *
     * @method model
     *
     * @param  {String} name
     *
     * @return {ModelFactory}
     */
  public model (name) {
    const blueprint = this.getBlueprint(name)
    if (! blueprint) {
      throw new BlueprintResolutionException(`Resolve blueprint [${ name }] does not exists.`)
    }
    return new ModelFactory(this.app, blueprint.name, blueprint.callback)
  }

  /**
     * Get database factory instance for a registered blueprint
     *
     * @method get
     *
     * @param  {String} name
     *
     * @return {DatabaseFactory}
     */
  public get (name) {
    const blueprint = this.getBlueprint(name)
    if (! blueprint) {
      throw new BlueprintResolutionException(`Resolve blueprint [${ name }] does not exists.`)
    }

    return new DatabaseFactory(this.app, blueprint.name, blueprint.callback)
  }

  /**
     * Clear all the registered blueprints.
     *
     * @method clear
     *
     * @return {void}
     */
  public clear (): void {
    this._blueprints = []
  }
}
