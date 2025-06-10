// Adicione no topo do arquivo, fora de qualquer função:
let allModulosCache = [];
// Caches para sub-detalhes se necessário
let moduloDetailsAulasCache = {};
let moduloDetailsCursosCache = {};


document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadModulos();
    } catch (error) {
        console.error('Error on initial load of Módulos page:', error);
        window.showNotification('Erro crítico ao carregar a página de módulos.', 'error');
    }

    const btnNewModulo = document.getElementById('btn-new-modulo');
    if (btnNewModulo) {
        btnNewModulo.addEventListener('click', () => showModuloForm());
    }

    const btnCloseDetails = document.getElementById('btn-close-details');
    if (btnCloseDetails) {
        btnCloseDetails.addEventListener('click', () => {
            const detailsPanel = document.getElementById('modulo-details');
            if (detailsPanel) detailsPanel.style.display = 'none';
        });
    }

    // Adicionar listeners para a barra de pesquisa de módulos
    const searchModulosInput = document.getElementById('search-modulos-input');
    const searchModulosButton = document.getElementById('search-modulos-button');

    if (searchModulosButton && searchModulosInput) {
        searchModulosButton.addEventListener('click', () => {
            loadModulos(searchModulosInput.value.trim());
        });
        searchModulosInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadModulos(searchModulosInput.value.trim());
            }
        });
    }
});

async function loadModulos(searchTerm = '') {
    const tbody = document.querySelector('#modulos-table tbody');
    if (!tbody) {
        console.error('Módulos table body not found!');
        return;
    }
    tbody.innerHTML = '<tr><td colspan="4">Carregando módulos...</td></tr>';

    try {
        if (allModulosCache.length === 0 && searchTerm === '') {
            allModulosCache = await window.getAllModulos();
        }

        let modulosToDisplay = allModulosCache;

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            modulosToDisplay = allModulosCache.filter(modulo =>
                (modulo.conteudo && modulo.conteudo.toLowerCase().includes(lowerSearchTerm))
            );
        }

        tbody.innerHTML = '';

        if (!modulosToDisplay || modulosToDisplay.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4">${searchTerm ? 'Nenhum módulo encontrado com o termo "' + searchTerm + '".' : 'Nenhum módulo encontrado.'}</td></tr>`;
            return;
        }

        modulosToDisplay.forEach(modulo => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${modulo.id}</td>
                <td>${modulo.conteudo || 'N/A'}</td>
                <td>CH: ${modulo.cargaHoraria || 0}h, Aulas: ${modulo.qtdAulas || 0}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary view-modulo" data-id="${modulo.id}" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-primary edit-modulo" data-id="${modulo.id}" title="Editar Módulo">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-modulo" data-id="${modulo.id}" title="Excluir Módulo">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        attachModuloActionListeners();
    } catch (error) {
        console.error('Error loading módulos:', error);
        tbody.innerHTML = '<tr><td colspan="4">Erro ao carregar módulos.</td></tr>';
        window.showNotification('Erro ao carregar lista de módulos.', 'error');
        if (searchTerm === '') allModulosCache = [];
    }
}

function attachModuloActionListeners() {
    document.querySelectorAll('.view-modulo').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            showModuloDetails(id);
        });
    });

    document.querySelectorAll('.edit-modulo').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            showModuloForm(id);
        });
    });

    document.querySelectorAll('.delete-modulo').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            window.confirmDelete('módulo', id, async () => {
                await window.deleteModulo(id);
                allModulosCache = []; // CORREÇÃO: Invalida o cache
                await loadModulos(); // Recarrega a lista do zero
            });
        });
    });
}

async function showModuloDetails(moduloId) {
    const detailsPanel = document.getElementById('modulo-details');
    const moduloInfoDiv = document.getElementById('modulo-info');

    if (!detailsPanel || !moduloInfoDiv) {
        console.error('Modulo details elements not found!');
        return;
    }

    try {
        const modulo = await window.getModuloById(moduloId);
        if (!modulo) {
            window.showNotification('Módulo não encontrado.', 'error');
            return;
        }

        moduloInfoDiv.innerHTML = `
            <div class="form-group"><label>ID:</label><p>${modulo.id}</p></div>
            <div class="form-group"><label>Conteúdo (Nome):</label><p>${modulo.conteudo || 'N/A'}</p></div>
            <div class="form-group"><label>Carga Horária:</label><p>${modulo.cargaHoraria !== null ? modulo.cargaHoraria + ' horas' : 'N/A'}</p></div>
            <div class="form-group"><label>Quantidade de Aulas (Previstas):</label><p>${modulo.qtdAulas !== null ? modulo.qtdAulas : 'N/A'}</p></div>
        `;

        detailsPanel.style.display = 'block';

        const btnAddAula = document.getElementById('btn-add-aula');
        if (btnAddAula) {
            btnAddAula.setAttribute('data-modulo-id', moduloId);
            const newBtnAddAula = btnAddAula.cloneNode(true);
            btnAddAula.parentNode.replaceChild(newBtnAddAula, btnAddAula);
            newBtnAddAula.addEventListener('click', () => showAulaForm(null, moduloId));
        }

        await loadAulasByModulo(moduloId);
        await loadCursosByModulo(moduloId);

    } catch (error) {
        console.error(`Error showing modulo details for ID ${moduloId}:`, error);
        window.showNotification('Erro ao carregar detalhes do módulo.', 'error');
        detailsPanel.style.display = 'none';
    }
}

