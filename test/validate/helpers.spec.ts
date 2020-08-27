/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/17/2020
 * Time: 8:22 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { compileMessages, compileRules, handlerRulers } from '../../src/Foundation/Validate/helpers';
import { Rules } from '../../src/Decorators/Rules';
import { Rule } from '../../src/Foundation/Validate/Rule';

require('reflect-metadata');

describe('Utils | Handler rulers', () => {
    it('Handler simple rule Args', async () => {
        class SimpleArgs {
            @Rules('string')
            name: string;
        }

        const ruleObject = await handlerRulers(SimpleArgs.prototype, {});
        expect(ruleObject).toEqual({ name: { data: 'string' } });
        const rules = compileRules(ruleObject);
        expect(rules).toEqual({ name: 'string' });
    });

    it('Handler simple rule object', async () => {
        class SimpleArgs {
            @Rules(Rule.unique('users', 'email'))
            name: string;
        }

        const ruleObject = await handlerRulers(SimpleArgs.prototype, {});
        expect(ruleObject).toEqual({
            'name': {
                'data': [
                    {
                        'unique': {
                            'column': 'email',
                            'ignore': {
                                'id': null,
                                'idColumn': 'id'
                            },
                            'model': 'users',
                            'where': []
                        }
                    }
                ]
            }
        });
        const rules = compileRules(ruleObject);
        expect(rules).toEqual({
            "name": [
                {
                    "unique": {
                        "column": "email",
                        "ignore": {
                            "id": null,
                            "idColumn": "id"
                        },
                        "model": "users",
                        "where": []
                    }
                }
            ]
        });
    });

    it('Handler simple rule callback', async () => {
        class SimpleArgs {
            @Rules(args => {
                return 'min:10'
            })
            name: string;
        }

        const ruleObject = await handlerRulers(SimpleArgs.prototype, { name: '10' });
        expect(ruleObject).toEqual({ name: { data: 'min:10' } });
        const rules = compileRules(ruleObject);
        expect(rules).toEqual({ name: 'min:10' });
    });

    it('pass args into callback', async () => {
        class SimpleArgs {
            @Rules(args => {
                return 'min:' + args.name
            })
            name: string;
        }

        const ruleObject = await handlerRulers(SimpleArgs.prototype, { name: '10' });
        expect(ruleObject).toEqual({ name: { data: 'min:10' } });
        const rules = compileRules(ruleObject);
        expect(rules).toEqual({ name: 'min:10' });
    });

    it('Handler simple custom message', async () => {
        class SimpleArgs {
            @Rules('string', {
                string: 'custom message :attribute'
            })
            name: string;
        }

        const ruleObject = await handlerRulers(SimpleArgs.prototype, {});
        expect(ruleObject).toEqual({ name: { data: 'string', messages: { string: 'custom message :attribute' } } });
        const rules = compileRules(ruleObject);
        expect(rules).toEqual({ name: 'string' });
        const messages = compileMessages(ruleObject);
        expect(messages).toEqual({ 'string.name': 'custom message :attribute' });
    });

    it('Handler simple custom message args', async () => {
        class SimpleArgs {
            @Rules('string', (ctx, args) => {
                if (args.type === 'name') {
                    return {
                        string: 'custom message name :attribute'
                    };
                }

                return {
                    string: 'custom message :attribute'
                };
            })
            name: string;
        }

        const ruleObject = await handlerRulers(SimpleArgs.prototype, {});
        expect(compileMessages(ruleObject)).toEqual({ 'string.name': 'custom message :attribute' });
        const rules = compileRules(ruleObject);
        expect(rules).toEqual({ name: 'string' });
        const messages = compileMessages(ruleObject, '', {}, {type: 'name'});
        expect(messages).toEqual({ 'string.name': 'custom message name :attribute' });
    });

    it('Handler multiple rule a attribute', async () => {
        class SimpleArgs {
            @Rules(['string', 'max:10'])
            name: string;
        }

        const ruleObject = await handlerRulers(SimpleArgs.prototype, {});
        expect(ruleObject).toEqual({ name: { data: ['string', 'max:10'] } });
        const rules = compileRules(ruleObject);
        expect(rules).toEqual({ name: ['string', 'max:10'] });
    });

    it('Hanler multiple rule in the callback', async () => {
        class SimpleArgs {
            @Rules(() => ['string', 'max:10'])
            name: string;
        }

        const ruleObject = await handlerRulers(SimpleArgs.prototype, {});
        expect(ruleObject).toEqual({ name: { data: ['string', 'max:10'] } });
        const rules = compileRules(ruleObject);
        expect(rules).toEqual({ name: ['string', 'max:10'] });

    });

    it('handler simple input type', async () => {
        class SimpleUsersInput {
            @Rules('required')
            name: string
        }

        class SimpleArgs {
            @Rules(SimpleUsersInput)
            name: string;
        }

        const ruleObject = await handlerRulers(SimpleArgs.prototype, {});

        expect(ruleObject).toEqual({ name: { name: { data: 'required' } } });

        const rules = compileRules(ruleObject);
        expect(rules).toEqual({ 'name.name': 'required' });
    });

    it('should removed reference', async () => {
        class SimpleUsersInput {
            @Rules('required')
            name: string
        }

        class SimpleArgs {
            @Rules(SimpleUsersInput)
            name: string;
        }

        const ruleObject = await handlerRulers(SimpleArgs.prototype, {});
        const ruleObject2 = await handlerRulers(SimpleArgs.prototype, {});
        const ruleObject3 = await handlerRulers(SimpleArgs.prototype, {});

        expect(ruleObject3).toEqual({ name: { name: { data: 'required' } } });

        const rules = compileRules(ruleObject3);
        expect(rules).toEqual({ 'name.name': 'required' });
    });

    it('handler array input type', async () => {
        class SimpleUsersInput {
            @Rules('required')
            name: string
        }

        class SimpleArgs {
            @Rules([SimpleUsersInput])
            name: string;
        }

        const ruleObject = await handlerRulers(SimpleArgs.prototype, {});
        expect(ruleObject).toEqual({ name: [{ name: { data: 'required' } }] });

        const rules = compileRules(ruleObject);
        expect(rules).toEqual({ 'name.*.name': 'required' });
    });

    it('Handler multiple rules a attribute on nested', async () => {
        class SimpleUsersInput {
            @Rules(['required', 'string'])
            name: string
        }

        class SimpleArgs {
            @Rules([SimpleUsersInput])
            name: string;
        }

        const ruleObject = await handlerRulers(SimpleArgs.prototype, {});
        expect(ruleObject).toEqual({ name: [{ name: { data: ['required', 'string'] } }] });

        const rules = compileRules(ruleObject);
        expect(rules).toEqual({ 'name.*.name': ['required', 'string'] });
    });

    it('Handler callback nested', async () => {
        class SimpleUsersInput {
            @Rules(['required', 'string'])
            name: string
        }

        class SimpleArgs {
            @Rules(() => [SimpleUsersInput])
            name: string;
        }

        const ruleObject = await handlerRulers(SimpleArgs.prototype, {});
        expect(ruleObject).toEqual({ name: [{ name: { data: ['required', 'string'] } }] });

        const rules = compileRules(ruleObject);
        expect(rules).toEqual({ 'name.*.name': ['required', 'string'] });
    });

    it('Handler callback rules a attribute on nested', async () => {
        class SimpleUsersInput {
            @Rules(() => ['required', 'string'])
            name: string
        }

        class SimpleArgs {
            @Rules([SimpleUsersInput])
            name: string;
        }

        const ruleObject = await handlerRulers(SimpleArgs.prototype, {});
        expect(ruleObject).toEqual({ name: [{ name: { data: ['required', 'string'] } }] });

        const rules = compileRules(ruleObject);
        expect(rules).toEqual({ 'name.*.name': ['required', 'string'] });
    });

    it('Handler nested attribute', async () => {
        class SimpleNext {
            @Rules(args => {
                return 'string'
            }, {
                string: 'custom message'
            })
            primary;
        }

        class SimpleEducationInput {
            @Rules(args => {
                return 'string'
            })
            primary;

            @Rules('string')
            secondary;

            @Rules(() => [SimpleNext])
            next: SimpleNext
        }

        class SimpleBioInput {
            @Rules('min:18')
            age

            @Rules([SimpleEducationInput])
            education
        }

        class SimpleUsersInput {
            @Rules('required')
            name: string

            @Rules(SimpleBioInput)
            bio: string
        }

        class SimpleArgs {
            @Rules([SimpleUsersInput])
            users: string;

            @Rules('string')
            name: string;
        }

        let data = {
            users: [{
                name: 'John',
                bio: {
                    age: 28,
                    education: {
                        primary: 'Elementary School',
                        secondary: 'Secondary School'
                    }
                }
            }]
        };

        const ruleObject = await handlerRulers(SimpleArgs.prototype, data);

        expect(ruleObject).toEqual({
            'users': [{
                'name': { data: 'required' },
                'bio': {
                    'age': { data: 'min:18' },
                    'education': [
                        {
                            'primary': { data: 'string' },
                            'secondary': { data: 'string' },
                            'next': [
                                {
                                    'primary': {
                                        data: 'string',
                                        'messages': {
                                            'string': 'custom message'
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            }], 'name': { data: 'string' }
        });

        const rules = compileRules(ruleObject);
        expect(rules).toEqual({
            'users.*.bio.education.*.next.*.primary': 'string',
            'users.*.bio.education.*.primary': 'string',
            'users.*.bio.education.*.secondary': 'string',
            'users.*.bio.age': 'min:18',
            'users.*.name': 'required',
            'name': 'string'
        });

        const messages = compileMessages(ruleObject);
    });

    it('Handler multiple atrtibute use inputs', async () => {
        class SimpleUsersInput {
            @Rules('required')
            name: string
        }

        class SimpleArgs {
            @Rules(SimpleUsersInput)
            name: string;

            @Rules(SimpleUsersInput)
            user: string
        }

        const ruleObject = await handlerRulers(SimpleArgs.prototype, {});
        expect(ruleObject).toEqual({ name: { name: { data: 'required' } }, user: { name: { data: 'required' } } });

        const rules = compileRules(ruleObject);
        expect(rules).toEqual({
            'name.name': 'required',
            'user.name': 'required'
        });
    });

    it('should throw error when object type property key is symbol', async () => {
        expect.assertions(1);

        const symbolKey = Symbol('symbolKey');
        try {
            class SampleObject {
                @Rules('string')
                [symbolKey]: string | null;
            }
        } catch (err) {
            expect(err.message).toContain('Symbol keys are not supported yet!');
        }
    });
});
