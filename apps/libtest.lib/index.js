export function hello_world() {
    return 'Hello World!';
}

export function some_fancy_new_feature() {
    return 'This is a fancy new feature! This is part of the new version of the library.';
}

export function awesome_component() {
    let elem = document.createElement('div');
    elem.innerHTML = 'This is an awesome component!';
    if (this.name) {
        elem.innerHTML += `<br>Hello, ${this.name}!`;
    }
    return elem;
}