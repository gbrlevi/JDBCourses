package com.example.cursosonline.DAO;

import com.example.cursosonline.Domain.Aluno;
import com.example.cursosonline.Domain.Curso;
import com.example.cursosonline.Domain.Matricula;
import com.example.cursosonline.Util.ConnectionFactory;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Component
public class MatriculaDAO {

    public void save(Matricula matricula) {
        String query = "INSERT INTO Matricula (aluno_id, curso_id, data_matricula, ativo) VALUES (?, ?, ?, ?)";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setLong(1, matricula.getAluno().getId());
            stmt.setLong(2, matricula.getCurso().getId());
            stmt.setDate(3, new java.sql.Date(matricula.getDataMatricula().getTime()));
            stmt.setBoolean(4, matricula.isAtivo());

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                matricula.setId(rs.getLong(1));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public Matricula findById(Long id) {
        String query = "SELECT * FROM Matricula WHERE id = ?";
        Matricula matricula = null;

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setLong(1, id);

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                matricula = createMatricula(rs);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return matricula;
    }

    public List<Matricula> findByAlunoId(Long alunoId) {
        String query = "SELECT * FROM Matricula WHERE aluno_id = ?";
        List<Matricula> matriculas = new ArrayList<>();

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setLong(1, alunoId);

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Matricula matricula = createMatricula(rs);
                matriculas.add(matricula);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return matriculas;
    }

    public List<Matricula> findByCursoId(Long cursoId) {
        String query = "SELECT * FROM Matricula WHERE curso_id = ?";
        List<Matricula> matriculas = new ArrayList<>();

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setLong(1, cursoId);

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Matricula matricula = createMatricula(rs);
                matriculas.add(matricula);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return matriculas;
    }

    public List<Matricula> findAll() {
        String sql = "SELECT * FROM Matricula";
        List<Matricula> matriculas = new ArrayList<>();

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                matriculas.add(createMatricula(rs));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return matriculas;
    }

    public void update(Matricula matricula) {
        String query = "UPDATE Matricula SET aluno_id = ?, curso_id = ?, data_matricula = ?, ativo = ? WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setLong(1, matricula.getAluno().getId());
            stmt.setLong(2, matricula.getCurso().getId());
            stmt.setDate(3, new java.sql.Date(matricula.getDataMatricula().getTime()));
            stmt.setBoolean(4, matricula.isAtivo());
            stmt.setLong(5, matricula.getId());

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void delete(Long id) {
        String query = "DELETE FROM Matricula WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private Matricula createMatricula(ResultSet rs) throws SQLException {
        Matricula matricula = new Matricula();

        matricula.setId(rs.getLong("id"));
        matricula.setDataMatricula(rs.getDate("data_matricula"));
        matricula.setAtivo(rs.getBoolean("ativo"));

        Aluno aluno = new Aluno();
        aluno.setId(rs.getLong("aluno_id"));
        matricula.setAluno(aluno);

        Curso curso = new Curso();
        curso.setId(rs.getLong("curso_id"));
        matricula.setCurso(curso);

        return matricula;
    }
}
