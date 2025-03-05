// Fonction pour récupérer les cocktails
async function fetchCocktails(search = "") {
    try {
      const response = await fetch(`/api/cocktails?search=${search}`)
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des cocktails")
      }
      const cocktails = await response.json()
  
      const cocktailList = document.getElementById("cocktailList")
      cocktailList.innerHTML = "" // Vider la liste avant de la remplir
  
      if (cocktails.length === 0) {
        cocktailList.innerHTML = '<p class="col-span-full text-center text-gray-500">Aucun cocktail trouvé.</p>'
        return
      }
  
      cocktails.forEach((cocktail) => {
        const cocktailElement = document.createElement("div")
        cocktailElement.className =
          "cocktail-card bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg"
        cocktailElement.innerHTML = `
                  <h3 class="text-lg font-semibold mb-2">${cocktail.name}</h3>
                  <p class="text-gray-600 mb-3">${cocktail.description || "Aucune description disponible."}</p>
                  <div class="mb-2">
                      <h4 class="font-medium text-slate-700">Ingrédients:</h4>
                      <p>${cocktail.ingredients ? cocktail.ingredients.join(", ") : "N/A"}</p>
                  </div>
                  ${
                    cocktail.instructions
                      ? `
                  <div>
                      <h4 class="font-medium text-slate-700">Instructions:</h4>
                      <p class="text-gray-600">${cocktail.instructions}</p>
                  </div>`
                      : ""
                  }
              `
        cocktailList.appendChild(cocktailElement)
      })
    } catch (error) {
      console.error(error)
      alert("Erreur lors du chargement des cocktails.")
    }
  }
  
  // Gestionnaire d'événement pour la recherche
  document.getElementById("searchBtn").addEventListener("click", () => {
    const searchInput = document.getElementById("searchInput").value
    fetchCocktails(searchInput)
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
      const response = await fetch("/api/cocktails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, ingredients, instructions }),
      })
  
      if (!response.ok) throw new Error("Erreur lors de l'ajout du cocktail")
  
      // Réinitialiser le formulaire
      document.getElementById("addCocktailForm").reset()
  
      // Notification de succès
      const notification = document.createElement("div")
      notification.className = "fixed top-4 right-4 bg-green-500 text-white p-3 rounded-md shadow-lg"
      notification.textContent = "Cocktail ajouté avec succès !"
      document.body.appendChild(notification)
  
      // Supprimer la notification après 3 secondes
      setTimeout(() => {
        notification.remove()
      }, 3000)
  
      // Recharger la liste des cocktails
      fetchCocktails()
    } catch (error) {
      console.error("Erreur lors de l'ajout du cocktail:", error)
      alert("Erreur lors de l'ajout du cocktail.")
    }
  })
  
  // Ajouter un gestionnaire d'événement pour la touche Entrée dans le champ de recherche
  document.getElementById("searchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const searchInput = document.getElementById("searchInput").value
      fetchCocktails(searchInput)
    }
  })
  
  // Charger les cocktails au chargement de la page
  document.addEventListener("DOMContentLoaded", () => {
    fetchCocktails()
  })
  
  