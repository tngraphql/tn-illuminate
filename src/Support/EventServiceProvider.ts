/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/30/2020
 * Time: 9:32 PM
 */
import {ServiceProvider} from "./ServiceProvider";
import {Event} from "./Facades";
import {NameSapceType} from "../Container/Container";
import {Service} from "../Decorators";

export interface Listener {
    event: NameSapceType;
    handlers: NameSapceType[];
}

@Service()
export class EventServiceProvider extends ServiceProvider {
    protected listen: Listener[] = [];

    /**
     * Register the application's event listeners.
     */
    public boot() {
        for (let {event, handlers} of this.listens()) {
            for (let listten of handlers as []) {
                const instance = this.app.make<any>(listten as any);

                const handle = instance.handle;
                if (typeof event === "string") {
                    event = this.app.use(event);
                    if (event && typeof event === "object") {
                        event = (event as any).constructor;
                    }
                }

                if (typeof handle === "function") {
                    Event.on(event, handle.bind(instance));
                }
            }
        }
    }

    /**
     * Get the events and handlers.
     * @return {[Listener]}
     */
    listens(): Listener[] {
        return this.listen;
    }
}
