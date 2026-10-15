import {
    useEffect,
    useState
} from "react";

import {
    Plus,
    Pencil,
    Trash2,
    X,
    Search
} from "lucide-react";

import {
    createProduct,
    deleteProduct,
    getProducts,
    updateProduct
} from "../lib/api";

import type {
    Product
} from "../types";


// =========================================================
// FORMULAIRE VIDE
// =========================================================

const empty: Omit<Product, "id"> = {

    name: "",

    category: "Bougies",

    scent: "",

    price: 0,

    image: "",

    stock: 0,

    active: true,

    description: ""
};


// =========================================================
// PRODUCTS
// =========================================================

export default function Products() {


    // -------------------------------------------------------
    // PRODUITS
    // -------------------------------------------------------

    const [
        products,
        setProducts
    ] = useState<Product[]>([]);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("Toutes");


    // -------------------------------------------------------
    // AJOUT / MODIFICATION
    // -------------------------------------------------------

    const [
        editing,
        setEditing
    ] = useState<Product | null>(null);


    const [
        adding,
        setAdding
    ] = useState(false);


    // -------------------------------------------------------
    // FORMULAIRE
    // -------------------------------------------------------

    const [
        form,
        setForm
    ] = useState<
        Omit<Product, "id">
    >(empty);


    // -------------------------------------------------------
    // IMAGE
    // -------------------------------------------------------

    const [
        imageFile,
        setImageFile
    ] = useState<File | undefined>(
        undefined
    );


    const [
        imagePreview,
        setImagePreview
    ] = useState<string>("");


    // -------------------------------------------------------
    // LOADING
    // -------------------------------------------------------

    const [
        saving,
        setSaving
    ] = useState(false);


    // =======================================================
    // CHARGER LES PRODUITS
    // =======================================================

    const load = async () => {

        try {

            const data =
                await getProducts();

            setProducts(data);

        } catch (error) {

            console.error(
                "Erreur lors du chargement des produits :",
                error
            );

            alert(
                "Impossible de charger les produits."
            );
        }
    };


    // =======================================================
    // CHARGEMENT INITIAL
    // =======================================================

    useEffect(() => {

        load();

    }, []);


    // =======================================================
    // CHOISIR UNE IMAGE
    // =======================================================

    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file =
            e.target.files?.[0];


        if (!file) {
            return;
        }


        // -----------------------------
        // Vérification type
        // -----------------------------

        if (!file.type.startsWith("image/")) {

            alert(
                "Veuillez sélectionner une image."
            );

            return;
        }


        // -----------------------------
        // Taille maximale : 5 Mo
        // -----------------------------

        if (
            file.size >
            5 * 1024 * 1024
        ) {

            alert(
                "L'image ne doit pas dépasser 5 Mo."
            );

            return;
        }


        // -----------------------------
        // Fichier
        // -----------------------------

        setImageFile(file);


        // -----------------------------
        // Aperçu
        // -----------------------------

        const url =
            URL.createObjectURL(file);

        setImagePreview(url);
    };


    // =======================================================
    // AJOUTER / MODIFIER
    // =======================================================

    const submit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();


        // -----------------------------
        // Image obligatoire à l'ajout
        // -----------------------------

        if (
            !editing &&
            !imageFile
        ) {

            alert(
                "Veuillez sélectionner une image."
            );

            return;
        }


        setSaving(true);


        try {


            // ===================================================
            // MODIFICATION
            // ===================================================

            if (editing) {

                await updateProduct(
                    editing.id,
                    form,
                    imageFile
                );

            }


            // ===================================================
            // AJOUT
            // ===================================================

            else {

                await createProduct(
                    form,
                    imageFile
                );
            }


            // ===================================================
            // RESET
            // ===================================================

            setEditing(null);

            setAdding(false);

            setForm(empty);

            setImageFile(undefined);

            setImagePreview("");


            // ===================================================
            // RECHARGER
            // ===================================================

            await load();


        } catch (error) {

            console.error(
                "Erreur lors de l'enregistrement :",
                error
            );


            alert(
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue."
            );


        } finally {

            setSaving(false);
        }
    };


    // =======================================================
    // MODIFIER
    // =======================================================

    const edit = (
        p: Product
    ) => {

        setEditing(p);

        setAdding(false);


        setForm({

            name:
                p.name,

            category:
                p.category || "",

            scent:
                p.scent || "",

            price:
                Number(p.price),

            image:
                p.image || "",

            stock:
                Number(p.stock ?? 0),

            active:
                p.active ?? true,

            description:
                p.description || ""
        });


        // Pas de nouvelle image
        setImageFile(undefined);


        // Afficher l'image actuelle
        setImagePreview(
            p.image || ""
        );
    };


    // =======================================================
    // SUPPRIMER
    // =======================================================

    const remove = async (
        id: number
    ) => {

        const confirmed =
            window.confirm(
                "Supprimer ce produit ?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await deleteProduct(id);

            await load();

        } catch (error) {

            console.error(
                "Erreur lors de la suppression :",
                error
            );


            alert(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la suppression."
            );
        }
    };


    // =======================================================
    // OUVRIR AJOUT
    // =======================================================

    const openAdd = () => {

        setAdding(true);

        setEditing(null);

        setForm(empty);

        setImageFile(undefined);

        setImagePreview("");
    };


    // =======================================================
    // FERMER
    // =======================================================

    const closeModal = () => {

        setAdding(false);

        setEditing(null);

        setForm(empty);

        setImageFile(undefined);

        setImagePreview("");
    };


    // =======================================================
    // RENDER
    // =======================================================
