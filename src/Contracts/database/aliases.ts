/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/5/2020
 * Time: 9:56 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Adapter as AdapterBase } from '@adonisjs/lucid/build/src/Orm/Adapter';
import { BaseModel as BaseModelBase } from '@adonisjs/lucid/build/src/Orm/BaseModel';
import { Schema as SchemaBase } from '@adonisjs/lucid/build/src/Schema';
import {
    belongsTo as belongsToBase,
    column as columnBase,
    computed as computedBase,
    hasMany as hasManyBase,
    hasManyThrough as hasManyThroughBase,
    hasOne as hasOneBase,
    manyToMany as manyToManyBase
} from '@adonisjs/lucid/build/src/Orm/Decorators';
import { Database as DatabaseBase } from '@adonisjs/lucid/build/src/Database';

export const Adapter = AdapterBase;
export const BaseModel = BaseModelBase;
export const Schema = SchemaBase;
export const Database = DatabaseBase;
export const column = columnBase;
export const belongsTo = belongsToBase;
export const computed = computedBase;
export const hasMany = hasManyBase;
export const hasManyThrough = hasManyThroughBase;
export const hasOne = hasOneBase;
export const manyToMany = manyToManyBase;