async function loadAulasByModulo(moduloId) {
    const tbody = document.querySelector('#aulas-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="3">Carregando aulas...</td></tr>';

    try {
        const aulas = await window.getAulasByModuloId(moduloId);
        tbody.innerHTML = '';

        if (!aulas || aulas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">Nenhuma aula encontrada para este módulo.</td></tr>';
            return;
        }

        aulas.forEach(aula => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${aula.id}</td>
                <td>${aula.titulo || 'N/A'} (Duração: ${aula.duracao || 'N/A'})</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary edit-aula" data-aula-id="${aula.id}" data-modulo-id="${moduloId}" title="Editar Aula">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-aula" data-aula-id="${aula.id}" data-modulo-id="${moduloId}" title="Excluir Aula">
                        <i class="fas fa-trash"></i>
                    </button>
                    </td>
            `;
            tbody.appendChild(tr);
        });
        attachAulaActionListeners(moduloId);
    } catch (error) {
        console.error('Error loading aulas for modulo:', error);
        tbody.innerHTML = '<tr><td colspan="3">Erro ao carregar aulas.</td></tr>';
    }
}

function attachAulaActionListeners(currentModuloId) {
    document.querySelectorAll('.edit-aula').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const aulaId = this.getAttribute('data-aula-id');
            const moduloId = this.getAttribute('data-modulo-id');
            showAulaForm(aulaId, moduloId);
        });
    });

    document.querySelectorAll('.delete-aula').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const aulaId = this.getAttribute('data-aula-id');
            const moduloId = this.getAttribute('data-modulo-id');
            window.confirmDelete('aula', aulaId, async () => {
                await window.deleteAula(aulaId);
                await loadAulasByModulo(moduloId);
            });
        });
    });
}

async function loadCursosByModulo(moduloId) {
    const tbody = document.querySelector('#cursos-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="3">Carregando cursos vinculados...</td></tr>';

    try {
        const cursoIds = await window.getCursosByModuloId(moduloId);
        tbody.innerHTML = '';

        if (!cursoIds || cursoIds.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">Este módulo não está vinculado a nenhum curso.</td></tr>';
            return;
        }

        for (const cursoId of cursoIds) {
            try {
                const curso = await window.getCursoById(cursoId);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${curso.id}</td>
                    <td>${curso.titulo || 'N/A'}</td>
                    <td>CH: ${curso.cargaHoraria || 0}h, Status: ${curso.status || 'N/A'}</td>
                `;
                tbody.appendChild(tr);
            } catch (fetchError) {
                console.warn(`Could not fetch details for curso ID ${cursoId}:`, fetchError);
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="3">Erro ao carregar curso ID ${cursoId}.</td>`;
                tbody.appendChild(tr);
            }
        }
    } catch (error) {
        console.error('Error loading cursos for modulo:', error);
        tbody.innerHTML = '<tr><td colspan="3">Erro ao carregar cursos vinculados.</td></tr>';
    }
}

async function showModuloForm(id = null) {
    let modulo = { id: '', conteudo: '', cargaHoraria: '', qtdAulas: '' };
    let formTitle = 'Novo Módulo';
    let isEditMode = id !== null;

    if (isEditMode) {
        formTitle = 'Editar Módulo';
        try {
            modulo = await window.getModuloById(id);
        } catch (error) {
            window.showNotification('Erro ao carregar dados do módulo para edição.', 'error');
            return;
        }
    }

    const formFields = [
        { name: 'conteudo', label: 'Conteúdo (Nome do Módulo)', type: 'text', value: modulo.conteudo, required: true },
        { name: 'cargaHoraria', label: 'Carga Horária (horas)', type: 'number', value: modulo.cargaHoraria, required: true, attributes: { min: "0" } },
        { name: 'qtdAulas', label: 'Quantidade de Aulas (Previstas)', type: 'number', value: modulo.qtdAulas, required: true, attributes: { min: "0" } }
    ];

    let formHtml = `<form id="modulo-dynamic-form" class="entity-form">`;
    if (isEditMode) {
        formHtml += `<input type="hidden" name="id" value="${modulo.id}">`;
    }
    formFields.forEach(field => {
        formHtml += `
            <div class="form-group">
                <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
                <input type="${field.type || 'text'}"
                       id="${field.name}"
                       name="${field.name}"
                       value="${field.value || ''}"
                       ${field.required ? 'required' : ''}
                       ${field.attributes ? Object.entries(field.attributes).map(([k, v]) => `${k}="${v}"`).join(' ') : ''}>
            </div>
        `;
    });
    formHtml += `<div class="form-group"><button type="submit" class="btn btn-primary">${isEditMode ? 'Atualizar' : 'Criar'} Módulo</button></div></form>`;

    window.openModal(formTitle, formHtml);

    const dynamicForm = document.querySelector('#modulo-dynamic-form');
    if (dynamicForm) {
        dynamicForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            if (data.cargaHoraria) data.cargaHoraria = parseInt(data.cargaHoraria, 10);
            if (data.qtdAulas) data.qtdAulas = parseInt(data.qtdAulas, 10);

            try {
                if (isEditMode) {
                    await window.updateModulo(id, data);
                } else {
                    await window.createModulo(data);
                }
                window.showNotification(`Módulo ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`, 'success');
                document.getElementById('modal').style.display = 'none';

                allModulosCache = []; // CORREÇÃO: Invalida o cache
                await loadModulos(); // Recarrega a lista do zero

            } catch (error) {
                console.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} módulo:`, error);
                window.showNotification(error.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} módulo.`, 'error');
            }
        });
    }
}

async function showAulaForm(aulaId = null, currentModuloId) {
    let aula = { id: '', titulo: '', url: '', duracao: '', ordem: '', moduloId: currentModuloId };
    let formTitle = 'Nova Aula para o Módulo ID: ' + currentModuloId;
    let isEditMode = aulaId !== null;

    if (isEditMode) {
        formTitle = `Editar Aula ID: ${aulaId}`;
        try {
            const fetchedAula = await window.getAulaById(aulaId);
            aula = { ...fetchedAula, moduloId: (fetchedAula.modulo && fetchedAula.modulo.id) || fetchedAula.moduloId || currentModuloId };
        } catch (error) {
            window.showNotification('Erro ao carregar dados da aula para edição.', 'error');
            return;
        }
    }

    const formFields = [
        { name: 'titulo', label: 'Título da Aula', type: 'text', value: aula.titulo, required: true },
        { name: 'url', label: 'URL do Vídeo/Conteúdo', type: 'text', value: aula.url, required: true, placeholder:"https://example.com/video" },
        { name: 'duracao', label: 'Duração (HH:MM:SS)', type: 'text', value: aula.duracao, required: true, placeholder:"00:15:30" },
        { name: 'ordem', label: 'Ordem de Exibição', type: 'number', value: aula.ordem, required: true, attributes: { min: "1" } },
        { name: 'moduloId', type: 'hidden', value: aula.moduloId }
    ];

    let formHtml = `<form id="aula-dynamic-form" class="entity-form">`;
    if (isEditMode) {
        formHtml += `<input type="hidden" name="id" value="${aula.id}">`;
    }
    formFields.forEach(field => {
        formHtml += `
            <div class="form-group">
                <label for="${field.name}">${field.label}${field.required && field.type !== 'hidden' ? ' *' : ''}</label>
                <input type="${field.type || 'text'}"
                       id="${field.name}"
                       name="${field.name}"
                       value="${field.value || ''}"
                       ${field.required ? 'required' : ''}
                       ${field.type === 'hidden' ? 'style="display:none;"' : ''}
                       ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                       ${field.attributes ? Object.entries(field.attributes).map(([k, v]) => `${k}="${v}"`).join(' ') : ''}>
            </div>
        `;
    });
    formHtml += `<div class="form-group"><button type="submit" class="btn btn-primary">${isEditMode ? 'Atualizar' : 'Criar'} Aula</button></div></form>`;

    window.openModal(formTitle, formHtml);

    const dynamicForm = document.querySelector('#aula-dynamic-form');
    if (dynamicForm) {
        dynamicForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            if(data.ordem) data.ordem = parseInt(data.ordem, 10);

            const payload = { ...data };
            if (payload.moduloId && !payload.modulo) {
                payload.modulo = { id: parseInt(payload.moduloId, 10) };
            }

            try {
                if (isEditMode) {
                    await window.updateAula(aulaId, payload);
                } else {
                    await window.createAula(payload);
                }
                window.showNotification(`Aula ${isEditMode ? 'atualizada' : 'criada'} com sucesso!`, 'success');
                document.getElementById('modal').style.display = 'none';
                await loadAulasByModulo(currentModuloId);
            } catch (error) {
                console.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} aula:`, error);
                window.showNotification(error.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} aula.`, 'error');
            }
        });
    }
}
