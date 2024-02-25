export default function install(anura) {
    if (anura.settings.get("libtest installed")) return;
    anura.ui.registerExternalComponent("anura.examplelib", "awesome_component")

    anura.notifications.add({
        title: "libtest",
        description: "Libtest is being installed.",
        timeout: 2000
    })
    anura.settings.set("libtest installed", true)
}