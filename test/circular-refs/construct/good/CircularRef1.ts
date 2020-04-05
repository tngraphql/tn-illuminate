import { Resolver } from '@tngraphql/graphql';
import { CircularRef2 } from './CircularRef2';
import { Inject } from '../../../../src/Decorators';
import { forwardRef } from '../../../../src/Decorators/forwardRef';

@Resolver()
export class CircularRef1 {
   constructor(@Inject(forwardRef(() => CircularRef2)) public ref2: CircularRef2) {
   }
}
