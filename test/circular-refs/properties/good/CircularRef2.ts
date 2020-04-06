import { CircularRef1 } from './CircularRef1';
import { Resolver } from '@tngraphql/graphql';
import { Inject } from '../../../../src/Decorators';

@Resolver()
export class CircularRef2 {
    @Inject(() => CircularRef1)
    public ref1: CircularRef1

    constructor() {
    }
}

