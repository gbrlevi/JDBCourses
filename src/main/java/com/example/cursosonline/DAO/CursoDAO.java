package com.example.cursosonline.DAO;

import com.example.cursosonline.Domain.Curso;
import com.example.cursosonline.Util.ConnectionFactory;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Component
public class CursoDAO {

    public void save(Curso curso) {
        String sql = "INSERT INTO Curso (titulo, carga_horaria, status) VALUES (?, ?, ?)";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, curso.getTitulo());
            stmt.setInt(2, curso.getCargaHoraria());
            stmt.setString(3, curso.getStatus());

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                curso.setId(rs.getLong(1));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public Curso findById(Long id) {
        String sql = "SELECT * FROM Curso WHERE id = ?";
        Curso curso = null;

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                curso = createCurso(rs);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return curso;
    }

    public List<Curso> findAll() {
        String sql = "SELECT * FROM Curso";
        List<Curso> cursos = new ArrayList<>();

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                cursos.add(createCurso(rs));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return cursos;
    }

    public void update(Curso curso) {
        String sql = "UPDATE Curso SET titulo = ?, carga_horaria = ?, status = ? WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, curso.getTitulo());
            stmt.setInt(2, curso.getCargaHoraria());
            stmt.setString(3, curso.getStatus());
            stmt.setLong(4, curso.getId());

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void delete(Long id) {
        String sql = "DELETE FROM Curso WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private Curso createCurso(ResultSet rs) throws SQLException {
        Curso curso = new Curso();
        curso.setId(rs.getLong("id"));
        curso.setTitulo(rs.getString("titulo"));
        curso.setCargaHoraria(rs.getInt("carga_horaria"));
        curso.setStatus(rs.getString("status"));
        return curso;
    }
}
