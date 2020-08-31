/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 8/30/2020
 * Time: 10:39 PM
 */
import * as assert from "assert";
const crypto = require('crypto');
const Serialize = require('php-serialize');

export class Encrypter {
    constructor(protected key, protected cipher = 'AES-128-CBC') {
        if (!Encrypter.supported(key, cipher)) {
            throw new Error('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths.');
        }
    }

    public static supported(key, cipher = 'AES-128-CBC'): boolean {
        const length = key.length;

        return (cipher === 'AES-128-CBC' && length === 16) ||
            (cipher === 'AES-256-CBC' && length === 32);
    }

    public static generateKey(cipher: string) {
        return crypto.randomBytes(cipher === 'AES-128-CBC' ? 16 : 32);
    }

    /**
     * Encrypt the given value.
     *
     * @param value
     * @param serialize
     */
    public encrypt(value: string|number, serialize: boolean = true): string {

        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(this.cipher, this.key, iv);

        if (serialize) {
            value = Serialize.serialize(value);
        }

        value = cipher.update(value, 'utf8', 'base64') + cipher.final('base64');

        const mac = this.hash(iv.toString('base64'), value);

        const json = JSON.stringify({
            iv: iv.toString('base64'),
            value,
            mac: mac.toString('hex')
        });

        return Buffer.from(json).toString('base64');
    }

    protected hash(iv, value) {
        return hash_hmac('sha256', iv + value, this.key);
    }

    public encryptString(value: string): string {
        if (typeof value === "number") {
            value = value + '';
        }
        return this.encrypt(value, false);
    }

    public decrypt(payload: any, serialize: boolean = true) {
        payload = this.getJsonPayload(payload);

        const iv = Buffer.from(payload.iv, 'base64'); // decode base64

        const decipher = crypto.createDecipheriv(this.cipher, this.key, iv);

        const decrypted = decipher.update(payload.value, 'base64', 'utf8') + decipher.final('utf8')

        if (serialize) {
            return Serialize.unserialize(decrypted);
        }

        return decrypted;
    }

    protected getJsonPayload(cipher): any {
        const b: any = Buffer.from(cipher, 'base64');

        let payload = JSON.parse(b);

        if ( ! this.validPayload(payload) ) {
            throw new Error('The payload is invalid.');
        }

        if ( ! this.validMac(payload) ) {
            throw new Error('The MAC is invalid.');
        }

        return payload;
    }

    protected validPayload(payload: any): boolean {
        return typeof payload === 'object' && payload.hasOwnProperty('iv') &&
            payload.hasOwnProperty('value') && payload.hasOwnProperty('mac');
    }

    protected validMac(payload: any) {
        const bytes = crypto.randomBytes(16);

        const calculated = this.calculateMac(payload, bytes).toString('hex');

        return hash_equals(hash_hmac('sha256', payload.mac, bytes).toString('hex'), calculated);
    }

    protected calculateMac(payload, bytes) {
        return hash_hmac('sha256', this.hash(payload.iv, payload.value).toString('hex'), bytes);
    }

    public decryptString(payload: string): string {
        return this.decrypt(payload, false);
    }

    /**
     * Get the encryption key.
     */
    public getKey() {
        return this.key;
    }
}

function hash_hmac(algorithm: string, data, key) {
    const sha = crypto.createHmac(algorithm, key);

    sha.update(data.toString());

    return sha.digest();
}

function hash_equals(answer: string, guess: string) {

    assert(typeof answer === 'string' && typeof guess === 'string', 'both arguments should be strings');

    const rb = crypto.pseudoRandomBytes(32);
    const ahmac = crypto.createHmac('sha256', rb).update(answer).digest('hex');
    const ghmac = crypto.createHmac('sha256', rb).update(guess).digest('hex');

    const len = ahmac.length;

    let result = 0;
    for (let i = 0; i < len; ++i) {
        result |= (ahmac.charCodeAt(i) ^ ghmac.charCodeAt(i));
    }
    return result === 0;
};