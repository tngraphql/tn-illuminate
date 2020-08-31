/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 8/31/2020
 * Time: 7:28 AM
 */

import { Application, LoadConfiguration } from '../../src/Foundation';
import {Encrypter} from "../../src/Encryption/Encrypter";
import {EncryptionServiceProvider} from "../../src/Encryption/EncryptionServiceProvider";
import {Facade} from "../../src/Support/Facade";
import {Crypt} from "../../src/Support/Facades";

const key = Buffer.from('UZKEq+/2azmr5OLgUC7Ak5lQUHkmqoUXvEO/Vr19PeU=', 'base64');

const payloadSerialize = 'eyJpdiI6IklRbGxFVkxnZ2Y3RnNhSnJtQTRldFE9PSIsInZhbHVlIjoiOFlIQVlJMWFuWm4xdkdwUFNlNHZ6UT09IiwibWFjIjoiZTk2ZTY2NmI5NmVjNjAxYjQzOTk3NWZiMTNjMzQ1ODBjNjEwMDA2ODQzYTY0OTM0YTVhM2EyNmYzMzMxMzY0NyJ9';
const payload = 'eyJpdiI6IktyUTIzQVkrY01WYnN1OEsxM3REeGc9PSIsInZhbHVlIjoiK29hdG9rKzg4VDUwc1BWNTd5WmFxZz09IiwibWFjIjoiNTJmNmRiYzcwZDUyZjJiOTk5ZjQxYTYyZTkyYmM4ZTNkYzk1ODA1ODZmZTYxNDkzZGIxZDgwZWI5YjE0ZTAxNSJ9';

describe('crypt', () => {
    let hash: Encrypter;
    beforeEach(async () => {
        hash = new Encrypter(key, 'AES-256-CBC');
    });

    it('should encrypt a string', async () => {
        const value = '123456';

        expect(hash.encrypt(value as any)).toBeDefined();
        expect(hash.encrypt(value as any)).not.toEqual(hash.encrypt(value as any));
    });

    it('should encrypt a number', async () => {
        const value = 123456;

        expect(hash.encrypt(value as any)).toBeDefined();
        expect(hash.encrypt(value as any)).not.toEqual(hash.encrypt(value as any));
    });

    it('should encrypt a array', async () => {
        const value = [123];

        expect(hash.encrypt(value as any)).toBeDefined();
        expect(hash.encrypt(value as any)).not.toEqual(hash.encrypt(value as any));
    });

    it('should encrypt a object', async () => {
        const value = {a: 123456};

        expect(hash.encrypt(value as any)).toBeDefined();
        expect(hash.encrypt(value as any)).not.toEqual(hash.encrypt(value as any));
    });

    it('should encrypt a null', async () => {
        const value = null;

        expect(hash.encrypt(value as any)).toBeDefined();
        expect(hash.encrypt(value as any)).not.toEqual(hash.encrypt(value as any));
    });

    it('should encrypt a empty', async () => {
        const value = '';

        expect(hash.encrypt(value as any)).toBeDefined();
        expect(hash.encrypt(value as any)).not.toEqual(hash.encrypt(value as any));
    });

    it('should throw error when value is undefined', async () => {
        expect.assertions(1);

        const value = undefined;

        try {
            hash.encrypt(value as any)
        } catch (e) {
            expect(e).toBeDefined();
        }
    });

    it('should throw error when not input value', async () => {
        expect.assertions(1);

        try {
            // @ts-ignore
            hash.encrypt();

        } catch (e) {
            expect(e).toBeDefined();
        }
    });

    it('should decrypt', async () => {
        expect(hash.decrypt(payloadSerialize)).toEqual('123456');
        expect(hash.decrypt(hash.encrypt('123456'))).toEqual('123456');
        expect(hash.decrypt(hash.encrypt(123456 as any))).toEqual(123456);
        expect(hash.decryptString(hash.encryptString('123456'))).toEqual('123456');
        expect(hash.decryptString(hash.encryptString(123456 as any))).toEqual('123456');
        expect(hash.decryptString(payload)).toEqual('123456');
    });

    it('should throw error when encryptString have value not string', async () => {
        expect.assertions(1);
        try {
            hash.encryptString({} as any);
        } catch (e) {
            expect(e).toBeDefined();
        }
    });

    it('should register encryption', async () => {
        const app = new Application();
        new LoadConfiguration().bootstrap(app);
        app.config.set('app', {
            key: 'base64:UZKEq+/2azmr5OLgUC7Ak5lQUHkmqoUXvEO/Vr19PeU=',
            cipher: 'AES-256-CBC'
        });
        await app.register(new EncryptionServiceProvider(app));

        const hash: Encrypter = app.make('encrypter');

        expect(hash.encryptString('123456')).toBeDefined();
    });

    it('should register facades Crypt', async () => {
        const app = new Application();
        new LoadConfiguration().bootstrap(app);
        app.config.set('app', {
            key: 'base64:UZKEq+/2azmr5OLgUC7Ak5lQUHkmqoUXvEO/Vr19PeU=',
            cipher: 'AES-256-CBC'
        });
        await app.register(new EncryptionServiceProvider(app));

        Facade.setFacadeApplication(app);

        expect(Crypt.encryptString('123456')).toBeDefined();
    });

    it('generate key 256', async () => {
        const key = Encrypter.generateKey('AES-256-CBC');
        expect(key.length === 32).toBeTruthy();
    });

    it('generate key 128', async () => {
        const key = Encrypter.generateKey('AES-128-CBC');
        expect(key.length === 16).toBeTruthy();
    });

    it('No application encryption key has been specified.', async () => {
        expect.assertions(1);
        const app = new Application();
        new LoadConfiguration().bootstrap(app);
        app.config.set('app', {
            key: '',
            cipher: 'AES-256-CBC'
        });
        await app.register(new EncryptionServiceProvider(app));

        try {
            const hash: Encrypter = app.make('encrypter');
        } catch (e) {
            expect(e.message).toBe('No application encryption key has been specified.');
        }
    });
});