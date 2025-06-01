function showNotification(message, type) {
    // Implement showNotification function
    console.log(`Notification: ${message} (Type: ${type})`);
}

async function getAllAlunos() {
    // Implement getAllAlunos function
    const response = await fetch(`${API_BASE_URL}/api/alunos`);
    if (response.ok) {
        return await response.json();
    } else {
        throw new Error('Failed to fetch alunos');
    }
}

async function getAllCursos() {
    // Implement getAllCursos function
    const response = await fetch(`${API_BASE_URL}/api/cursos`);
    if (response.ok) {
        return await response.json();
    } else {
        throw new Error('Failed to fetch cursos');
    }
}

async function getAllInstrutores() {
    // Implement getAllInstrutores function
    const response = await fetch(`${API_BASE_URL}/api/instrutores`);
    if (response.ok) {
        return await response.json();
    } else {
        throw new Error('Failed to fetch instrutores');
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load dashboard statistics
        loadDashboardStats();

        // Load recent courses
        loadRecentCourses();

        // Load recent students
        loadRecentStudents();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Erro ao carregar o dashboard', 'error');
    }
});

async function loadDashboardStats() {
    try {
        // Get counts
        const alunos = await getAllAlunos();
        const cursos = await getAllCursos();
        const instrutores = await getAllInstrutores();
        const matriculas = (typeof window.getAllMatriculas === 'function') ? await window.getAllMatriculas() : [];
        const avaliacoes = (typeof window.getAllAvaliacoes === 'function') ? await window.getAllAvaliacoes() : [];

        // Update DOM
        document.getElementById('total-alunos').textContent = alunos.length;
        document.getElementById('total-cursos').textContent = cursos.length;
        document.getElementById('total-instrutores').textContent = instrutores.length;
        document.getElementById('total-matriculas').textContent = matriculas ? matriculas.length : '0';
        document.getElementById('total-avaliacoes').textContent = avaliacoes ? avaliacoes.length : '0';

        // For matriculas, we need to make a separate call
        try {
            const response = await fetch(`${API_BASE_URL}/api/matriculas`);
            if (response.ok) {
                const matriculas = await response.json();
                document.getElementById('total-matriculas').textContent = matriculas.length;
            } else {
                document.getElementById('total-matriculas').textContent = '0';
            }
        } catch (error) {
            document.getElementById('total-matriculas').textContent = '0';
        }
    } catch (error) {
        console.error('Error loading stats:', error);

        // Set default values if error
        document.getElementById('total-alunos').textContent = '0';
        document.getElementById('total-cursos').textContent = '0';
        document.getElementById('total-instrutores').textContent = '0';
        document.getElementById('total-matriculas').textContent = '0';
    }
}

async function loadRecentCourses() {
    try {
        const cursos = await getAllCursos(); // Esta função já está no seu dashboard.js
        // Pega os 5 mais recentes. Se a ordem de "recente" for por ID decrescente,
        // você precisaria ordenar 'cursos' antes do slice, ou seu backend
        // precisaria retornar os mais recentes primeiro.
        // Por enquanto, vamos assumir que a ordem atual da API é aceitável ou que os primeiros 5 são "recentes".
        const recentCursos = cursos.slice(0, 5);

        const tbody = document.querySelector('#recent-cursos tbody');
        tbody.innerHTML = '';

        if (recentCursos.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="2">Nenhum curso encontrado</td>';
            tbody.appendChild(tr);
            return;
        }

        recentCursos.forEach(curso => {
            const tr = document.createElement('tr');
            // Use curso.titulo para o nome
            // Para descrição, podemos combinar cargaHoraria e status
            const descricaoCurso = `CH: ${curso.cargaHoraria || 'N/A'}h - Status: ${curso.status || 'N/A'}`;
            tr.innerHTML = `
                <td>${curso.titulo}</td> 
                <td>${descricaoCurso}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading recent courses:', error);
        const tbody = document.querySelector('#recent-cursos tbody');
        if (tbody) { // Adicionar verificação para tbody
            tbody.innerHTML = '<tr><td colspan="2">Erro ao carregar cursos recentes.</td></tr>';
        }
    }
}

async function loadRecentStudents() {
    try {
        const alunos = await getAllAlunos();
        const recentAlunos = alunos.slice(0, 5); // Get only 5 most recent

        const tbody = document.querySelector('#recent-alunos tbody');
        tbody.innerHTML = '';

        if (recentAlunos.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="2">Nenhum aluno encontrado</td>';
            tbody.appendChild(tr);
            return;
        }

        recentAlunos.forEach(aluno => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${aluno.nome}</td>
                <td>${aluno.cpf}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading recent students:', error);
        const tbody = document.querySelector('#recent-alunos tbody');
        tbody.innerHTML = '<tr><td colspan="2">Erro ao carregar alunos</td></tr>';
    }
}

async function loadRecentEvaluations() {
    const tbody = document.querySelector('#recent-avaliacoes tbody');
    tbody.innerHTML = '<tr><td colspan="3">Carregando...</td></tr>';
    try {
        const avaliacoes = await window.getAllAvaliacoes(); // Use de api.js
        const recentAvaliacoes = avaliacoes ? avaliacoes.slice(0, 5) : [];

        tbody.innerHTML = '';
        if (recentAvaliacoes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">Nenhuma avaliação encontrada</td></tr>';
            return;
        }
        for (const avaliacao of recentAvaliacoes) {
            const aluno = avaliacao.aluno ? await window.getAlunoById(avaliacao.aluno.id) : null;
            const curso = avaliacao.curso ? await window.getCursoById(avaliacao.curso.id) : null;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${aluno?.nome || 'N/A'}</td>
                <td>${curso?.titulo || 'N/A'}</td>
                <td>${avaliacao.nota !== null ? avaliacao.nota : 'N/A'}</td>
            `;
            tbody.appendChild(tr);
        }
    } catch (error) {
        console.error('Error loading recent evaluations:', error);
        tbody.innerHTML = '<tr><td colspan="3">Erro ao carregar avaliações</td></tr>';
    }
}

async function loadRecentInstructors() {
    const tbody = document.querySelector('#recent-instrutores tbody');
    tbody.innerHTML = '<tr><td colspan="2">Carregando...</td></tr>';
    try {
        const instrutores = await window.getAllInstrutores(); // Use de api.js
        const recentInstructores = instrutores ? instrutores.slice(0, 5) : [];

        tbody.innerHTML = '';
        if (recentInstructores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2">Nenhum instrutor encontrado</td></tr>';
            return;
        }
        recentInstructores.forEach(instrutor => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${instrutor.nome || 'N/A'}</td>
                <td>${instrutor.cpf || 'N/A'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading recent instructors:', error);
        tbody.innerHTML = '<tr><td colspan="2">Erro ao carregar instrutores</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        loadDashboardStats();
        loadRecentCourses();
        loadRecentEvaluations();
        loadRecentStudents();
        loadRecentInstructors();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        if (window.showNotification) {
            window.showNotification('Erro ao carregar o dashboard', 'error');
        } else {
            console.log('Notification: Erro ao carregar o dashboard (Type: error)');
        }
    }
});
