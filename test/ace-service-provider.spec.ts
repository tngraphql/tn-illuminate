/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/5/2020
 * Time: 10:59 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
    Application, CommandMakeCommand, KeyGenerateCommand,
    MiddlewareMakeCommand,
    MigrateMakeCommand,
    ModelMakeCommand,
    ProviderMakeCommand, ResolveMakeCommand, TypeMakeCommand
} from '../src/Foundation';
import { AceServiceProvider } from '../src/Foundation/Providers/AceServiceProvider';
import { RouteListCommand } from '../src/Foundation/Console/RouteListCommand';
import { RunCommand } from '../src/Database/migration/RunCommand';
import { RollbackCommand } from '../src/Database/migration/RollbackCommand';
import { StatusCommand } from '../src/Database/migration/StatusCommand';
import { FreshCommand } from '../src/Database/migration/FreshCommand';
import { RefreshCommand } from '../src/Database/migration/RefreshCommand';
import { ResetCommand } from '../src/Database/migration/ResetCommand';
import { SeedCommand } from '../src/Database/seed/SeedCommand';
import { SeedMakeCommand } from '../src/Database/seed/SeedMakeCommand';

describe('ace-service-provider', () => {
    it('Ensure proper operation', async () => {
        const app = new Application();

        await app.register(new AceServiceProvider(app));

        expect(app.use('command.route.list')).toBe(RouteListCommand);
        expect(app.use('command.migrate.run')).toBe(RunCommand);
        expect(app.use('command.migrate.rollback')).toBe(RollbackCommand);
        expect(app.use('command.migrate.status')).toBe(StatusCommand);
        expect(app.use('command.migrate.fresh')).toBe(FreshCommand);
        expect(app.use('command.migrate.refresh')).toBe(RefreshCommand);
        expect(app.use('command.migrate.reset')).toBe(ResetCommand);


        expect(app.use('command.seed')).toBe(SeedCommand);
        expect(app.use('command.seed.make')).toBe(SeedMakeCommand);

        expect(app.use('command.middleware.make')).toBe(MiddlewareMakeCommand);
        expect(app.use('command.migrate.make')).toBe(MigrateMakeCommand);
        expect(app.use('command.model.make')).toBe(ModelMakeCommand);
        expect(app.use('command.provider.make')).toBe(ProviderMakeCommand);
        expect(app.use('command.resolve.make')).toBe(ResolveMakeCommand);
        expect(app.use('command.type.make')).toBe(TypeMakeCommand);
        expect(app.use('command.command.make')).toBe(CommandMakeCommand);
        expect(app.use('command.key.generate')).toBe(KeyGenerateCommand);
    });
})
