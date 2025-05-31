package com.example.cursosonline.DAO;

import com.example.cursosonline.Domain.Aluno;
import com.example.cursosonline.Domain.Certificado;
import com.example.cursosonline.Domain.Curso;
import com.example.cursosonline.Util.ConnectionFactory;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Component
public class CertificadoDAO {

    public void save(Certificado certificado) {
        String sql = "INSERT INTO Certificado (data_conclusao, aluno_id, curso_id) VALUES (?, ?, ?)";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setDate(1, new java.sql.Date(certificado.getDataConclusao().getTime()));
            stmt.setLong(2, certificado.getAluno().getId());
            stmt.setLong(3, certificado.getCurso().getId());

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                certificado.setId(rs.getLong(1));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public Certificado findById(Long id) {
        String sql = "SELECT * FROM Certificado WHERE id = ?";
        Certificado certificado = null;

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                certificado = createCertificado(rs);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return certificado;
    }

    public List<Certificado> findByAlunoId(Long alunoId) {
        String sql = "SELECT * FROM Certificado WHERE aluno_id = ?";
        List<Certificado> certificados = new ArrayList<>();

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, alunoId);

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                certificados.add(createCertificado(rs));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return certificados;
    }

    public void delete(Long id) {
        String sql = "DELETE FROM Certificado WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private Certificado createCertificado(ResultSet rs) throws SQLException {
        Certificado certificado = new Certificado();
        certificado.setId(rs.getLong("id"));
        certificado.setDataConclusao(rs.getDate("data_conclusao"));

        Aluno aluno = new Aluno();
        aluno.setId(rs.getLong("aluno_id"));
        certificado.setAluno(aluno);

        Curso curso = new Curso();
        curso.setId(rs.getLong("curso_id"));
        certificado.setCurso(curso);

        return certificado;
    }
}
