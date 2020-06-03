/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 6/3/2020
 * Time: 8:47 AM
 */
import {Facade} from "../Facade";
import {HashManager} from "../../Hashing/HashManager";

export const Factory: HashManager = Facade.create<HashManager>('hash')