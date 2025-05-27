// public/favoritesAndRatings.js
// Gestion des favoris et des ratings côté API (liés à l'utilisateur)

// Nouveau système de like/favoris :
// Utilise localStorage pour stocker les favoris côté client (pas de crash DB, instantané)
// Les favoris sont persistants par navigateur/utilisateur

function getLocalFavorites() {
  return JSON.parse(localStorage.getItem('favorites') || '[]');
}
function setLocalFavorites(favs) {
  localStorage.setItem('favorites', JSON.stringify(favs));
}
function isLocalFavorite(id) {
  return getLocalFavorites().includes(id);
}
function toggleLocalFavorite(id) {
  let favs = getLocalFavorites();
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
  } else {
    favs.push(id);
  }
  setLocalFavorites(favs);
}


// Ratings (localStorage)
function getLocalRatings() {
  return JSON.parse(localStorage.getItem('ratings') || '{}');
}
function setLocalRatings(ratings) {
  localStorage.setItem('ratings', JSON.stringify(ratings));
}
function getUserRating(cocktailId) {
  const ratings = getLocalRatings();
  return ratings[cocktailId] || 0;
}
function setUserRating(cocktailId, rating, ratingEl) {
  const ratings = getLocalRatings();
  ratings[cocktailId] = rating;
  setLocalRatings(ratings);
  // Met à jour l'affichage des étoiles
  const stars = ratingEl.querySelectorAll('i');
  stars.forEach((star, idx) => {
    if (idx < rating) {
      star.classList.remove('ri-star-line');
      star.classList.add('ri-star-fill');
    } else {
      star.classList.remove('ri-star-fill');
      star.classList.add('ri-star-line');
    }
  });
}

// Initialisation dynamique des boutons favoris et ratings
window.initFavoritesAndRatings = function() {
  // Favoris (localStorage)
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    const id = btn.dataset.id;
    const icon = btn.querySelector('i');
    if (isLocalFavorite(id)) {
      icon.classList.remove('ri-heart-line');
      icon.classList.add('ri-heart-fill');
      btn.classList.add('pulse-animation');
    } else {
      icon.classList.remove('ri-heart-fill');
      icon.classList.add('ri-heart-line');
      btn.classList.remove('pulse-animation');
    }
    btn.onclick = () => {
      toggleLocalFavorite(id);
      window.initFavoritesAndRatings();
    };
  });

  // Ratings (localStorage)
  document.querySelectorAll('.rating').forEach(ratingEl => {
    const id = ratingEl.dataset.id;
    const userRating = getUserRating(id);
    const stars = ratingEl.querySelectorAll('i');
    stars.forEach((star, idx) => {
      if (idx < userRating) {
        star.classList.remove('ri-star-line');
        star.classList.add('ri-star-fill');
      } else {
        star.classList.remove('ri-star-fill');
        star.classList.add('ri-star-line');
      }
      star.onclick = () => {
        setUserRating(id, idx + 1, ratingEl);
        window.initFavoritesAndRatings();
      };
    });
  });
};
