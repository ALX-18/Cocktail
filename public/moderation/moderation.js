// moderation.js

// Récupérer le token JWT stocké en sessionStorage
const token = sessionStorage.getItem('authToken');
if (!token) {
    alert("Vous devez être connecté en tant qu'administrateur.");
    window.location.href = '/login';
}

// Helper pour ajouter l'en-tête d'authentification
const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};

async function loadUsers() {
    try {
        const res = await fetch('/api/admin/users', { headers: authHeaders });
        if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs');
        const users = await res.json();
        const container = document.getElementById('usersList');
        container.innerHTML = users.map(u => `
      <div class="flex justify-between items-center p-3 border rounded">
        <div>${u.username} (${u.email}) - <strong>Rôle:</strong> ${u.role}</div>
        <div class="flex items-center gap-2">
          <select class="border rounded p-1" onchange="changeUserRole(${u.id}, this.value)">
            <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
          <button class="py-1 px-3 bg-red-600 text-white rounded hover:bg-red-700" onclick="deleteUser(${u.id})">
            Supprimer
          </button>
        </div>
      </div>
    `).join('');
    } catch (error) {
        alert(error.message);
    }
}


async function changeUserRole(userId, newRole) {
    if (!confirm(`Changer le rôle de l'utilisateur ${userId} en ${newRole} ?`)) return;
    try {
        const res = await fetch(`/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: authHeaders,
            body: JSON.stringify({ role: newRole })
        });
        if (!res.ok) throw new Error('Erreur lors du changement de rôle');
        alert('Rôle modifié avec succès');
        await loadUsers();
    } catch (error) {
        alert(error.message);
    }
}

async function loadCocktails() {
    try {
        const res = await fetch('/api/cocktails', { headers: authHeaders });
        if (!res.ok) throw new Error('Erreur lors du chargement des cocktails');
        const cocktails = await res.json();
        const container = document.getElementById('cocktailsList');
        container.innerHTML = cocktails.map(c => `
      <div class="flex justify-between items-center p-3 border rounded">
        <div>${c.name}</div>
        <button class="py-1 px-3 bg-red-600 text-white rounded hover:bg-red-700" onclick="deleteCocktail(${c.id})">
          Supprimer
        </button>
      </div>
    `).join('');
    } catch (error) {
        alert(error.message);
    }
}

async function deleteCocktail(cocktailId) {
    if (!confirm('Confirmer la suppression de ce cocktail ?')) return;
    try {
        const res = await fetch(`/api/admin/cocktails/${cocktailId}`, {
            method: 'DELETE',
            headers: authHeaders
        });
        if (!res.ok) throw new Error('Erreur lors de la suppression du cocktail');
        alert('Cocktail supprimé avec succès');
        await loadCocktails();
    } catch (error) {
        alert(error.message);
    }
}
async function deleteUser(userId) {
    if (!confirm('Confirmer la suppression de cet utilisateur ?')) return;
    try {
        const res = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: authHeaders
        });
        if (!res.ok) throw new Error('Erreur lors de la suppression de l\'utilisateur');
        alert('Utilisateur supprimé avec succès');
        await loadUsers();
    } catch (error) {
        alert(error.message);
    }
}

window.deleteUser = deleteUser; // Rendre la fonction globale

// Rendre les fonctions globales pour que les onclick inline les trouve
window.changeUserRole = changeUserRole;
window.deleteCocktail = deleteCocktail;

// Chargement initial des données
loadUsers();
loadCocktails();

// Bouton retour profil
document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = '/profil';
});
