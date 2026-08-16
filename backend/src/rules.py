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

# Kata satuan/takaran yang dibuang saat normalisasi, supaya
# "4 siung bawang merah" jadi "bawang_merah", bukan "4_siung_bawang_merah".
UNIT_WORDS = {
    "sdm", "sdt", "sendok", "makan", "teh", "gram", "gr", "kg", "ml",
    "liter", "ltr", "buah", "butir", "siung", "batang", "lembar", "ruas",
    "ikat", "ons", "secukupnya", "genggam", "biji", "ekor", "papan",
    "gelas", "cangkir", "bungkus", "sachet", "sdh",
}

# Kata deskriptif/instruksi persiapan yang juga dibuang, supaya
# "Udang kupas" jadi "udang" (bukan "udang_kupas") dan bisa match persis
# dengan entri di MUST_HAVE_PROTEINS.
DESCRIPTOR_WORDS = {
    "cincang", "kupas", "iris", "haluskan", "halus", "geprek", "memarkan",
    "cuci", "bersih", "matang", "goreng", "rebus", "besar", "kecil",
    "sedang", "kasar", "segar", "dadu", "tipis", "potong", "fillet",
    "giling", "parut", "serut", "belah", "buang", "tulang", "kulit",
    "tanpa",
}


def normalize_ingredient(raw: str) -> str:
    """Normalisasi satu item bahan mentah jadi token kanonik.

    PENTING: fungsi ini harus identik persis dengan versi di notebook
    02_train_tfidf.ipynb. Kalau salah satu diubah, samakan juga yang lain,
    supaya representasi bahan saat training TF-IDF dan saat inference di
    backend tetap konsisten.
    """
    s = raw.strip().lower()
    s = re.sub(r"\d+([.,]\d+)?", " ", s)  # buang angka/takaran
    tokens = [t for t in re.split(r"[\s/,\-]+", s) if t]
    tokens = [t for t in tokens if t not in UNIT_WORDS and t not in DESCRIPTOR_WORDS]
    return "_".join(tokens) if tokens else s


def _tokenset(ingredient: str) -> set:
    """Pecah token gabungan (mis. 'daging_sapi') jadi set kata individu."""
    return set(ingredient.split("_"))


def passes_chef_rules(recipe_ingredients, user_ingredients):
    """Tolak resep kalau ada protein wajib yang tidak dimiliki user.

    Dibandingkan pakai token-set (bukan exact-match string) supaya entri
    gabungan seperti 'bakso_sapi' atau 'dada_ayam_fillet' tetap terdeteksi
    mengandung protein 'bakso' / 'ayam', meskipun bukan token tunggal yang
    persis sama dengan isi MUST_HAVE_PROTEINS.
    """
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
