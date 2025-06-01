// Base URL for API
const API_BASE_URL = 'http://localhost:8080';

// API endpoints
const API = {
    alunos: `${API_BASE_URL}/api/alunos`,
    aulas: `${API_BASE_URL}/api/aulas`,
    avaliacoes: `${API_BASE_URL}/api/avaliacoes`,
    certificados: `${API_BASE_URL}/api/certificados`,
    cursos: `${API_BASE_URL}/api/cursos`,
    instrutores: `${API_BASE_URL}/api/instrutores`,
    matriculas: `${API_BASE_URL}/api/matriculas`,
    modulos: `${API_BASE_URL}/api/modulos`,
    relationships: `${API_BASE_URL}/api/relationships`
};

// Function to show notifications (placeholder)
function _internalShowNotification(message, type) { // Renamed to avoid conflict if already on window
    console.log(`Notification (${type}): ${message}`);
    // In a real app, you'd have a proper UI notification system here
    // For now, we'll ensure the one from utils.js is used if available, or this fallback.
    if (typeof window.showNotification === 'function' && window.showNotification !== _internalShowNotification) {
        window.showNotification(message, type);
    }
}

// Generic API functions
async function fetchAPI(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            let errorData = { message: `HTTP error! Status: ${response.status}` };
            try {
                // Try to parse error response from backend if it's JSON
                const backendError = await response.json();
                if (backendError && backendError.message) {
                    errorData.message = backendError.message;
                } else if (typeof backendError === 'string') {
                    errorData.message = backendError;
                }
            } catch (e) {
                // If error response is not JSON, use the status text
                errorData.message = `HTTP error! Status: ${response.status} - ${response.statusText}`;
            }
            throw new Error(errorData.message);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return null; // For 204 No Content or non-JSON responses
    } catch (error) {
        console.error('API Error in fetchAPI:', error);
        _internalShowNotification(error.message, 'error'); // Use internal or existing window.showNotification
        throw error; // Re-throw for the calling function to handle UI updates
    }
}

// Generic CRUD operations
async function _getAll(endpoint) {
    return await fetchAPI(`${endpoint}`);
}

async function _getById(endpoint, id) {
    return await fetchAPI(`${endpoint}/${id}`);
}

