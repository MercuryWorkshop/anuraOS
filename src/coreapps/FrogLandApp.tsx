class FrogLandApp extends App {
	name = "FrogLand";
	package = "anura.frogland";
	icon = "/assets/icons/xfrog.png";

	async startup() {
		anura.gex.windows.addEventListener("window", (event) => {
			const wl = event.window;
			const win = anura.wm.create(this, {
				width: wl.width,
				height: wl.height,
				title: wl.title,
			});
			win.onresize = (w, h) => {
				wl.resize(w, h);
			};
			win.onfocus = () => {
				wl.focus();
			};
			win.onclose = () => {
				wl.close();
			};
			win.onmaximize = () => {
				wl.setStates({ maximized: true });
			};
			win.onunmaximize = () => {
				wl.setStates({ maximized: false });
			};
			wl.canvas.style = "width: 100%; height: 100%";
			wl.addEventListener("");
			win.content.appendChild(wl.canvas);
			console.log(wl, win);
		});
	}
}
