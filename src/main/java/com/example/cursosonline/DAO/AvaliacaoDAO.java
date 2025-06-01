package com.example.cursosonline.DAO;

import com.example.cursosonline.Domain.Aluno;
import com.example.cursosonline.Domain.Avaliacao;
import com.example.cursosonline.Domain.Curso;
import com.example.cursosonline.Util.ConnectionFactory;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Component
public class AvaliacaoDAO {

    public void save(Avaliacao avaliacao) {
        String sql = "INSERT INTO Avaliacao (nota, feedback, aluno_id, curso_id) VALUES (?, ?, ?, ?)";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setDouble(1, avaliacao.getNota());
            stmt.setString(2, avaliacao.getFeedback());
            stmt.setLong(3, avaliacao.getAluno().getId());
            stmt.setLong(4, avaliacao.getCurso().getId());

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                avaliacao.setId(rs.getLong(1));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public Avaliacao findById(Long id) {
        String sql = "SELECT * FROM Avaliacao WHERE id = ?";
        Avaliacao avaliacao = null;

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                avaliacao = createAvaliacao(rs);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return avaliacao;
    }

    public List<Avaliacao> findAll() {
        String sql = "SELECT * FROM Avaliacao";
        List<Avaliacao> avaliacoes = new ArrayList<>();

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                avaliacoes.add(createAvaliacao(rs));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return avaliacoes;
    }

    public List<Avaliacao> findByAlunoId(Long alunoId) {
        String sql = "SELECT * FROM Avaliacao WHERE aluno_id = ?";
        List<Avaliacao> avaliacoes = new ArrayList<>();

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, alunoId);

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                avaliacoes.add(createAvaliacao(rs));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return avaliacoes;
    }

    public void delete(Long id) {
        String sql = "DELETE FROM Avaliacao WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private Avaliacao createAvaliacao(ResultSet rs) throws SQLException {
        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setId(rs.getLong("id"));
        avaliacao.setNota(rs.getDouble("nota"));
        avaliacao.setFeedback(rs.getString("feedback"));

        Aluno aluno = new Aluno();
        aluno.setId(rs.getLong("aluno_id"));
        avaliacao.setAluno(aluno);

        Curso curso = new Curso();
        curso.setId(rs.getLong("curso_id"));
        avaliacao.setCurso(curso);

        return avaliacao;
    }
}
