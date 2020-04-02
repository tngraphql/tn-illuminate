/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/16/2020
 * Time: 3:34 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { ApplicationContract } from '../Contracts/ApplicationContract';
import { Filesystem } from '@poppinss/dev-utils/build';
import { merge } from '../Support/helpers';

export class ProviderRepository {
    constructor(public app: ApplicationContract, public fs: Filesystem, public manifestPath: string) {
    }

    public async load(providers: Function[]) {
        let manifest = await this.loadManifest();

        if ( this.shouldRecompile(manifest, providers) ) {
            manifest = this.compileManifest(providers);
        }

        for( let provider of manifest.eager ) {
            this.app.register(provider);
        }
    }

    async loadManifest() {
        if ( await this.fs.exists(this.manifestPath) ) {
            const manifest = this.fs.get(this.manifestPath);
            if ( manifest ) {
                return merge(manifest, {when: []});
            }
        }
    }

    shouldRecompile(manifest, providers) {
        return ! manifest || manifest?.providers !== providers;
    }

    compileManifest(providers) {
        let manifest = this.freshManifest(providers);

        for( let provider of manifest.providers ) {
            const instance = this.createProvider(provider);

            manifest.eager.push(instance)
        }

        return this.writeManifest(manifest);
    }

    freshManifest(providers) {
        return {
            providers: providers,
            eager: [],
            deferred: []
        }
    }

    writeManifest(manifest) {
        // todo chưa code
        return manifest;
    }

    public createProvider(provider) {
        if ( typeof provider === 'string' ) {
            return this.app.resolveProvider(provider);
        }
        return new provider(this.app);
    }
}