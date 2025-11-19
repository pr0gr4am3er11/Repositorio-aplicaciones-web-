
const API_URL = 'https://portfolio-api-three-black.vercel.app/api/v1';

let currentProjectId = null;
let projects = [];



function showNotification(message, type = 'info', title = '') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const titles = {
        success: title || '¡Éxito!',
        error: title || 'Error',
        warning: title || 'Advertencia',
        info: title || 'Información'
    };

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">${icons[type]}</div>
        <div class="notification-content">
            <div class="notification-title">${titles[type]}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="closeNotification(this)">✖</button>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            closeNotification(notification.querySelector('.notification-close'));
        }
    }, 5000);
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    if (!notification) return;

    notification.classList.add('closing');
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 300);
}


document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Cargado");
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    const token = localStorage.getItem('authToken');
    if (token) {
        verifyTokenAndLoadHome();
    } else {
        showAuthView();
    }
}

function setupEventListeners() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const projectForm = document.getElementById("projectForm");

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }

    if (projectForm) {
        projectForm.addEventListener("submit", handleProjectSubmit);
    }
}



async function handleRegister(e) {
    e.preventDefault();
    console.log("Iniciando registro...");

    const form = e.target;
    const itsonId = form.querySelector('#registerItsonId')?.value;
    const name = form.querySelector('#registerName')?.value;
    const email = form.querySelector('#registerEmail')?.value;
    const password = form.querySelector('#registerPassword')?.value;
    const confirmPassword = form.querySelector('#registerConfirmPassword')?.value;

    if (!itsonId || !name || !email || !password || !confirmPassword) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                itsonId: itsonId,
                password: password
            })
        });

        const data = await response.json();
        console.log('Respuesta registro:', data);

        if (response.ok) {
            showNotification('¡Ahora puedes iniciar sesión!', 'success', '¡Registro Exitoso!');
            switchToLogin();
            form.reset();
        } else {
            showNotification(data.message || 'No se pudo completar el registro', 'error');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showNotification('Error de conexión. Intenta de nuevo.', 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    console.log("Iniciando login...");

    const form = e.target;
    const email = form.querySelector('#loginEmail')?.value;
    const password = form.querySelector('#loginPassword')?.value;

    if (!email || !password) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();
        console.log('Respuesta login:', data);

        if (response.ok && data.token) {
            localStorage.setItem('authToken', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            showNotification('Bienvenido de nuevo', 'success', '¡Login Exitoso!');
            
            showHomeView();
            
            setTimeout(() => {
                loadProjects();
            }, 500);
            
        } else {
            showNotification(data.message || 'Credenciales incorrectas', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showNotification('Error de conexión. Intenta de nuevo.', 'error');
    }
}

async function verifyTokenAndLoadHome() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        showAuthView();
        return;
    }

    showHomeView();
    
    setTimeout(() => {
        loadProjects();
    }, 300);
}



function confirmLogout() {
    console.log('Cerrando sesión...');
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    projects = [];
    
    const modal = document.getElementById('logoutModal');
    if (modal) modal.style.display = 'none';
    
    showAuthView();
    showNotification('¡Hasta pronto!', 'info', 'Sesión Cerrada');
}

function openLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        confirmLogout();
    }
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) modal.style.display = 'none';
}



function showAuthView() {
    const authView = document.getElementById("authView");
    const homeView = document.getElementById("homeView");
    
    if (authView) authView.classList.add("active");
    if (homeView) homeView.classList.remove("active");
}

function showHomeView() {
    const authView = document.getElementById("authView");
    const homeView = document.getElementById("homeView");
    
    if (authView) authView.classList.remove("active");
    if (homeView) homeView.classList.add("active");
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNameElement = document.getElementById("userName");
    if (userNameElement && user.name) {
        userNameElement.textContent = user.name;
    }
}

function switchToRegister() {
    const container = document.getElementById("formsContainer");
    if (container) container.style.transform = "translateX(-50%)";
}

function switchToLogin() {
    const container = document.getElementById("formsContainer");
    if (container) container.style.transform = "translateX(0%)";
}



