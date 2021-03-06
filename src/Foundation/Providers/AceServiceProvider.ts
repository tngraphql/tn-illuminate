/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/14/2020
 * Time: 4:15 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Service, ServiceProvider } from '../..';
import { ModelMakeCommand } from '../Console/ModelMakeCommand';
import { MiddlewareMakeCommand } from '../Console/MiddlewareMakeCommand';
import { MigrateMakeCommand } from '../Console/MigrateMakeCommand';
import { ProviderMakeCommand } from '../Console/ProviderMakeCommand';
import { ResolveMakeCommand } from '../Console/ResolveMakeCommand';
import { TypeMakeCommand } from '../Console/TypeMakeCommand';
import { CommandMakeCommand } from '../Console/CommandMakeCommand';
import { KeyGenerateCommand } from '../Console/KeyGenerateCommand';
import { RouteListCommand } from '../Console/RouteListCommand';

import { SeedMakeCommand } from '../../Database/seed/SeedMakeCommand';
import { SeedCommand } from '../../Database/seed/SeedCommand';
import { ResetCommand } from '../../Database/migration/ResetCommand';
import { RefreshCommand } from '../../Database/migration/RefreshCommand';
import { FreshCommand } from '../../Database/migration/FreshCommand';
import { StatusCommand } from '../../Database/migration/StatusCommand';
import { RollbackCommand } from '../../Database/migration/RollbackCommand';
import { RunCommand } from '../../Database/migration/RunCommand';

@Service()
export class AceServiceProvider extends ServiceProvider {

    protected _commands = {
        'RouteList': 'command.route.list',
        'MigrateRun': 'command.migrate.run',
        'MigrateRollback': 'command.migrate.rollback',
        'MigrateStatus': 'command.migrate.status',
        'MigrateFresh': 'command.migrate.fresh',
        'MigrateRefresh': 'command.migrate.refresh',
        'MigrateReset': 'command.migrate.reset',

        'Seed': 'command.seed',
        'SeedMake': 'command.seed.make',
    };

    protected _devCommands = {
        'MiddlewareMake': 'command.middleware.make',
        'MigrateMake': 'command.migrate.make',
        'ModelMake': 'command.model.make',
        'ProviderMake': 'command.provider.make',
        'ResolveMake': 'command.resolve.make',
        'TypeMake': 'command.type.make',
        'CommandMake': 'command.command.make',
        'KeyGenerate': 'command.key.generate',
    };

    /**
     * Register the service provider.
     */
    register(): void {
        this.registerAce({ ...this._commands, ...this._devCommands });
    }

    registerAce(data: any) {
        Object.keys(data).map(command => this[`register${ command }Command`]());

        this.commands(Object.values(data).map(command => this.app.use(command as string)));
    }

    registerProviderMakeCommand() {
        this.app.singleton('command.provider.make', () => {
            return ProviderMakeCommand;
        });
    }

    registerModelMakeCommand() {
        this.app.singleton('command.model.make', () => {
            return ModelMakeCommand;
        });
    }

    registerMiddlewareMakeCommand() {
        this.app.singleton('command.middleware.make', () => {
            return MiddlewareMakeCommand;
        });
    }

    registerMigrateMakeCommand() {
        this.app.singleton('command.migrate.make', () => {
            return MigrateMakeCommand
        })
    }

    registerResolveMakeCommand() {
        this.app.singleton('command.resolve.make', () => {
            return ResolveMakeCommand
        })
    }

    registerTypeMakeCommand() {
        this.app.singleton('command.type.make', () => {
            return TypeMakeCommand
        })
    }

    registerCommandMakeCommand() {
        this.app.singleton('command.command.make', () => {
            return CommandMakeCommand
        })
    }

    registerKeyGenerateCommand() {
        this.app.singleton('command.key.generate', () => {
            return KeyGenerateCommand
        })
    }

    registerRouteListCommand() {
        this.app.singleton('command.route.list', () => {
            return RouteListCommand;
        });
    }

    registerMigrateRunCommand() {
        this.app.singleton('command.migrate.run', () => {
            return RunCommand;
        });
    }

    registerMigrateRollbackCommand() {
        this.app.singleton('command.migrate.rollback', () => {
            return RollbackCommand;
        });
    }

    registerMigrateStatusCommand() {
        this.app.singleton('command.migrate.status', () => {
            return StatusCommand;
        });
    }

    registerMigrateFreshCommand() {
        this.app.singleton('command.migrate.fresh', () => {
            return FreshCommand;
        });
    }

    registerMigrateRefreshCommand() {
        this.app.singleton('command.migrate.refresh', () => {
            return RefreshCommand;
        });
    }

    registerMigrateResetCommand() {
        this.app.singleton('command.migrate.reset', () => {
            return ResetCommand;
        });
    }

    registerSeedCommand() {
        this.app.singleton('command.seed', () => {
            return SeedCommand;
        });
    }
    registerSeedMakeCommand() {
        this.app.singleton('command.seed.make', () => {
            return SeedMakeCommand;
        });
    }
}
