/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 8/27/2020
 * Time: 10:01 AM
 */
import * as Errors from "validatorjs/src/errors";

export class ValidationException extends Error {
    public validator: any;

    public name: string = 'ValidationError';

    public type = 'ValidationException';

    public code = 422;

    constructor(validationErrors?: any) {
        super('The given data was invalid.');
        this.validator = validationErrors;
    }

    public errors() {
        return this.validator ? this.validator.errors.all() : [];
    }

    public static withMessages(messages) {
        const validator = new Errors();

        for (const [attribute, value] of Object.entries(messages)) {
            for (const message of wrap(value)) {
                validator.add(attribute, message);
            }
        }

        return new this(validator);
    }
}

function wrap(value) {
    if (value === null || value === undefined) {
        return [];
    }

    return Array.isArray(value) ? value : [value];
}