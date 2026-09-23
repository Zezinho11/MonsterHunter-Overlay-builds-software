import json
import sqlite3
import sys
import zipfile
from pathlib import Path


archive_path, output_path = map(Path, sys.argv[1:3])
work_dir = Path(output_path).with_suffix(".work")
work_dir.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(archive_path) as archive:
    database_member = next(name for name in archive.namelist() if name.endswith("mhgu.db"))
    database_path = work_dir / "mhgu.db"
    database_path.write_bytes(archive.read(database_member))

connection = sqlite3.connect(database_path)
connection.row_factory = sqlite3.Row
items = {
    row["_id"]: row["name"]
    for row in connection.execute("SELECT _id, name FROM items")
}
materials_by_item = {}
for row in connection.execute(
    "SELECT created_item_id, component_item_id, quantity, type FROM components"
):
    materials_by_item.setdefault(row["created_item_id"], []).append({
        "name": items.get(row["component_item_id"], "Material indisponível"),
        "quantity": row["quantity"],
        "kind": row["type"],
    })

skills_by_armor = {}
for row in connection.execute(
    """SELECT rel.item_id, tree.name, rel.point_value
       FROM item_to_skill_tree AS rel
       JOIN skill_trees AS tree ON tree._id = rel.skill_tree_id
       ORDER BY rel.item_id, tree.name"""
):
    skills_by_armor.setdefault(row["item_id"], []).append({
        "name": row["name"],
        "level": row["point_value"],
        "unit": "points",
    })

armor = []
for row in connection.execute(
    """SELECT armor.*, families.name AS family_name, families.rarity AS family_rarity
       FROM armor
       LEFT JOIN armor_families AS families ON families._id = armor.family
       ORDER BY armor._id"""
):
    name = items.get(row["_id"])
    if not name:
        continue
    slot = {"Head": "head", "Body": "chest", "Arms": "arms", "Waist": "waist", "Legs": "legs"}.get(row["slot"])
    if not slot:
        continue
    armor.append({
        "sourceRecordId": row["_id"],
        "slot": slot,
        "name": name,
        "setName": row["family_name"],
        "rank": "g" if (row["family_rarity"] or 0) >= 8 else "high" if (row["family_rarity"] or 0) >= 5 else "low",
        "rarity": row["family_rarity"],
        "defense": row["defense"],
        "resistances": {"fire": row["fire_res"], "water": row["water_res"], "ice": row["ice_res"], "thunder": row["thunder_res"], "dragon": row["dragon_res"]},
        "slots": row["num_slots"],
        "skills": skills_by_armor.get(row["_id"], []),
        "craftingMaterials": materials_by_item.get(row["_id"], []),
    })

weapons = []
for row in connection.execute("SELECT * FROM weapons ORDER BY _id"):
    name = items.get(row["_id"])
    if not name:
        continue
    weapons.append({
        "sourceRecordId": row["_id"],
        "name": name,
        "class": row["wtype"],
        "rarity": None,
        "attack": row["attack"],
        "element": row["element"],
        "elementAttack": row["element_attack"],
        "slots": row["num_slots"],
        "craftingMaterials": materials_by_item.get(row["_id"], []),
    })

normalized_items = [
    {"sourceRecordId": item_id, "name": name}
    for item_id, name in items.items()
]
decorations = []
for row in connection.execute(
    """SELECT decorations._id, decorations.num_slots, items.name, items.rarity,
              items.icon_name, items.icon_color
       FROM decorations JOIN items ON items._id = decorations._id
       ORDER BY decorations._id"""
):
    decorations.append({
        "sourceRecordId": row["_id"], "name": row["name"], "slot": row["num_slots"],
        "rarity": row["rarity"], "iconName": row["icon_name"], "iconColor": row["icon_color"],
        "skills": skills_by_armor.get(row["_id"], []),
        "craftingMaterials": materials_by_item.get(row["_id"], []),
    })

skills = [
    {"sourceRecordId": row["_id"], "name": row["name"], "iconName": None}
    for row in connection.execute("SELECT _id, name FROM skill_trees ORDER BY name")
]
charms = []
for row in connection.execute(
    """SELECT charms.*, items.name, items.rarity, items.icon_name, items.icon_color
       FROM charms JOIN items ON items._id = charms._id ORDER BY charms._id"""
):
    charm_skills = []
    for index in (1, 2):
        tree_id = row[f"skill_tree_{index}_id"]
        amount = row[f"skill_tree_{index}_amount"]
        tree = connection.execute("SELECT name FROM skill_trees WHERE _id = ?", (tree_id,)).fetchone() if tree_id else None
        if tree and amount:
            charm_skills.append({"name": tree[0], "level": amount, "unit": "points"})
    charms.append({"sourceRecordId": row["_id"], "name": row["name"], "rarity": row["rarity"], "slots": row["num_slots"], "skills": charm_skills, "iconName": row["icon_name"], "iconColor": row["icon_color"]})

output_path.write_text(json.dumps({"weapons": weapons, "armor": armor, "items": normalized_items, "decorations": decorations, "charms": charms, "skills": skills}, ensure_ascii=False), encoding="utf-8")
connection.close()