async function loadProjects() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showAuthView();
        return;
    }

    const projectsGrid = document.getElementById("projectsGrid");
    if (!projectsGrid) return;
    
    projectsGrid.innerHTML = '<div class="loading-message">Cargando proyectos...</div>';

    try {
        const response = await fetch(`${API_URL}/projects`, {
            method: 'GET',
            headers: {
                'auth-token': token
            }
        });

        console.log('Status de carga de proyectos:', response.status);

        if (response.status === 404) {
            projectsGrid.innerHTML = `
                <div class="error-message">
                    ⚠️ El endpoint de proyectos aún no está configurado.
                </div>
            `;
            return;
        }

        if (response.status === 401) {
            projectsGrid.innerHTML = `
                <div class="error-message">
                    ⚠️ No se pudieron cargar los proyectos. Token inválido o expirado.
                </div>
            `;
            return;
        }

        const data = await response.json();
        console.log('Datos de proyectos:', data);

        if (response.ok) {
            projects = Array.isArray(data) ? data : [];
            displayProjects();
        } else {
            throw new Error(data.message || 'Error al cargar proyectos');
        }
    } catch (error) {
        console.error('Error cargando proyectos:', error);
        projectsGrid.innerHTML = `
            <div class="error-message">
                ❌ Error de conexión: ${error.message}
                <br><br>
                <button class="btn-primary" onclick="loadProjects()" style="max-width: 200px; margin: 1rem auto; display: block;">
                    🔄 REINTENTAR
                </button>
            </div>
        `;
    }
}

