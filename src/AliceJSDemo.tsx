// function x() {
//   const b = stateful({
//     counter: stateful({
//       b: 1
//     }),
//   });
//
//   document.body.appendChild(<div>
//     <p>reactivity demo</p>
//     <p>the value of a is {React.use(b.counter.b)}</p>
//     <button on:click={() => {
//       b.counter.b += 1;
//     }}>click me!</button>
//
//   </div>);
// }
// window.addEventListener("load", x);
