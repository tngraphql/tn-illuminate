import { BaseCommand } from '@tngraphql/console';

export class UserCommand extends BaseCommand {

    /**
     * Command name. The command will be registered using this name only. Make
     * sure their aren't any spaces inside the command name.
     */
    static commandName: string = 'app:name';

    /**
     * Execute the console command.
     *
     * @param args
     */
    handle(...args: any[]): Promise<void> {
        //
        return;
    }

}