// =======================================================
// FILTRES ET GROUPES DU CATALOGUE
// =======================================================

const categories = [
    "Toutes",
    "Bougies",
    "Fleurs",
    "Diffuseurs",
    "Cadeaux",
    "Nouveauté"
];

const visibleProducts = products.filter((product) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [
        product.name,
        product.category,
        product.scent,
        product.description
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));

    const matchesCategory =
        categoryFilter === "Toutes" ||
        product.category?.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
});

const categoryOrder = [
    "Bougies",
    "Fleurs",
    "Diffuseurs",
    "Cadeaux",
    "Nouveauté"
];

const groupedProducts = categoryOrder
    .map((category) => ({
        category,
        products: visibleProducts.filter(
            (product) => product.category?.toLowerCase() === category.toLowerCase()
        )
    }))
    .filter((group) => group.products.length > 0);

const otherCategories = Array.from(
    new Set(
        visibleProducts
            .map((p) => p.category)
            .filter(
                (category) =>
                    category &&
                    !categoryOrder.some(
                        (c) => c.toLowerCase() === category.toLowerCase()
                    )
            )
    )
);

const allGroups = [
    ...groupedProducts,
    ...otherCategories.map((category) => ({
        category,
        products: visibleProducts.filter((p) => p.category === category)
    }))
];

    return (

        <div className="page">

            <section className="panel">


                {/* =================================================
              HEADER
          ================================================= */}

                <div className="panel-head">

                    <div>

                        <h3 className="eyebrow">
                            CATALOGUE
                        </h3>

                    </div>


                    <button
                        className="dark-button"
                        onClick={openAdd}
                    >

                        <Plus size={16} />

                        Ajouter un produit

                    </button>

                </div>


                <div className="catalogue-toolbar">
                    <div className="catalogue-search">
                        <Search size={17} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un produit, parfum..."
                        />
                    </div>

                    <div className="catalogue-filters">
                        {categories.map((category) => (
                            <button
                                type="button"
                                key={category}
                                className={categoryFilter === category ? "active" : ""}
                                onClick={() => setCategoryFilter(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* =================================================
              LISTE
          ================================================= */}

               <div className="catalogue-categories">

    {allGroups.map((group) => (

        <section
            className="catalogue-category"
            key={group.category}
        >

            <div className="category-header">

                <div>

                    <h2>
                        {group.category}
                    </h2>
                </div>

            </div>


            <div className="product-grid catalogue-product-grid">

                {group.products.map((p) => (

                    <article
                        className="product-card"
                        key={p.id}
                    >

                        {/* IMAGE */}

                        <div className="product-photo">

                            {p.image ? (

                                <img
                                    src={p.image}
                                    alt={p.name}
                                    onError={(e) => {
                                        e.currentTarget.style.display =
                                            "none";
                                    }}
                                />

                            ) : (

                                <span>
                                    CN
                                </span>

                            )}

                            <span
                                className={
                                    p.active
                                        ? "active-dot"
                                        : "inactive-dot"
                                }
                            />

                        </div>


                        {/* INFORMATIONS */}

                        <div className="product-info">
                            <div className="product-category-line">
                                <span>{p.category || "Côte Noire"}</span>
                                <span className={p.active ? "stock-status active" : "stock-status inactive"}>
                                    {p.active ? "Actif" : "Inactif"}
                                </span>
                            </div>

                            <h3>
                                {p.name}
                            </h3>

                            <p>
                                {p.scent ||
                                    "Parfum Côte Noire"}
                            </p>


                            <div className="product-meta">

                                <strong>
                                    {Number(
                                        p.price
                                    ).toFixed(2)}{" "}
                                    TND
                                </strong>

                                <span className={p.stock > 0 ? "stock-count" : "stock-count empty"}>
                                    {p.stock > 0 ? `${p.stock} en stock` : "Rupture"}
                                </span>

                            </div>


                            {/* ACTIONS */}

                            <div className="product-actions">

                                <button
                                    type="button"
                                    onClick={() =>
                                        edit(p)
                                    }
                                >

                                    <Pencil size={14} />

                                    Modifier

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        remove(p.id)
                                    }
                                    className="danger"
                                >

                                    <Trash2 size={14} />

                                </button>

                            </div>

                        </div>

                    </article>

                ))}

            </div>

        </section>

    ))}


    {/* AUCUN PRODUIT */}

    {visibleProducts.length === 0 && (

        <div
            style={{
                width: "100%",
                padding: "40px",
                textAlign: "center"
            }}
        >

            <p>
                Aucun produit disponible.
            </p>

        </div>

    )}

</div>

            </section>


            {/* =================================================
            MODAL
        ================================================= */}

            {(adding || editing) && (

                <div className="modal-backdrop">


                    <form
                        className="modal"
                        onSubmit={submit}
                    >


                        {/* =============================================
                  FERMER
              ============================================= */}

                        <button
                            type="button"
                            className="modal-close"
                            onClick={closeModal}
                        >

                            <X size={18} />

                        </button>


                        {/* =============================================
                  TITRE
              ============================================= */}

                        <span className="eyebrow">

                            {editing
                                ? "MODIFIER"
                                : "NOUVEAU PRODUIT"}

                        </span>


                        <h2>

                            {editing
                                ? "Modifier le produit"
                                : "Ajouter un produit"}

                        </h2>


                        {/* =============================================
                  NOM
              ============================================= */}

                        <label>

                            Nom

                            <input
                                required
                                value={form.name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        name:
                                            e.target.value
                                    })
                                }
                            />

                        </label>


                        {/* =============================================
                  CATEGORIE + PRIX
              ============================================= */}

                        <div className="form-two">


                            <label>
                                Catégorie

                                <select
                                    value={form.category}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            category: e.target.value
                                        })
                                    }
                                >
                                    <option value="Bougies">Bougies</option>
                                    <option value="Fleurs">Fleurs</option>
                                    <option value="Diffuseurs">Diffuseurs</option>
                                    <option value="Cadeaux">Cadeaux</option>
                                    <option value="Nouveauté">Nouveauté</option>

                                </select>
                            </label>


                            <label>

                                Prix (TND)

                                <input
                                    required
                                    value={
                                        form.price
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            price:
                                                Number(
                                                    e.target.value
                                                )
                                        })
                                    }
                                />

                            </label>

                        </div>


                        {/* =============================================
                  STOCK + PARFUM
              ============================================= */}

                        <div className="form-two">


                            <label>

                                Stock

                                <input
                                    required
                                    value={
                                        form.stock
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            stock:
                                                Number(
                                                    e.target.value
                                                )
                                        })
                                    }
                                />

                            </label>


                            <label>

                                Parfum

                                <input
                                    value={
                                        form.scent
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            scent:
                                                e.target.value
                                        })
                                    }
                                />

                            </label>

                        </div>


                        {/* =============================================
                  IMAGE
              ============================================= */}

                        <label>

                            Image du produit


                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                onChange={
                                    handleImageChange
                                }
                            />

                        </label>


                        {/* =============================================
                  APERCU IMAGE
              ============================================= */}

                        {imagePreview && (

                            <div
                                style={{
                                    marginTop: "10px"
                                }}
                            >

                                <img
                                    src={imagePreview}
                                    alt="Aperçu du produit"
                                    style={{
                                        width: "150px",
                                        height: "150px",
                                        objectFit: "cover",
                                        borderRadius: "10px"
                                    }}
                                />

                            </div>

                        )}


                        {/* =============================================
                  DESCRIPTION
              ============================================= */}

                        <label>

                            Description

                            <textarea
                                rows={3}
                                value={
                                    form.description
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description:
                                            e.target.value
                                    })
                                }
                                placeholder="Description du produit..."
                            />

                        </label>


                        {/* =============================================
                  ACTIF
              ============================================= */}

                        <label className="checkbox">

                            <input
                                type="checkbox"
                                checked={
                                    form.active
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        active:
                                            e.target.checked
                                    })
                                }
                            />

                            Produit actif

                        </label>


                        {/* =============================================
                  ENREGISTRER
              ============================================= */}

                        <button
                            type="submit"
                            className="dark-button full"
                            disabled={saving}
                        >

                            {saving
                                ? "Enregistrement..."
                                : editing
                                    ? "Modifier le produit"
                                    : "Enregistrer"}

                        </button>

                    </form>

                </div>

            )}

        </div>
    );
}
