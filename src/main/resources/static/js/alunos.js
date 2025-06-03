// Cache global para todos os alunos
let allAlunosCache = [];

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadAlunos(); // Carga inicial de todos os alunos
    } catch (error) {
        console.error('Error on initial load of Alunos page:', error);
        window.showNotification('Erro crítico ao carregar a página de alunos.', 'error');
    }

    const btnNewAluno = document.getElementById('btn-new-aluno');
    if (btnNewAluno) {
        btnNewAluno.addEventListener('click', () => showAlunoForm());
    }

    const btnCloseDetails = document.getElementById('btn-close-details');
    if (btnCloseDetails) {
        btnCloseDetails.addEventListener('click', () => {
            const detailsPanel = document.getElementById('aluno-details');
            if (detailsPanel) detailsPanel.style.display = 'none';
        });
    }

    // Listeners para a barra de pesquisa de alunos
    const searchInput = document.getElementById('search-alunos-input');
    const searchButton = document.getElementById('search-alunos-button');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            loadAlunos(searchInput.value.trim());
        });
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadAlunos(searchInput.value.trim());
            }
        });
    }
});

async function loadAlunos(searchTerm = '') {
    const tbody = document.querySelector('#alunos-table tbody');
    if (!tbody) {
        console.error('Alunos table body not found!');
        return;
    }
    tbody.innerHTML = '<tr><td colspan="5">Carregando alunos...</td></tr>';

    try {
        // Se o cache estiver vazio E não for uma pesquisa, busca da API
        if (allAlunosCache.length === 0 && searchTerm === '') {
            allAlunosCache = await window.getAllAlunos(); // Função de api.js
        }

        let alunosToDisplay = allAlunosCache;

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            alunosToDisplay = allAlunosCache.filter(aluno =>
                (aluno.nome && aluno.nome.toLowerCase().includes(lowerSearchTerm)) ||
                (aluno.cpf && aluno.cpf.includes(lowerSearchTerm)) // CPF não precisa de toLowerCase se for só números
            );
        }

        tbody.innerHTML = ''; // Limpa a tabela

        if (!alunosToDisplay || alunosToDisplay.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">${searchTerm ? 'Nenhum aluno encontrado com o termo "' + searchTerm + '".' : 'Nenhum aluno encontrado.'}</td></tr>`;
            return;
        }

        alunosToDisplay.forEach(aluno => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${aluno.id}</td>
                <td>${aluno.nome || 'N/A'}</td>
                <td>${aluno.cpf || 'N/A'}</td>
                <td>${aluno.dataCadastro ? window.formatDate(aluno.dataCadastro) : 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary view-aluno" data-id="${aluno.id}" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-primary edit-aluno" data-id="${aluno.id}" title="Editar Aluno">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-aluno" data-id="${aluno.id}" title="Excluir Aluno">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        attachActionListeners(); // Re-anexa listeners para os botões de ação
    } catch (error) {
        console.error('Error loading alunos:', error);
        tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar alunos.</td></tr>';
        window.showNotification('Erro ao carregar lista de alunos.', 'error');
        if (searchTerm === '') allAlunosCache = []; // Limpa cache apenas se a busca inicial da API falhou
    }
}

function attachActionListeners() { // Renomeado para ser mais genérico se você copiar/colar
    document.querySelectorAll('.view-aluno').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            showAlunoDetails(id);
        });
    });

    document.querySelectorAll('.edit-aluno').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            showAlunoForm(id);
        });
    });

    document.querySelectorAll('.delete-aluno').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            window.confirmDelete('aluno', id, async () => {
                await window.deleteAluno(id);
                allAlunosCache = []; // Invalida o cache após deletar
                await loadAlunos(); // Recarrega a lista (que buscará da API)
            });
        });
    });
}

// Suas funções showAlunoDetails, showAlunoForm, loadMatriculasByAluno, etc., permanecem aqui
// ...
async function showAlunoDetails(id) {
    try {
        const aluno = await window.getAlunoById(id);
        if (!aluno) {
            window.showNotification('Aluno não encontrado.', 'error');
            return;
        }

        document.getElementById('aluno-info').innerHTML = `
            <div class="form-group"><label>ID:</label><p>${aluno.id}</p></div>
            <div class="form-group"><label>Nome:</label><p>${aluno.nome || 'N/A'}</p></div>
            <div class="form-group"><label>CPF:</label><p>${aluno.cpf || 'N/A'}</p></div>
            <div class="form-group"><label>Data de Cadastro:</label><p>${aluno.dataCadastro ? window.formatDate(aluno.dataCadastro) : 'N/A'}</p></div>
        `;

        document.getElementById('aluno-details').style.display = 'block';

        await loadMatriculasByAluno(id);
        await loadAvaliacoesByAluno(id);
        await loadCertificadosByAluno(id);
    } catch (error) {
        console.error(`Error showing aluno details for ID ${id}:`, error);
        window.showNotification('Erro ao carregar detalhes do aluno.', 'error');
    }
}

