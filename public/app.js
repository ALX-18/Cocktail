// Gestionnaire de thème sombre
document.addEventListener("DOMContentLoaded", () => {
  // Vérifier les préférences de l'utilisateur
  if (
    localStorage.getItem("darkMode") === "true" ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches && !localStorage.getItem("darkMode"))
  ) {
    document.documentElement.classList.add("dark")
    updateDarkModeIcon(true)
  }

  // Chargement initial des cocktails
  fetchCocktails()

  // Toggle pour le mode sombre
  document.getElementById("darkModeToggle").addEventListener("click", toggleDarkMode)

  // Toggle pour la vue grille/liste
  document.getElementById("toggleView").addEventListener("click", toggleView)

  // Gestionnaire de tri
  document.getElementById("sortButton").addEventListener("click", toggleSort)
})

function updateDarkModeIcon(isDark) {
  const icon = document.querySelector("#darkModeToggle i")
  if (isDark) {
    icon.classList.remove("ri-moon-line")
    icon.classList.add("ri-sun-line")
  } else {
    icon.classList.remove("ri-sun-line")
    icon.classList.add("ri-moon-line")
  }
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle("dark")
  localStorage.setItem("darkMode", isDark)
  updateDarkModeIcon(isDark)
}

let isGridView = true
function toggleView() {
  const cocktailList = document.getElementById("cocktailList")
  const icon = document.querySelector("#toggleView i")

  isGridView = !isGridView

  if (isGridView) {
    cocktailList.classList.remove("grid-cols-1")
    cocktailList.classList.add("grid-cols-1", "md:grid-cols-2")
    icon.classList.remove("ri-list-check")
    icon.classList.add("ri-layout-grid-line")
  } else {
    cocktailList.classList.remove("md:grid-cols-2")
    cocktailList.classList.add("grid-cols-1")
    icon.classList.remove("ri-layout-grid-line")
    icon.classList.add("ri-list-check")
  }
}

let currentSort = "asc"
function toggleSort() {
  currentSort = currentSort === "asc" ? "desc" : "asc"
  const icon = document.querySelector("#sortButton i")

  if (currentSort === "asc") {
    icon.classList.remove("ri-sort-desc")
    icon.classList.add("ri-sort-asc")
  } else {
    icon.classList.remove("ri-sort-asc")
    icon.classList.add("ri-sort-desc")
  }

  fetchCocktails(document.getElementById("searchInput").value)
}

// Images aléatoires pour les cocktails
function getRandomCocktailImage() {
  const images = [
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1536935338788-846bb9981813?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1486947799489-3fabdd7d32a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  ]
  return images[Math.floor(Math.random() * images.length)]
}

// Fonction pour formater les ingrédients sous forme de liste
function formatIngredients(ingredients) {
  if (!ingredients || !ingredients.length) return "<p>N/A</p>"

  return `
        <ul class="list-disc pl-5 space-y-1">
            ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
        </ul>
    `
}

