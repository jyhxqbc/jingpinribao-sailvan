# Bundled DuckDB Parquet extension

- Source: https://extensions.duckdb.org/v1.4.3/wasm_mvp/parquet.duckdb_extension.wasm
- DuckDB version: v1.4.3, wasm_mvp
- License: MIT, https://github.com/duckdb/duckdb/blob/v1.4.3/LICENSE
- Retrieved: 2026-10-16
- SHA-256: 0785c6c95d003eff4faa7b3b4b660f02c9c92f6d68d135ddf330d42e3a650600

This signed official binary is distributed locally so the extension never downloads executable modules at runtime. Keep it aligned with the DuckDB engine version and verify the hash before packaging. Arrow import replaces the JSON extension; no JSON module download is required.