async function loadMatriculasByAluno(alunoId) {
    const tbody = document.querySelector('#matriculas-table tbody');
    tbody.innerHTML = '<tr><td colspan="5">Carregando matrículas...</td></tr>';
    try {
        const matriculas = await window.getMatriculasByAlunoId(alunoId);

        if (!matriculas || matriculas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhuma matrícula encontrada.</td></tr>';
            return;
        }
        tbody.innerHTML = '';

        for (const matricula of matriculas) {
            let cursoTitulo = 'Carregando...';
            if (matricula.curso && matricula.curso.id) {
                try {
                    const curso = await window.getCursoById(matricula.curso.id);
                    cursoTitulo = curso.titulo || 'Título Indisponível';
                } catch (e) {
                    console.error('Error fetching curso details for matricula:', e);
                    cursoTitulo = 'Erro ao carregar curso';
                }
            } else if (matricula.cursoId) {
                try {
                    const curso = await window.getCursoById(matricula.cursoId);
                    cursoTitulo = curso.titulo || 'Título Indisponível';
                } catch (e) {
                    console.error('Error fetching curso details by cursoId for matricula:', e);
                    cursoTitulo = 'Erro ao carregar curso';
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${matricula.id}</td>
                <td>${cursoTitulo}</td>
                <td>${matricula.dataMatricula ? window.formatDate(matricula.dataMatricula) : 'N/A'}</td>
                <td>${matricula.ativo ? 'Sim' : 'Não'}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-danger delete-matricula" data-id="${matricula.id}" data-aluno-id="${alunoId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        }
        document.querySelectorAll('.delete-matricula').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', async function() {
                const matriculaId = this.getAttribute('data-id');
                const currentAlunoId = this.getAttribute('data-aluno-id');
                window.confirmDelete('matrícula', matriculaId, async () => {
                    await window.deleteMatricula(matriculaId);
                    await loadMatriculasByAluno(currentAlunoId);
                });
            });
        });

    } catch (error) {
        console.error('Error loading matriculas:', error);
        tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar matrículas.</td></tr>';
    }
}

async function loadAvaliacoesByAluno(alunoId) {
    const tbody = document.querySelector('#avaliacoes-table tbody');
    tbody.innerHTML = '<tr><td colspan="5">Carregando avaliações...</td></tr>';
    try {
        const avaliacoes = await window.getAvaliacoesByAlunoId(alunoId);

        if (!avaliacoes || avaliacoes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhuma avaliação encontrada.</td></tr>';
            return;
        }
        tbody.innerHTML = '';

        for (const avaliacao of avaliacoes) {
            let cursoTitulo = 'Carregando...';
            if (avaliacao.curso && avaliacao.curso.id) {
                try {
                    const curso = await window.getCursoById(avaliacao.curso.id);
                    cursoTitulo = curso.titulo || 'Título Indisponível';
                } catch (e) {
                    cursoTitulo = 'Erro ao carregar curso';
                }
            } else if (avaliacao.cursoId) {
                try {
                    const curso = await window.getCursoById(avaliacao.cursoId);
                    cursoTitulo = curso.titulo || 'Título Indisponível';
                } catch (e) {
                    cursoTitulo = 'Erro ao carregar curso';
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${avaliacao.id}</td>
                <td>${cursoTitulo}</td>
                <td>${avaliacao.nota !== null ? avaliacao.nota : 'N/A'}</td>
                <td>${avaliacao.feedback || 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-danger delete-avaliacao" data-id="${avaliacao.id}" data-aluno-id="${alunoId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        }
        document.querySelectorAll('.delete-avaliacao').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', async function() {
                const avaliacaoId = this.getAttribute('data-id');
                const currentAlunoId = this.getAttribute('data-aluno-id');
                window.confirmDelete('avaliação', avaliacaoId, async () => {
                    await window.deleteAvaliacao(avaliacaoId);
                    await loadAvaliacoesByAluno(currentAlunoId);
                });
            });
        });

    } catch (error) {
        console.error('Error loading avaliacoes:', error);
        tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar avaliações.</td></tr>';
    }
}

