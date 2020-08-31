/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 8/31/2020
 * Time: 7:26 AM
 */
import {Facade} from "../Facade";
import {Encrypter} from "../../Encryption/Encrypter";

export const Crypt: Encrypter = Facade.create<Encrypter>('encrypter');