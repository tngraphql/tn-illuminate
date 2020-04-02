/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/24/2020
 * Time: 3:47 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const fs_1 = require('fs');
const path = require('path');
const utils_1 = require('@poppinss/utils');

/**
 * Loads file from the disk and optionally ignores the missing
 * file errors
 */
function loadFile(filePath, optional = false) {
    try {
        return fs_1.readFileSync(filePath, 'utf-8');
    } catch (error) {
        if ( error.code !== 'ENOENT' ) {
            throw error;
        }
        if ( ! optional ) {
            throw new utils_1.Exception(`The ${ filePath } file is missing`, 500, 'E_MISSING_ENV_FILE');
        }
    }
    return '';
}

/**
 * Reads `.env` file contents
 */
export function envLoader(pathFileEnv) {
    const envPath = process.env.ENV_PATH || pathFileEnv;
    const absPath = path.isAbsolute(envPath) ? envPath : path.join(process.cwd(), envPath);
    const envContents = loadFile(absPath, process.env.ENV_SILENT === 'true');
    /**
     * Optionally loading the `.env.testing` file in test environment
     */
    let testEnvContent = '';
    if ( process.env.NODE_ENV === 'testing' ) {
        testEnvContent = loadFile(path.join(process.cwd(), '.env.testing'), true);
    }
    return { testEnvContent, envContents };
}