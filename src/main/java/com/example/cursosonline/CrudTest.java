package com.example.cursosonline;

import com.example.cursosonline.DAO.AlunoDAO;
import com.example.cursosonline.Domain.Aluno;

import java.util.Date;
import java.util.List;
import java.util.Random;

public class CrudTest {

    public static void main(String[] args) {
        AlunoDAO alunoDAO = new AlunoDAO();
        Random random = new Random();

        System.out.println("--- INICIANDO TESTES CRUD PARA ALUNO ---");

        // --- 1. CREATE (Criar Aluno) ---
        System.out.println("\n--- Testando CREATE ---");
        Aluno novoAluno = new Aluno();
        String cpfUnico = "000111222" + String.format("%02d", random.nextInt(100));
        novoAluno.setNome("Carlos Alberto " + cpfUnico.substring(cpfUnico.length() - 2));
        novoAluno.setCpf(cpfUnico);
        novoAluno.setSenha("senhaDoCarlos");
        novoAluno.setDataCadastro(new Date());

        alunoDAO.save(novoAluno);
        if (novoAluno.getId() != null) {
            System.out.println("Aluno criado com sucesso! ID: " + novoAluno.getId() + ", Nome: " + novoAluno.getNome());
        } else {
            System.out.println("Falha ao criar aluno. Verifique os logs do AlunoDAO.");
            return;
        }

        // --- 2. READ (Ler Aluno) ---
        // 2.1. Buscar por ID
        System.out.println("\n--- Testando READ (findById) ---");
        Aluno alunoBuscado = alunoDAO.findById(novoAluno.getId());
        if (alunoBuscado != null) {
            System.out.println("Aluno encontrado por ID: " + alunoBuscado.getId() + " - Nome: " + alunoBuscado.getNome() + " - CPF: " + alunoBuscado.getCpf());
        } else {
            System.out.println("Aluno com ID " + novoAluno.getId() + " não encontrado.");
        }

        // 2.2. Listar Todos os Alunos
        System.out.println("\n--- Testando READ (findAll) ---");
        List<Aluno> todosAlunos = alunoDAO.findAll();
        if (todosAlunos != null && !todosAlunos.isEmpty()) {
            System.out.println("Total de alunos encontrados: " + todosAlunos.size());
            for (Aluno a : todosAlunos) {
                System.out.println("ID: " + a.getId() + " | Nome: " + a.getNome() + " | CPF: " + a.getCpf() + " | Data Cadastro: " + a.getDataCadastro());
            }
        } else {
            System.out.println("Nenhum aluno encontrado ou lista vazia.");
        }

        // --- 3. UPDATE (Atualizar Aluno) ---
        System.out.println("\n--- Testando UPDATE ---");
        if (alunoBuscado != null) {
            String nomeAntigo = alunoBuscado.getNome();
            alunoBuscado.setNome("Carlos Alberto Nobrega");
            alunoBuscado.setSenha("novaSenha123");

            alunoDAO.update(alunoBuscado);

            // Verifica se a atualização foi bem-sucedida buscando novamente
            Aluno alunoAtualizado = alunoDAO.findById(alunoBuscado.getId());
            if (alunoAtualizado != null && alunoAtualizado.getNome().equals("Carlos Alberto Nobrega")) {
                System.out.println("Aluno atualizado com sucesso! ID: " + alunoAtualizado.getId() + " - Nome Antigo: " + nomeAntigo + " -> Novo Nome: " + alunoAtualizado.getNome());
            } else {
                System.out.println("Falha ao atualizar aluno ou nome não modificado como esperado. ID: " + alunoBuscado.getId());
            }
        } else {
            System.out.println("Não foi possível testar o UPDATE pois o alunoBuscado é nulo.");
        }

        // --- 4. DELETE (Deletar Aluno) ---
        System.out.println("\n--- Testando DELETE ---");
        if (novoAluno.getId() != null) {
            Long idParaDeletar = novoAluno.getId();
            String nomeAlunoDeletado = novoAluno.getNome();

            alunoDAO.delete(idParaDeletar);

            // Tenta buscar o aluno deletado para confirmar a exclusão
            Aluno alunoDeletado = alunoDAO.findById(idParaDeletar);
            if (alunoDeletado == null) {
                System.out.println("Aluno '" + nomeAlunoDeletado + "' (ID: " + idParaDeletar + ") deletado com sucesso!");
            } else {
                System.out.println("Falha ao deletar aluno. ID: " + idParaDeletar + " ainda encontrado no banco.");
            }
        } else {
            System.out.println("Não foi possível testar o DELETE pois o ID do novoAluno é nulo.");
        }

        System.out.println("\n--- FIM DOS TESTES CRUD PARA ALUNO ---");
    }
}