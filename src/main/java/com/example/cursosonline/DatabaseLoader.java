package com.example.cursosonline;

import com.example.cursosonline.DAO.*;
import com.example.cursosonline.Domain.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Random;

public class DatabaseLoader {
    public static void main(String[] args) {
        // DAOs
        AlunoDAO alunoDAO = new AlunoDAO();
        InstrutorDAO instrutorDAO = new InstrutorDAO();
        ModuloDAO moduloDAO = new ModuloDAO();
        CursoDAO cursoDAO = new CursoDAO();
        MatriculaDAO matriculaDAO = new MatriculaDAO();
        CertificadoDAO certificadoDAO = new CertificadoDAO();
        AvaliacaoDAO avaliacaoDAO = new AvaliacaoDAO();
        AulaDAO aulaDAO = new AulaDAO();
        CursoInstrutorDAO cursoInstrutorDAO = new CursoInstrutorDAO();
        CursoModuloDAO cursoModuloDAO = new CursoModuloDAO();

        Random random = new Random();

        System.out.println("==== INSERINDO 3 EXEMPLOS DE DADOS COM NOMES REAIS ====");

        // Listas para armazenar os objetos criados
        List<Aluno> alunosCriados = new ArrayList<>();
        List<Instrutor> instrutoresCriados = new ArrayList<>();
        List<Modulo> modulosCriados = new ArrayList<>();
        List<Curso> cursosCriados = new ArrayList<>();
        // List<Aula> aulasCriadas = new ArrayList<>(); // Menos crucial ter a lista global de aulas aqui

        // ===================== 3 ALUNOS =====================
        System.out.println("\n--- Criando Alunos ---");
        String[] nomesAlunos = {"Ana Carolina Lima", "Bruno Costa Alves", "Camila Fernandes Dias"};
        String[] cpfsAlunos = {"11122233301", "11122233302", "11122233303"};
        for (int i = 0; i < 3; i++) {
            Aluno aluno = new Aluno();
            aluno.setNome(nomesAlunos[i]);
            aluno.setCpf(cpfsAlunos[i]);
            aluno.setSenha("senha" + (i + 1) + nomesAlunos[i].substring(0, 3).toLowerCase());
            aluno.setDataCadastro(new Date());
            alunoDAO.save(aluno);
            alunosCriados.add(aluno);
            System.out.println("Aluno salvo: " + aluno.getNome() + " (ID: " + aluno.getId() + ")");
        }

        // ===================== 3 INSTRUTORES =====================
        System.out.println("\n--- Criando Instrutores ---");
        String[] nomesInstrutores = {"Prof. Dr. Ricardo Oliveira", "Ms. Sofia Albuquerque", "Esp. Tiago Mendes"};
        String[] cpfsInstrutores = {"44455566601", "44455566602", "44455566603"};
        for (int i = 0; i < 3; i++) {
            Instrutor instrutor = new Instrutor();
            instrutor.setNome(nomesInstrutores[i]);
            instrutor.setCpf(cpfsInstrutores[i]);
            instrutor.setSenha("instrutor" + (i + 1) + nomesInstrutores[i].split(" ")[2].toLowerCase());
            instrutor.setDataCadastro(new Date());
            instrutorDAO.save(instrutor);
            instrutoresCriados.add(instrutor);
            System.out.println("Instrutor salvo: " + instrutor.getNome() + " (ID: " + instrutor.getId() + ")");
        }

        // ===================== 3 MÓDULOS =====================
        System.out.println("\n--- Criando Módulos ---");
        String[] conteudosModulos = {
                "Introdução à Programação Orientada a Objetos",
                "Desenvolvimento Web Frontend com React",
                "Gerenciamento Ágil de Projetos com Scrum"
        };
        for (int i = 0; i < 3; i++) {
            Modulo modulo = new Modulo();
            modulo.setConteudo(conteudosModulos[i]);
            modulo.setCargaHoraria(8 + (i * 2)); // Ex: 8h, 10h, 12h
            modulo.setQtdAulas(4 + i);    // Ex: 4, 5, 6 aulas
            moduloDAO.save(modulo);
            modulosCriados.add(modulo);
            System.out.println("Módulo salvo: " + modulo.getConteudo() + " (ID: " + modulo.getId() + ")");
        }

        // ===================== 3 CURSOS =====================
        System.out.println("\n--- Criando Cursos ---");
        String[] titulosCursos = {"Fundamentos de Java", "React: Do Básico ao Avançado", "Metodologias Ágeis na Prática"};
        String[] statusCursos = {"Ativo", "Em Breve", "Ativo"};
        for (int i = 0; i < 3; i++) {
            Curso curso = new Curso();
            curso.setTitulo(titulosCursos[i]);
            curso.setCargaHoraria(30 + (i * 10)); // Ex: 30h, 40h, 50h
            curso.setStatus(statusCursos[i]);
            cursoDAO.save(curso);
            cursosCriados.add(curso);
            System.out.println("Curso salvo: " + curso.getTitulo() + " (ID: " + curso.getId() + ")");
        }

        // ===================== AULAS PARA CADA MÓDULO =====================
        // Criar 2 aulas para cada um dos 3 módulos (total 6 aulas)
        System.out.println("\n--- Criando Aulas ---");
        String[][] titulosAulas = {
                {"O que é POO?", "Classes e Objetos em Java"},
                {"Introdução ao React e JSX", "Componentes e Props"},
                {"Princípios do Manifesto Ágil", "O Framework Scrum"}
        };
        int aulaGlobalCounter = 1;
        for (int i = 0; i < modulosCriados.size(); i++) {
            Modulo modulo = modulosCriados.get(i);
            for (int j = 0; j < 2; j++) { // 2 aulas por módulo
                Aula aula = new Aula();
                aula.setTitulo(titulosAulas[i][j]);
                aula.setDuracao(String.format("00:%02d:%02d", 20 + random.nextInt(25), random.nextInt(60)));
                aula.setOrdem(j + 1);
                aula.setUrl("http://cursos.online/video/" + modulo.getId() + "/aula" + aulaGlobalCounter);
                aula.setModulo(modulo);
                aulaDAO.save(aula);
                // aulasCriadas.add(aula); // Adicionar se precisar da lista global
                System.out.println("Aula salva: " + aula.getTitulo() + " (ID: " + aula.getId() + ", Módulo ID: " + modulo.getId() +")");
                aulaGlobalCounter++;
            }
        }

        // ===================== ASSOCIAÇÕES CURSO-INSTRUTOR E CURSO-MÓDULO =====================
        System.out.println("\n--- Associando Cursos com Instrutores e Módulos ---");
        // Vincular cada curso a um instrutor e a um módulo
        for (int i = 0; i < cursosCriados.size(); i++) {
            Curso curso = cursosCriados.get(i);
            Instrutor instrutor = instrutoresCriados.get(i);
            Modulo modulo = modulosCriados.get(i);

            cursoInstrutorDAO.save(curso.getId(), instrutor.getId());
            System.out.println("Vinculado Curso '" + curso.getTitulo() + "' (ID " + curso.getId() + ") com Instrutor '" + instrutor.getNome() + "' (ID " + instrutor.getId() + ")");

            cursoModuloDAO.save(curso.getId(), modulo.getId());
            System.out.println("Vinculado Curso '" + curso.getTitulo() + "' (ID " + curso.getId() + ") com Módulo '" + modulo.getConteudo() + "' (ID " + modulo.getId() + ")");
        }
        // Exemplo: Vincular um segundo módulo ao primeiro curso, se houver módulos suficientes
        if (cursosCriados.size() > 0 && modulosCriados.size() > 1 && modulosCriados.get(0).getId() != modulosCriados.get(1).getId()) {
            cursoModuloDAO.save(cursosCriados.get(0).getId(), modulosCriados.get(1).getId());
            System.out.println("Vinculado Curso '" + cursosCriados.get(0).getTitulo() + "' (ID " + cursosCriados.get(0).getId() + ") com Módulo adicional '" + modulosCriados.get(1).getConteudo() + "' (ID " + modulosCriados.get(1).getId() + ")");
        }


        // ===================== 3 MATRÍCULAS =====================
        System.out.println("\n--- Criando Matrículas ---");
        for (int i = 0; i < alunosCriados.size(); i++) {
            Matricula matricula = new Matricula();
            Aluno aluno = alunosCriados.get(i);
            Curso curso = cursosCriados.get(i); // Cada aluno se matricula em um curso diferente

            matricula.setAluno(aluno);
            matricula.setCurso(curso);
            matricula.setDataMatricula(new Date());
            matricula.setAtivo((i % 2 == 0)); // Alterna status ativo
            matriculaDAO.save(matricula);
            System.out.println("Matrícula salva: Aluno '" + aluno.getNome() + "' no Curso '" + curso.getTitulo() + "' (ID Matrícula: " + matricula.getId() + ")");
        }
        // Matricular o primeiro aluno em um segundo curso, se houver
        if (alunosCriados.size() > 0 && cursosCriados.size() > 1) {
            Matricula matriculaExtra = new Matricula();
            matriculaExtra.setAluno(alunosCriados.get(0));
            matriculaExtra.setCurso(cursosCriados.get(1));
            matriculaExtra.setDataMatricula(new Date());
            matriculaExtra.setAtivo(true);
            matriculaDAO.save(matriculaExtra);
            System.out.println("Matrícula extra salva: Aluno '" + alunosCriados.get(0).getNome() + "' no Curso '" + cursosCriados.get(1).getTitulo() + "' (ID Matrícula: " + matriculaExtra.getId() + ")");
        }


        // ===================== 3 AVALIAÇÕES =====================
        System.out.println("\n--- Criando Avaliações ---");
        String[] feedbacks = {
                "Curso excelente, didática impecável e conteúdo muito relevante!",
                "Gostei bastante, mas alguns tópicos poderiam ser mais aprofundados. No geral, recomendo.",
                "Material de apoio muito bom e instrutor com ótimo conhecimento."
        };
        double[] notas = {9.5, 7.8, 8.9};
        for (int i = 0; i < alunosCriados.size(); i++) {
            Avaliacao avaliacao = new Avaliacao();
            Aluno aluno = alunosCriados.get(i);
            Curso curso = cursosCriados.get(i); // Aluno avalia o curso em que está matriculado

            avaliacao.setAluno(aluno);
            avaliacao.setCurso(curso);
            avaliacao.setNota(notas[i]);
            avaliacao.setFeedback(feedbacks[i]);
            avaliacaoDAO.save(avaliacao);
            System.out.println("Avaliação salva: Aluno '" + aluno.getNome() + "' para Curso '" + curso.getTitulo() + "' (Nota: " + avaliacao.getNota() + ", ID Avaliação: " + avaliacao.getId() + ")");
        }

        // ===================== 2 CERTIFICADOS (exemplo) =====================
        System.out.println("\n--- Criando Certificados ---");
        // Emitir certificado para os dois primeiros alunos para os cursos que eles se matricularam
        for (int i = 0; i < 2 && i < alunosCriados.size() && i < cursosCriados.size(); i++) {
            Certificado certificado = new Certificado();
            Aluno aluno = alunosCriados.get(i);
            Curso curso = cursosCriados.get(i);

            certificado.setAluno(aluno);
            certificado.setCurso(curso);
            certificado.setDataConclusao(new Date()); // Data de conclusão como hoje
            certificadoDAO.save(certificado);
            System.out.println("Certificado salvo: Aluno '" + aluno.getNome() + "' para Curso '" + curso.getTitulo() + "' (ID Certificado: " + certificado.getId() + ")");
        }

        System.out.println("\n==== FIM DA INSERÇÃO DE DADOS DE EXEMPLO ====");
    }
}
