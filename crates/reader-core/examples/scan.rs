use reader_core::LibraryRegistry;
use std::{env, process::ExitCode};

fn main() -> ExitCode {
    let mut args = env::args_os().skip(1);
    let Some(root) = args.next() else {
        eprintln!("usage: cargo run -p reader-core --example scan -- <library-root> <state-dir>");
        return ExitCode::FAILURE;
    };
    let Some(state_dir) = args.next() else {
        eprintln!("usage: cargo run -p reader-core --example scan -- <library-root> <state-dir>");
        return ExitCode::FAILURE;
    };
    let result = LibraryRegistry::open(root, state_dir).and_then(|mut registry| {
        registry.scan(|progress| {
            eprintln!(
                "visited={} matched={} current={}",
                progress.visited, progress.matched, progress.current_relative_path
            );
        })
    });
    match result {
        Ok(books) => {
            println!("{}", serde_json::to_string_pretty(&books).unwrap());
            ExitCode::SUCCESS
        }
        Err(error) => {
            eprintln!("scan failed: {error}");
            ExitCode::FAILURE
        }
    }
}