function displayProjects() {
    const projectsGrid = document.getElementById("projectsGrid");
    if (!projectsGrid) return;

    if (projects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="empty-message">
                📭 No tienes proyectos aún. ¡Crea tu primer proyecto!
            </div>
        `;
        return;
    }

    projectsGrid.innerHTML = projects.map(project => `
        <div class="project-card">
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.description)}</p>
            ${project.technologies && project.technologies.length > 0 ? `
                <div style="margin: 0.5rem 0;">
                    <strong>🛠️ Tecnologías:</strong> ${project.technologies.join(', ')}
                </div>
            ` : ''}
            ${project.repository ? `
                <div style="margin: 0.5rem 0;">
                    <strong>📦 Repositorio:</strong> <a href="${escapeHtml(project.repository)}" target="_blank" style="color: #4ECDC4; text-decoration: underline;">Ver en GitHub</a>
                </div>
            ` : ''}
            <div class="project-actions">
                <button class="btn-edit" onclick="editProject('${project._id}')">
                    ✏️ EDITAR
                </button>
                <button class="btn-delete" onclick="deleteProject('${project._id}')">
                    🗑️ ELIMINAR
                </button>
            </div>
        </div>
    `).join('');
}

function showAddProjectForm() {
    const formTitle = document.getElementById("formTitle");
    const projectForm = document.getElementById("projectForm");
    const projectIdInput = document.getElementById("projectId");
    const formContainer = document.getElementById("projectFormContainer");

    if (formTitle) formTitle.textContent = "NUEVO PROYECTO";
    if (projectForm) projectForm.reset();
    if (projectIdInput) projectIdInput.value = "";
    if (formContainer) {
        formContainer.style.display = "block";
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    currentProjectId = null;
}

function hideProjectForm() {
    const formContainer = document.getElementById("projectFormContainer");
    const projectForm = document.getElementById("projectForm");
    
    if (formContainer) formContainer.style.display = "none";
    if (projectForm) projectForm.reset();
    
    currentProjectId = null;
}

async function handleProjectSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        showNotification('Debes iniciar sesión', 'warning');
        showAuthView();
        return;
    }

    const form = e.target;
    const projectId = form.querySelector('#projectId')?.value;
    
    
    const title = form.querySelector('#projectTitle')?.value.trim();
    const description = form.querySelector('#projectDescription')?.value.trim();
    const technologiesInput = form.querySelector('#projectTechnologies')?.value.trim();
    const repositoryInput = form.querySelector('#projectRepository')?.value.trim();

    
    if (!title || !description) {
        showNotification('Por favor completa título y descripción', 'error');
        return;
    }

    if (title.length < 3) {
        showNotification('El título debe tener al menos 3 caracteres', 'error');
        return;
    }

    
    const technologies = technologiesInput
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0);

    
    const projectData = {
        title: title,
        description: description,
        userId: user.id,
        technologies: technologies,
        images: []
    };

    
    if (repositoryInput && repositoryInput.length > 0) {
        projectData.repository = repositoryInput;
    }

    console.log('Enviando proyecto:', projectData);

    try {
        const url = projectId 
            ? `${API_URL}/projects/${projectId}` 
            : `${API_URL}/projects`;
        
        const method = projectId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'auth-token': token
            },
            body: JSON.stringify(projectData)
        });

        const data = await response.json();
        console.log('Respuesta guardar proyecto:', data);

        if (response.ok) {
            showNotification(
                projectId ? 'Proyecto actualizado correctamente' : 'Proyecto creado correctamente',
                'success',
                projectId ? '¡Actualizado!' : '¡Creado!'
            );
            hideProjectForm();
            loadProjects();
        } else {
            throw new Error(data.message || 'Error al guardar proyecto');
        }
    } catch (error) {
        console.error('Error guardando proyecto:', error);
        showNotification(error.message, 'error');
    }
}

function editProject(projectId) {
    const project = projects.find(p => p._id === projectId);
    if (!project) {
        showNotification('Proyecto no encontrado', 'error');
        return;
    }

    const formTitle = document.getElementById("formTitle");
    const projectIdInput = document.getElementById("projectId");
    const projectTitleInput = document.getElementById("projectTitle");
    const projectDescriptionInput = document.getElementById("projectDescription");
    const projectTechnologiesInput = document.getElementById("projectTechnologies");
    const projectRepositoryInput = document.getElementById("projectRepository");
    const formContainer = document.getElementById("projectFormContainer");

    if (formTitle) formTitle.textContent = "EDITAR PROYECTO";
    if (projectIdInput) projectIdInput.value = project._id;
    if (projectTitleInput) projectTitleInput.value = project.title;
    if (projectDescriptionInput) projectDescriptionInput.value = project.description;
    
    if (projectTechnologiesInput && project.technologies) {
        projectTechnologiesInput.value = project.technologies.join(', ');
    }
    
    
    if (projectRepositoryInput) {
        projectRepositoryInput.value = project.repository || '';
    }
    
    if (formContainer) {
        formContainer.style.display = "block";
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    currentProjectId = projectId;
}

function deleteProject(projectId) {
    currentProjectId = projectId;
    const modal = document.getElementById("deleteModal");
    if (modal) modal.style.display = "flex";
}

async function confirmDelete() {
    const token = localStorage.getItem('authToken');
    if (!token || !currentProjectId) {
        closeDeleteModal();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/projects/${currentProjectId}`, {
            method: 'DELETE',
            headers: {
                'auth-token': token
            }
        });

        console.log('Respuesta eliminar proyecto:', response.status);

        if (response.ok) {
            showNotification('Proyecto eliminado correctamente', 'success', '¡Eliminado!');
            closeDeleteModal();
            loadProjects();
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Error al eliminar proyecto');
        }
    } catch (error) {
        console.error('Error eliminando proyecto:', error);
        showNotification(error.message, 'error');
        closeDeleteModal();
    }
}

function closeDeleteModal() {
    const modal = document.getElementById("deleteModal");
    if (modal) modal.style.display = "none";
    currentProjectId = null;
}


function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}



window.showAddProjectForm = showAddProjectForm;
window.hideProjectForm = hideProjectForm;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.confirmDelete = confirmDelete;
window.closeDeleteModal = closeDeleteModal;
window.confirmLogout = confirmLogout;
window.openLogoutModal = openLogoutModal;
window.closeLogoutModal = closeLogoutModal;
window.closeNotification = closeNotification;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.loadProjects = loadProjects;
window.logout = openLogoutModal;