// Fonction pour récupérer les cocktails
async function fetchCocktails(search = "") {
  try {
    // Simulation - à remplacer par votre API
    let mockedCocktails = []
    if (localStorage.getItem("cocktails")) {
      mockedCocktails = JSON.parse(localStorage.getItem("cocktails"))
    } else {
      // Données initiales
      mockedCocktails = [
        {
          id: 1,
          name: "Mojito",
          description: "Un cocktail rafraîchissant à base de rhum, menthe et citron vert.",
          ingredients: [
            "45ml de rhum blanc",
            "2 cuillères à café de sucre",
            "1/2 citron vert",
            "Quelques feuilles de menthe",
            "Eau gazeuse",
          ],
          instructions:
            "Piler la menthe avec le sucre et le jus de citron vert. Ajouter le rhum et compléter avec de l'eau gazeuse.",
        },
        {
          id: 2,
          name: "Margarita",
          description: "Un classique mexicain avec tequila et citron vert.",
          ingredients: ["50ml de tequila", "25ml de triple sec", "25ml de jus de citron vert", "Sel", "Glaçons"],
          instructions:
            "Frotter le bord d'un verre avec du citron vert et le tremper dans du sel. Mélanger la tequila, le triple sec et le jus de citron avec des glaçons. Filtrer dans le verre préparé.",
        },
        {
          id: 3,
          name: "Piña Colada",
          description: "Cocktail tropical créé à Puerto Rico.",
          ingredients: ["50ml de rhum blanc", "30ml de lait de coco", "50ml de jus d'ananas", "Glaçons"],
          instructions:
            "Mélanger tous les ingrédients avec des glaçons dans un mixeur jusqu'à obtenir une consistance lisse. Verser dans un verre et décorer d'une tranche d'ananas.",
        },
      ]
      localStorage.setItem("cocktails", JSON.stringify(mockedCocktails))
    }

    // Filtrer si nécessaire
    let cocktails = mockedCocktails
    if (search) {
      const searchLower = search.toLowerCase()
      cocktails = cocktails.filter(
        (cocktail) =>
          cocktail.name.toLowerCase().includes(searchLower) ||
          (cocktail.description && cocktail.description.toLowerCase().includes(searchLower)) ||
          (cocktail.ingredients && cocktail.ingredients.some((ing) => ing.toLowerCase().includes(searchLower))),
      )
    }

    // Trier les cocktails
    cocktails.sort((a, b) => {
      if (currentSort === "asc") {
        return a.name.localeCompare(b.name)
      } else {
        return b.name.localeCompare(a.name)
      }
    })

    const cocktailList = document.getElementById("cocktailList")
    cocktailList.innerHTML = "" // Vider la liste avant de la remplir

    if (cocktails.length === 0) {
      cocktailList.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-10 text-center">
                    <i class="ri-search-2-line text-5xl text-gray-400 mb-4"></i>
                    <p class="text-xl text-gray-500">Aucun cocktail trouvé</p>
                    <p class="text-gray-400 mt-2">Essayez d'autres termes de recherche ou ajoutez un nouveau cocktail.</p>
                </div>
            `
      return
    }

    cocktails.forEach((cocktail) => {
      const cocktailImage = getRandomCocktailImage()
      const cocktailElement = document.createElement("div")
      cocktailElement.className = "cocktail-card bg-white rounded-xl shadow-md overflow-hidden transition-all group"
      cocktailElement.innerHTML = `
                <div class="relative h-48 overflow-hidden">
                    <img src="${cocktailImage}" alt="${cocktail.name}" class="w-full h-full object-cover cocktail-image">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div class="p-4 text-white">
                            <h4 class="font-semibold">${cocktail.name}</h4>
                        </div>
                    </div>
                </div>
                <div class="p-5">
                    <h3 class="text-xl font-semibold mb-2">${cocktail.name}</h3>
                    <p class="text-gray-600 mb-4">${cocktail.description || "Aucune description disponible."}</p>
                    
                    <div class="mb-3">
                        <h4 class="font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <i class="ri-flask-line"></i>
                            <span>Ingrédients</span>
                        </h4>
                        ${formatIngredients(cocktail.ingredients)}
                    </div>
                    
                    ${
                      cocktail.instructions
                        ? `
                    <div>
                        <h4 class="font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <i class="ri-file-list-line"></i>
                            <span>Instructions</span>
                        </h4>
                        <p class="text-gray-600">${cocktail.instructions}</p>
                    </div>
                    `
                        : ""
                    }
                    
                    <div class="mt-5 pt-4 border-t border-gray-100 flex justify-between">
                        <button class="text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1" 
                                onclick="editCocktail(${cocktail.id})">
                            <i class="ri-edit-line"></i>
                            <span>Modifier</span>
                        </button>
                        <button class="text-red-500 hover:text-red-700 transition flex items-center gap-1"
                                onclick="deleteCocktail(${cocktail.id})">
                            <i class="ri-delete-bin-line"></i>
                            <span>Supprimer</span>
                        </button>
                    </div>
                </div>
            `
      cocktailList.appendChild(cocktailElement)
    })
  } catch (error) {
    console.error(error)
    showNotification("Erreur lors du chargement des cocktails.", "error")
  }
}

// Fonction d'édition (à implémenter)
function editCocktail(id) {
  alert(`Édition du cocktail #${id} - Fonctionnalité à implémenter`)
}

// Fonction de suppression
function deleteCocktail(id) {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce cocktail ?")) {
    let cocktails = JSON.parse(localStorage.getItem("cocktails") || "[]")
    cocktails = cocktails.filter((c) => c.id !== id)
    localStorage.setItem("cocktails", JSON.stringify(cocktails))
    fetchCocktails(document.getElementById("searchInput").value)
    showNotification("Cocktail supprimé avec succès !")
  }
}

// Gestionnaire d'événement pour la recherche
document.getElementById("searchBtn").addEventListener("click", () => {
  const searchInput = document.getElementById("searchInput").value
  fetchCocktails(searchInput)
})

// Ajouter un gestionnaire d'événement pour la touche Entrée dans le champ de recherche
document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const searchInput = document.getElementById("searchInput").value
    fetchCocktails(searchInput)
  }
})

// Gestionnaire d'événement pour la soumission du formulaire
document.getElementById("addCocktailForm").addEventListener("submit", async (e) => {
  e.preventDefault() // Empêche le rechargement de la page

  const name = document.getElementById("name").value
  const description = document.getElementById("description").value
  const ingredients = document
    .getElementById("ingredients")
    .value.split(",")
    .map((i) => i.trim())
  const instructions = document.getElementById("instructions").value

  try {
    // Simulation - à remplacer par votre API
    const cocktails = JSON.parse(localStorage.getItem("cocktails") || "[]")
    const newId = cocktails.length > 0 ? Math.max(...cocktails.map((c) => c.id)) + 1 : 1

    const newCocktail = {
      id: newId,
      name,
      description,
      ingredients,
      instructions,
    }

    cocktails.push(newCocktail)
    localStorage.setItem("cocktails", JSON.stringify(cocktails))

    // Réinitialiser le formulaire
    document.getElementById("addCocktailForm").reset()

    // Notification de succès
    showNotification("Cocktail ajouté avec succès !")

    // Recharger la liste des cocktails
    fetchCocktails(document.getElementById("searchInput").value)
  } catch (error) {
    console.error("Erreur lors de l'ajout du cocktail:", error)
    showNotification("Erreur lors de l'ajout du cocktail.", "error")
  }
})

// Fonction pour afficher les notifications
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification")

  // Définir le style selon le type
  if (type === "success") {
    notification.className =
      "fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 slide-in"
    notification.innerHTML = `<i class="ri-check-line text-xl"></i><span>${message}</span>`
  } else {
    notification.className =
      "fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 slide-in"
    notification.innerHTML = `<i class="ri-error-warning-line text-xl"></i><span>${message}</span>`
  }

  // Afficher la notification
  notification.style.transform = "translateX(0)"

  // Cacher la notification après 3 secondes
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
  }, 3000)
}

