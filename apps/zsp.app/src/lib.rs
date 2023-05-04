use std::collections::HashMap;

// use zsp_core::
use wasm_bindgen::prelude::*;
use zsp_core::{
    exceptions::Exception, func, runtime::FunctionType, runtime::RFunction, runtime::Value,
};
#[wasm_bindgen(module = "/outbinds.js")]
extern "C" {
    fn stdout(s: &str);
}
#[wasm_bindgen]
extern "C" {

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
    fn prompt(s: &str) -> JsValue;
}

#[wasm_bindgen]
pub fn start() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
}
#[wasm_bindgen]
pub fn run(code: String) {
    match zsp_core::runtime::execute(
        &code,
        Some(HashMap::from([
            func!("put", web_put, 1),
            func!("get", web_get, 0),
        ])),
    ) {
        Ok(_) => stdout("<p class = \"np cgreen\">Ran Code Sucessfully</p>"),
        Err(e) => stdout(&format!("<p class=\"np cred\">{}</p>", e.fmt(&code))),
    }
}
#[wasm_bindgen]
pub fn reset() {
    panic!("resetting ig");
}
fn web_get(_inp: Vec<Value>) -> Result<Value, Exception> {
    Ok(Value::String(prompt("").as_string().unwrap()))
}
fn web_put(inp: Vec<Value>) -> Result<Value, Exception> {
    stdout(&inp[0].to_string());
    Ok(Value::Null)
}
