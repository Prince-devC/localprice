import os
import sqlite3
from typing import Dict, List, Tuple


def norm(s: str) -> str:
    if s is None:
        return ""
    # trim, collapse spaces, lowercase
    return " ".join(s.strip().split()).lower()


def connect(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def choose_canonical(ids: List[int]) -> int:
    # Keep the smallest id as canonical
    return min(ids)


def group_by_key(rows: List[sqlite3.Row], key_fields: Tuple[str, ...]) -> Dict[Tuple, List[int]]:
    groups: Dict[Tuple, List[int]] = {}
    for r in rows:
        key = tuple(norm(str(r[f])) if r[f] is not None else "" for f in key_fields)
        groups.setdefault(key, []).append(int(r["id"]))
    return groups


def dedup_simple_table(conn: sqlite3.Connection, table: str, key_fields: Tuple[str, ...]) -> Dict[int, int]:
    rows = conn.execute(f"SELECT id, {', '.join(key_fields)} FROM {table}").fetchall()
    groups = group_by_key(rows, key_fields)
    mapping: Dict[int, int] = {}
    duplicates_to_delete: List[int] = []
    for key, ids in groups.items():
        if len(ids) > 1:
            canonical = choose_canonical(ids)
            for i in ids:
                if i != canonical:
                    mapping[i] = canonical
                    duplicates_to_delete.append(i)
    if duplicates_to_delete:
        q = f"DELETE FROM {table} WHERE id IN ({', '.join('?' for _ in duplicates_to_delete)})"
        conn.execute(q, duplicates_to_delete)
    return mapping


def update_fk(conn: sqlite3.Connection, table: str, column: str, mapping: Dict[int, int]):
    for old_id, new_id in mapping.items():
        conn.execute(f"UPDATE {table} SET {column} = ? WHERE {column} = ?", (new_id, old_id))


def dedup_product_categories(conn: sqlite3.Connection) -> Dict[int, int]:
    return dedup_simple_table(conn, "product_categories", ("name",))


def dedup_regions(conn: sqlite3.Connection) -> Dict[int, int]:
    # Prefer code if present; otherwise name
    rows = conn.execute("SELECT id, code, name FROM regions").fetchall()
    groups: Dict[Tuple[str], List[int]] = {}
    for r in rows:
        key = norm(r["code"]) if r["code"] else norm(r["name"]) 
        groups.setdefault((key,), []).append(int(r["id"]))
    mapping: Dict[int, int] = {}
    duplicates_to_delete: List[int] = []
    for key, ids in groups.items():
        if len(ids) > 1:
            canonical = choose_canonical(ids)
            for i in ids:
                if i != canonical:
                    mapping[i] = canonical
                    duplicates_to_delete.append(i)
    if duplicates_to_delete:
        conn.execute(f"DELETE FROM regions WHERE id IN ({', '.join('?' for _ in duplicates_to_delete)})", duplicates_to_delete)
    return mapping


def dedup_units(conn: sqlite3.Connection) -> Dict[int, int]:
    return dedup_simple_table(conn, "units", ("name",))


def dedup_languages(conn: sqlite3.Connection) -> Dict[int, int]:
    return dedup_simple_table(conn, "languages", ("name",))


def dedup_stores(conn: sqlite3.Connection) -> Dict[int, int]:
    return dedup_simple_table(conn, "stores", ("name",))


def dedup_suppliers(conn: sqlite3.Connection) -> Dict[int, int]:
    return dedup_simple_table(conn, "suppliers", ("name",))


def dedup_products(conn: sqlite3.Connection) -> Dict[int, int]:
    rows = conn.execute("SELECT id, name, category_id FROM products").fetchall()
    groups: Dict[Tuple[str, int], List[int]] = {}
    for r in rows:
        key = (norm(r["name"]), int(r["category_id"]) if r["category_id"] is not None else -1)
        groups.setdefault(key, []).append(int(r["id"]))
    mapping: Dict[int, int] = {}
    duplicates_to_delete: List[int] = []
    for key, ids in groups.items():
        if len(ids) > 1:
            canonical = choose_canonical(ids)
            for i in ids:
                if i != canonical:
                    mapping[i] = canonical
                    duplicates_to_delete.append(i)
    if duplicates_to_delete:
        conn.execute(f"DELETE FROM products WHERE id IN ({', '.join('?' for _ in duplicates_to_delete)})", duplicates_to_delete)
    return mapping


def dedup_localities(conn: sqlite3.Connection) -> Dict[int, int]:
    rows = conn.execute("SELECT id, name, region_id FROM localities").fetchall()
    groups: Dict[Tuple[str, int], List[int]] = {}
    for r in rows:
        key = (norm(r["name"]), int(r["region_id"]) if r["region_id"] is not None else -1)
        groups.setdefault(key, []).append(int(r["id"]))
    mapping: Dict[int, int] = {}
    duplicates_to_delete: List[int] = []
    for key, ids in groups.items():
        if len(ids) > 1:
            canonical = choose_canonical(ids)
            for i in ids:
                if i != canonical:
                    mapping[i] = canonical
                    duplicates_to_delete.append(i)
    if duplicates_to_delete:
        conn.execute(f"DELETE FROM localities WHERE id IN ({', '.join('?' for _ in duplicates_to_delete)})", duplicates_to_delete)
    return mapping


def dedup_product_prices(conn: sqlite3.Connection):
    rows = conn.execute("SELECT id, product_id, store_id FROM product_prices").fetchall()
    groups: Dict[Tuple[int, int], List[int]] = {}
    for r in rows:
        key = (int(r["product_id"]), int(r["store_id"]))
        groups.setdefault(key, []).append(int(r["id"]))
    duplicates_to_delete: List[int] = []
    for key, ids in groups.items():
        if len(ids) > 1:
            canonical = choose_canonical(ids)
            for i in ids:
                if i != canonical:
                    duplicates_to_delete.append(i)
    if duplicates_to_delete:
        conn.execute(f"DELETE FROM product_prices WHERE id IN ({', '.join('?' for _ in duplicates_to_delete)})", duplicates_to_delete)


def dedup_supplier_prices(conn: sqlite3.Connection):
    rows = conn.execute("SELECT id, supplier_id, price_id FROM supplier_prices").fetchall()
    groups: Dict[Tuple[int, int], List[int]] = {}
    for r in rows:
        key = (int(r["supplier_id"]), int(r["price_id"]))
        groups.setdefault(key, []).append(int(r["id"]))
    duplicates_to_delete: List[int] = []
    for key, ids in groups.items():
        if len(ids) > 1:
            canonical = choose_canonical(ids)
            for i in ids:
                if i != canonical:
                    duplicates_to_delete.append(i)
    if duplicates_to_delete:
        conn.execute(f"DELETE FROM supplier_prices WHERE id IN ({', '.join('?' for _ in duplicates_to_delete)})", duplicates_to_delete)


def dedup_supplier_product_availability(conn: sqlite3.Connection):
    rows = conn.execute("SELECT id, supplier_id, product_id FROM supplier_product_availability").fetchall()
    groups: Dict[Tuple[int, int], List[int]] = {}
    for r in rows:
        key = (int(r["supplier_id"]), int(r["product_id"]))
        groups.setdefault(key, []).append(int(r["id"]))
    duplicates_to_delete: List[int] = []
    for key, ids in groups.items():
        if len(ids) > 1:
            canonical = choose_canonical(ids)
            for i in ids:
                if i != canonical:
                    duplicates_to_delete.append(i)
    if duplicates_to_delete:
        conn.execute(f"DELETE FROM supplier_product_availability WHERE id IN ({', '.join('?' for _ in duplicates_to_delete)})", duplicates_to_delete)


def run_dedup(db_path: str):
    conn = connect(db_path)
    try:
        conn.execute("BEGIN")

        # 1) Bases: categories, regions, units, languages, stores, suppliers
        cat_map = dedup_product_categories(conn)
        reg_map = dedup_regions(conn)
        unit_map = dedup_units(conn)
        lang_map = dedup_languages(conn)
        store_map = dedup_stores(conn)
        supplier_map = dedup_suppliers(conn)

        # Update dependent FKs for bases
        if cat_map:
            update_fk(conn, "products", "category_id", cat_map)
        if reg_map:
            update_fk(conn, "localities", "region_id", reg_map)

        # 2) Dependents: products, localities
        prod_map = dedup_products(conn)
        loc_map = dedup_localities(conn)

        # 3) Update FKs in tables referencing products/localities/units/suppliers/stores
        if prod_map:
            update_fk(conn, "product_prices", "product_id", prod_map)
            update_fk(conn, "supplier_prices", "product_id", prod_map)
            update_fk(conn, "supplier_product_availability", "product_id", prod_map)
            update_fk(conn, "supplier_product_availability_history", "product_id", prod_map)
            # Ne pas dédupliquer la table 'prices', mais MAJ des FKs
            update_fk(conn, "prices", "product_id", prod_map)

        if loc_map:
            update_fk(conn, "supplier_prices", "locality_id", loc_map)
            update_fk(conn, "suppliers", "locality_id", loc_map)
            update_fk(conn, "prices", "locality_id", loc_map)

        if unit_map:
            update_fk(conn, "prices", "unit_id", unit_map)

        if supplier_map:
            update_fk(conn, "supplier_prices", "supplier_id", supplier_map)
            update_fk(conn, "supplier_product_availability", "supplier_id", supplier_map)
            update_fk(conn, "supplier_product_availability_history", "supplier_id", supplier_map)

        if store_map:
            update_fk(conn, "product_prices", "store_id", store_map)

        # 4) Dedup join tables (keep canonical row per key)
        dedup_product_prices(conn)
        dedup_supplier_prices(conn)
        dedup_supplier_product_availability(conn)

        conn.commit()
        print("Déduplication terminée avec succès.")
    except Exception as e:
        conn.rollback()
        raise
    finally:
        conn.close()


def main():
    db_path = os.path.join("database", "lokali.db")
    print(f"Déduplication de la DB: {db_path}")
    run_dedup(db_path)


if __name__ == "__main__":
    main()