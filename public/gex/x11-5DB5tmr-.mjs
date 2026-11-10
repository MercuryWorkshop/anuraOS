function e(e, t = {}) {
	e.afterBoot(async (n) => {
		if (!n.wlChannel) return;
		let r = await e.programs().holdX(),
			i = null;
		(e.on(`x-wanted`, () => {
			((i ??= n.rt.startXServer({
				kernel: n.kernel,
				wlChannel: n.wlChannel,
				compositor: () => n.compositor,
				term: n.term,
				listen: r,
				rootful: !!t.rootful,
			})),
				i.catch((t) =>
					e.say(`gex: the X server would not start: ${t?.message ?? t}\n`),
				));
		}),
			n.onStop(() =>
				i?.then(
					(e) => e.terminate(),
					() => {},
				),
			));
	});
}
export { e as t };
