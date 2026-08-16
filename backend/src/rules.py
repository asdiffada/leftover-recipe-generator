import re

BASIC_STAPLES = {
    "garam", "gula", "gula_pasir", "gula_merah", "minyak", "minyak_goreng",
    "bawang_merah", "bawang_putih", "cabai", "cabai_rawit", "cabai_merah",
    "cabai_hijau", "kecap_manis", "kecap_asin", "penyedap_rasa", "royco",
    "masako", "merica", "lada", "air", "daun_salam", "daun_jeruk", "serai",
    "lengkuas", "kunyit", "ketumbar", "jahe", "kemiri", "tepung_terigu",
    "tepung_maizena", "margarin", "mentega",
}

MUST_HAVE_PROTEINS = {
    "ayam", "daging", "daging_sapi", "daging_ayam", "daging_kambing",
    "udang", "ikan", "cumi", "cumi_cumi", "kepiting", "kerang", "telur",
    "tahu", "tempe", "sosis", "bakso",
}

UNIT_WORDS = {
    "sdm", "sdt", "sendok", "makan", "teh", "gram", "gr", "kg", "ml",
    "liter", "ltr", "buah", "butir", "siung", "batang", "lembar", "ruas",
    "ikat", "ons", "secukupnya", "genggam", "biji", "ekor", "papan",
    "gelas", "cangkir", "bungkus", "sachet", "sdh",
}

DESCRIPTOR_WORDS = {
    "cincang", "kupas", "iris", "haluskan", "halus", "geprek", "memarkan",
    "cuci", "bersih", "matang", "goreng", "rebus", "besar", "kecil",
    "sedang", "kasar", "segar", "dadu", "tipis", "potong", "fillet",
    "giling", "parut", "serut", "belah", "buang", "tulang", "kulit",
    "tanpa",
}


def normalize_ingredient(raw: str) -> str:
    s = raw.strip().lower()
    s = re.sub(r"\d+([.,]\d+)?", " ", s)
    tokens = [t for t in re.split(r"[\s/,\-]+", s) if t]
    tokens = [t for t in tokens if t not in UNIT_WORDS and t not in DESCRIPTOR_WORDS]
    return "_".join(tokens) if tokens else s


def _tokenset(ingredient: str) -> set:
    return set(ingredient.split("_"))


def passes_chef_rules(recipe_ingredients, user_ingredients):
    user_tokens = set()
    for u in user_ingredients:
        user_tokens |= _tokenset(u)

    for ing in recipe_ingredients:
        ing_tokens = _tokenset(ing)
        for protein in MUST_HAVE_PROTEINS:
            protein_tokens = _tokenset(protein)
            if protein_tokens <= ing_tokens and not protein_tokens <= user_tokens:
                return False
    return True
