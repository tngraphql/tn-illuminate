/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 6/2/2020
 * Time: 8:34 PM
 */
import {Facade} from "../Facade";
import {ConsoleKernel} from "../../Foundation/Console";

export const Ace: ConsoleKernel = Facade.create<ConsoleKernel>('ace');