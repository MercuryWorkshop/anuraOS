# Security Blueprint

This Document will explain what and how security features are implemented in AnuraOS.

## Secure Math

In Anura, when coding in a cryptographic/security sensitive context, we replace `Math.random()` with our own function `cryptoRandom()`. `cryptoRandom()` is a direct replacement for `Math.random()` and the two are fully interchangeable. If you would like to implement `cryptoRandom()` you can use the following steps(for TypeScript):

1.  If not already installed, run `npm install @types/node`
2.  Add `import * as crypto from "crypto";` to the head of whatever file in which you would like to replace `Math.random()`
3.  Add the following function to your code:

```ts
function cryptoRandom() {
    const typedArray = new Uint8Array(1);
    const randomValue = crypto.getRandomValues(typedArray)[0];
    const randomFloat = randomValue / Math.pow(2, 8);
    return randomFloat;
}
```

4. You can now replace `Math.random()` anywhere in your code with `cryptoRandom()`.

## TODO
