export default function install(anura) {
    if (anura.settings.get("libtest installed")) return;
    anura.notifications.add({
        title: "libtest",
        description: `libtest is being installed`,
        timeout: 5000
    })
    anura.settings.set("libtest installed", true)
}