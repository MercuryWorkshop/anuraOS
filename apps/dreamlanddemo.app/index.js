const { buildLoader } = await anura.import("anura.persistence")
const loader = buildLoader(anura)
await loader.locate()

const persistence = await loader.build(instance)
const $store = persistence.createStoreFn(stateful, instanceWindow)

let persistentState = await $store({
    count: 0
}, "state")

let externalState = stateful({
    count: 0
})

function App(){
    return (
        html`
        <div>
            <button on:click=${
                () => {
                    persistentState.count++
                    externalState.count++
                }   
            }>Increment</button>
            <div>Persistent: ${use(persistentState.count)}</div>
            <div>Session: ${use(externalState.count)}</div>
        </div>
        `
    )
}

document.body.appendChild(html`<${App}/>`)