async function _create(endpoint, data) {
    return await fetchAPI(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async function _update(endpoint, id, data) {
    return await fetchAPI(`${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async function _remove(endpoint, id) {
    return await fetchAPI(`${endpoint}/${id}`, {
        method: 'DELETE'
    });
}

// --- Alunos ---
async function getAllAlunos_internal() { return await _getAll(API.alunos); }
async function getAlunoById_internal(id) { return await _getById(API.alunos, id); }
async function createAluno_internal(aluno) { return await _create(API.alunos, aluno); }
async function updateAluno_internal(id, aluno) { return await _update(API.alunos, id, aluno); }
async function deleteAluno_internal(id) { return await _remove(API.alunos, id); }

// --- Aulas ---
async function getAllAulas_internal() { return await _getAll(API.aulas); }
async function getAulaById_internal(id) { return await _getById(API.aulas, id); }
async function getAulasByModuloId_internal(moduloId) { return await fetchAPI(`${API.aulas}/modulo/${moduloId}`); }
async function createAula_internal(aula) { return await _create(API.aulas, aula); }
async function updateAula_internal(id, aula) { return await _update(API.aulas, id, aula); }
async function deleteAula_internal(id) { return await _remove(API.aulas, id); }

// --- Avaliações ---
async function getAllAvaliacoes_internal() { return await _getAll(API.avaliacoes); }
async function getAvaliacaoById_internal(id) { return await _getById(API.avaliacoes, id); }
async function getAvaliacoesByAlunoId_internal(alunoId) { return await fetchAPI(`${API.avaliacoes}/aluno/${alunoId}`); } // Name matches expectation
async function createAvaliacao_internal(avaliacao) { return await _create(API.avaliacoes, avaliacao); }
async function deleteAvaliacao_internal(id) { return await _remove(API.avaliacoes, id); }

// --- Certificados ---
async function getAllCertificados_internal() { return await _getAll(API.certificados); }
async function getCertificadoById_internal(id) { return await _getById(API.certificados, id); }
async function getCertificadosByAlunoId_internal(alunoId) { return await fetchAPI(`${API.certificados}/aluno/${alunoId}`); } // Name matches expectation
async function createCertificado_internal(certificado) { return await _create(API.certificados, certificado); }
async function deleteCertificado_internal(id) { return await _remove(API.certificados, id); }

// --- Cursos ---
async function getAllCursos_internal() { return await _getAll(API.cursos); }
async function getCursoById_internal(id) { return await _getById(API.cursos, id); }
async function createCurso_internal(curso) { return await _create(API.cursos, curso); }
async function updateCurso_internal(id, curso) { return await _update(API.cursos, id, curso); }
async function deleteCurso_internal(id) { return await _remove(API.cursos, id); }

// --- Instrutores ---
async function getAllInstrutores_internal() { return await _getAll(API.instrutores); }
async function getInstrutorById_internal(id) { return await _getById(API.instrutores, id); }
async function createInstrutor_internal(instrutor) { return await _create(API.instrutores, instrutor); }
async function updateInstrutor_internal(id, instrutor) { return await _update(API.instrutores, id, instrutor); }
async function deleteInstrutor_internal(id) { return await _remove(API.instrutores, id); }

// --- Matrículas ---
async function getAllMatriculas_internal() { return await _getAll(API.matriculas); }
async function getMatriculaById_internal(id) { return await _getById(API.matriculas, id); }
async function getMatriculasByAlunoId_internal(alunoId) { return await fetchAPI(`${API.matriculas}/aluno/${alunoId}`); } // Name matches expectation
async function getMatriculasByCursoId_internal(cursoId) { return await fetchAPI(`${API.matriculas}/curso/${cursoId}`); }
async function createMatricula_internal(matricula) { return await _create(API.matriculas, matricula); }
async function updateMatricula_internal(id, matricula) { return await _update(API.matriculas, id, matricula); }
async function deleteMatricula_internal(id) { return await _remove(API.matriculas, id); }

// --- Módulos ---
async function getAllModulos_internal() { return await _getAll(API.modulos); }
async function getModuloById_internal(id) { return await _getById(API.modulos, id); }
async function createModulo_internal(modulo) { return await _create(API.modulos, modulo); }
async function updateModulo_internal(id, modulo) { return await _update(API.modulos, id, modulo); }
async function deleteModulo_internal(id) { return await _remove(API.modulos, id); }

// --- Relationships ---
// Curso-Instrutor
async function vincularInstrutorCurso_internal(cursoId, instrutorId) { return await fetchAPI(`${API.relationships}/curso/${cursoId}/instrutor/${instrutorId}`, { method: 'POST' }); }
async function removerVinculoInstrutorCurso_internal(cursoId, instrutorId) { return await fetchAPI(`${API.relationships}/curso/${cursoId}/instrutor/${instrutorId}`, { method: 'DELETE' }); }
async function getInstrutoresByCursoId_internal(cursoId) { return await fetchAPI(`${API.relationships}/curso/${cursoId}/instrutores`); } // Name matches expectation
async function getCursosByInstrutorId_internal(instrutorId) { return await fetchAPI(`${API.relationships}/instrutor/${instrutorId}/cursos`); } // Name matches expectation

// Curso-Módulo
async function vincularModuloCurso_internal(cursoId, moduloId) { return await fetchAPI(`${API.relationships}/curso/${cursoId}/modulo/${moduloId}`, { method: 'POST' }); }
async function removerVinculoModuloCurso_internal(cursoId, moduloId) { return await fetchAPI(`${API.relationships}/curso/${cursoId}/modulo/${moduloId}`, { method: 'DELETE' }); }
async function getModulosByCursoId_internal(cursoId) { return await fetchAPI(`${API.relationships}/curso/${cursoId}/modulos`); } // Name matches expectation
async function getCursosByModuloId_internal(moduloId) { return await fetchAPI(`${API.relationships}/modulo/${moduloId}/cursos`); } // Name matches expectation


// --- Expose functions to the global window object ---
// This makes them callable as window.functionName() or just functionName() in other scripts like alunos.js,
// provided api.js is loaded before them.

// Alunos
window.getAllAlunos = getAllAlunos_internal;
window.getAlunoById = getAlunoById_internal;
window.createAluno = createAluno_internal;
window.updateAluno = updateAluno_internal;
window.deleteAluno = deleteAluno_internal;

// Aulas
window.getAllAulas = getAllAulas_internal;
window.getAulaById = getAulaById_internal;
window.getAulasByModuloId = getAulasByModuloId_internal; // Exposed with 'Id'
window.createAula = createAula_internal;
window.updateAula = updateAula_internal;
window.deleteAula = deleteAula_internal;

// Avaliações
window.getAllAvaliacoes = getAllAvaliacoes_internal;
window.getAvaliacaoById = getAvaliacaoById_internal;
window.getAvaliacoesByAlunoId = getAvaliacoesByAlunoId_internal; // Exposed with 'Id'
window.createAvaliacao = createAvaliacao_internal;
window.deleteAvaliacao = deleteAvaliacao_internal;

// Certificados
window.getAllCertificados = getAllCertificados_internal;
window.getCertificadoById = getCertificadoById_internal;
window.getCertificadosByAlunoId = getCertificadosByAlunoId_internal; // Exposed with 'Id'
window.createCertificado = createCertificado_internal;
window.deleteCertificado = deleteCertificado_internal;

// Cursos
window.getAllCursos = getAllCursos_internal;
window.getCursoById = getCursoById_internal;
window.createCurso = createCurso_internal;
window.updateCurso = updateCurso_internal;
window.deleteCurso = deleteCurso_internal;

// Instrutores
window.getAllInstrutores = getAllInstrutores_internal;
window.getInstrutorById = getInstrutorById_internal;
window.createInstrutor = createInstrutor_internal;
window.updateInstrutor = updateInstrutor_internal;
window.deleteInstrutor = deleteInstrutor_internal;

// Matrículas
window.getAllMatriculas = getAllMatriculas_internal;
window.getMatriculaById = getMatriculaById_internal;
window.getMatriculasByAlunoId = getMatriculasByAlunoId_internal; // Exposed with 'Id'
window.getMatriculasByCursoId = getMatriculasByCursoId_internal; // Exposed with 'Id'
window.createMatricula = createMatricula_internal;
window.updateMatricula = updateMatricula_internal;
window.deleteMatricula = deleteMatricula_internal;

// Módulos
window.getAllModulos = getAllModulos_internal;
window.getModuloById = getModuloById_internal;
window.createModulo = createModulo_internal;
window.updateModulo = updateModulo_internal;
window.deleteModulo = deleteModulo_internal;

// Relationships
window.vincularInstrutorCurso = vincularInstrutorCurso_internal;
window.removerVinculoInstrutorCurso = removerVinculoInstrutorCurso_internal;
window.getInstrutoresByCursoId = getInstrutoresByCursoId_internal; // Exposed with 'Id'
window.getCursosByInstrutorId = getCursosByInstrutorId_internal; // Exposed with 'Id'

window.vincularModuloCurso = vincularModuloCurso_internal;
window.removerVinculoModuloCurso = removerVinculoModuloCurso_internal;
window.getModulosByCursoId = getModulosByCursoId_internal; // Exposed with 'Id'
window.getCursosByModuloId = getCursosByModuloId_internal; // Exposed with 'Id'