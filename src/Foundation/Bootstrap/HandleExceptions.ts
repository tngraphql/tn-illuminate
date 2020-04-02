import { Application } from '../Application';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/10/2020
 * Time: 2:20 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

class ExceptionHandler {
    report(e) {
        console.log(e);
    }

    render(e) {
        console.log(e);
    }

    renderForConsole(e) {
        console.log(e);
    }
}

export class HandleExceptions {
    app: any;

    public async bootstrap(app: Application) {
        this.app = app;

        app.instance('ExceptionHandler', new ExceptionHandler());
    }
}