async function loadCertificadosByAluno(alunoId) {
    const tbody = document.querySelector('#certificados-table tbody');
    tbody.innerHTML = '<tr><td colspan="4">Carregando certificados...</td></tr>';
    try {
        const certificados = await window.getCertificadosByAlunoId(alunoId);

        if (!certificados || certificados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">Nenhum certificado encontrado.</td></tr>';
            return;
        }
        tbody.innerHTML = '';

        for (const certificado of certificados) {
            let cursoTitulo = 'Carregando...';
            if (certificado.curso && certificado.curso.id) {
                try {
                    const curso = await window.getCursoById(certificado.curso.id);
                    cursoTitulo = curso.titulo || 'Título Indisponível';
                } catch(e) {
                    cursoTitulo = 'Erro ao carregar curso';
                }
            } else if (certificado.cursoId) {
                try {
                    const curso = await window.getCursoById(certificado.cursoId);
                    cursoTitulo = curso.titulo || 'Título Indisponível';
                } catch(e) {
                    cursoTitulo = 'Erro ao carregar curso';
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${certificado.id}</td>
                <td>${cursoTitulo}</td>
                <td>${certificado.dataConclusao ? window.formatDate(certificado.dataConclusao) : 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-danger delete-certificado" data-id="${certificado.id}" data-aluno-id="${alunoId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        }
        document.querySelectorAll('.delete-certificado').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', async function() {
                const certificadoId = this.getAttribute('data-id');
                const currentAlunoId = this.getAttribute('data-aluno-id');
                window.confirmDelete('certificado', certificadoId, async () => {
                    await window.deleteCertificado(certificadoId);
                    await loadCertificadosByAluno(currentAlunoId);
                });
            });
        });
    } catch (error) {
        console.error('Error loading certificados:', error);
        tbody.innerHTML = '<tr><td colspan="4">Erro ao carregar certificados.</td></tr>';
    }
}

async function showAlunoForm(id = null) {
    let aluno = { id: '', nome: '', cpf: '', senha: '' };
    let formTitle = 'Novo Aluno';
    let isEditMode = id !== null;

    if (isEditMode) {
        formTitle = 'Editar Aluno';
        try {
            aluno = await window.getAlunoById(id);
        } catch (error) {
            window.showNotification('Erro ao carregar dados do aluno para edição.', 'error');
            return;
        }
    }

    const formFields = [
        { name: 'nome', label: 'Nome Completo', type: 'text', value: aluno.nome, required: true },
        { name: 'cpf', label: 'CPF (somente números)', type: 'text', value: aluno.cpf, required: true, attributes: { pattern: "\\d{11}", title: "CPF deve conter 11 dígitos numéricos." } },
        { name: 'senha', label: 'Senha', type: 'password', value: '', required: !isEditMode, placeholder: isEditMode ? 'Deixe em branco para não alterar' : '' }
    ];

    let formHtml = `<form id="aluno-dynamic-form" class="entity-form">`;
    if(isEditMode) {
        formHtml += `<input type="hidden" name="id" value="${aluno.id}">`;
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
                       ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                       ${field.attributes ? Object.entries(field.attributes).map(([k, v]) => `${k}="${v}"`).join(' ') : ''}>
            </div>
        `;
    });
    formHtml += `<div class="form-group"><button type="submit" class="btn btn-primary">${isEditMode ? 'Atualizar' : 'Criar'} Aluno</button></div></form>`;

    window.openModal(formTitle, formHtml);

    const dynamicForm = document.querySelector('#aluno-dynamic-form');
    if (dynamicForm) {
        dynamicForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            if (data.cpf) {
                data.cpf = data.cpf.replace(/\D/g, '');
            }

            if (isEditMode && (!data.senha || data.senha.trim() === '')) {
                delete data.senha;
            }

            try {
                if (isEditMode) {
                    await window.updateAluno(id, data);
                } else {
                    await window.createAluno(data);
                }
                window.showNotification(`Aluno ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`, 'success');
                document.getElementById('modal').style.display = 'none';
                allAlunosCache = []; // Invalida o cache
                await loadAlunos();
            } catch (error) {
                console.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} aluno:`, error);
                let errorMessage = `Erro ao ${isEditMode ? 'atualizar' : 'criar'} aluno.`;
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage += ` Detalhe: ${error.response.data.message}`;
                } else if (error.message) {
                    errorMessage += ` Detalhe: ${error.message}`;
                }
                window.showNotification(errorMessage, 'error');
            }
        });
    }
}