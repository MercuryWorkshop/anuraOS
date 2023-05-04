// chish (pronounced chai-s-h)
use shellfish::Command;
use shellfish::Shell;
use std::error::Error;
use std::fmt;
use std::ops::AddAssign;

fn main() {
    println!("Welcome to chish, the Anura developer shell.
    If you got here by mistake, don't panic!  Just close this window and carry on.
    Type 'help' for a list of commands.
    If you want to customize the look/behavior, you can use the options page.
    Load it by using the Ctrl+Shift+P keyboard shortcut.");

    // Define the shell object
    let mut shell = Shell::new(0_u64, "chish> ");

    shell.commands.insert(
        "eval".to_string(),
        Command::new("increments a counter.".to_string(), count),
    );


    // Run the shell
    shell.run()?;

    Ok(())
}

}

fn eval() {

}