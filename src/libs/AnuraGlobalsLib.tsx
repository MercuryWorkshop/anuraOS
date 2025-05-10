/**
 * Export helpful global objects from the anura top level window
 */
class AnuraGlobalsLib extends Lib {
	icon = "/assets/icons/generic.svg";
	package = "anura.globalscope";
	name = "Anura Global Objects";
	latestVersion = anura.version.pretty;

	versions = {
		[anura.version.pretty]: {
			/**
			 * Run a top level eval to get a global object,
			 * this is how you would get an object from the top level
			 * before this library was created but this helper method
			 * is more verbose and easier to explain.
			 */
			getWithPath: eval.bind(top),
		},
	};

	constructor() {
		super();

		this.versions[anura.version.pretty] = new Proxy<any>(
			this.versions[anura.version.pretty],
			{
				get: (target, prop) => {
					if (prop in target) {
						return target[prop];
					} else {
						try {
							return this.versions[anura.version.pretty]?.getWithPath(prop);
						} catch (_) {
							return undefined;
						}
					}
				},
			},
		);
	}

	async getImport(version: string): Promise<any> {
		if (!version) version = this.latestVersion;
		if (!this.versions[version]) {
			throw new Error("Version not found");
		}
		return this.versions[version];
	}
}
