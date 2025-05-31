package com.example.cursosonline.DAO;

import com.example.cursosonline.Util.ConnectionFactory;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Component
public class CursoInstrutorDAO {

    public void save(Long cursoId, Long instrutorId) {
        String sql = "INSERT INTO curso_instrutor (curso_id, instrutor_id) VALUES (?, ?)";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, cursoId);
            stmt.setLong(2, instrutorId);

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void delete(Long cursoId, Long instrutorId) {
        String sql = "DELETE FROM curso_instrutor WHERE curso_id = ? AND instrutor_id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, cursoId);
            stmt.setLong(2, instrutorId);

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public List<Long> findInstrutoresByCursoId(Long cursoId) {
        String sql = "SELECT instrutor_id FROM curso_instrutor WHERE curso_id = ?";
        List<Long> instrutores = new ArrayList<>();

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, cursoId);

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                instrutores.add(rs.getLong("instrutor_id"));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return instrutores;
    }

    public List<Long> findCursosByInstrutorId(Long instrutorId) {
        String sql = "SELECT curso_id FROM curso_instrutor WHERE instrutor_id = ?";
        List<Long> cursos = new ArrayList<>();

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, instrutorId);

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                cursos.add(rs.getLong("curso_id"));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return cursos;
    }
}
