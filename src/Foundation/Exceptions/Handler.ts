/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 8/27/2020
 * Time: 9:18 AM
 */
import {Application} from "../Application";
import { Logger } from '@adonisjs/logger/build/src/Logger';
import {ValidationException} from "../Validate/ValidationException";
import {Service} from "../../Decorators";

@Service()
export class Handler {

    /**
     * A list of the internal exception types that should not be reported.
     *
     * @var array
     */
    protected internalDontReport = [
    ];

    protected dontReport = [];

    constructor(protected app: Application) {
    }

    public report(e) {
        if (this.shouldntReport(e)) {
            return;
        }

        if (typeof e.report === 'function') {
            return e.report();
        }
        let logger: Logger
        try {
            logger = this.app.log;
        } catch (e) {
            throw e;
        }

        logger.error(e.message);
    }

    protected shouldntReport(e) {
        const dontReport = [...this.dontReport, ...this.internalDontReport];

        return !!dontReport.find(x => {
            return e instanceof x;
        });
    }

    public render(error) {
        if ( error.originalError instanceof ValidationException ) {
            return this.convertValidationExceptionToResponse(error.originalError);
        }

        return Object.assign({code: error?.originalError?.code}, error);
    }

    protected convertValidationExceptionToResponse(error) {
        error.validation = error.originalError.errors();

        return Object.assign({code: error?.originalError?.code}, error);
    }
}