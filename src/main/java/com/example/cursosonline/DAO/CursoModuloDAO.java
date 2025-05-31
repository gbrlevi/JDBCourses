package com.example.cursosonline.DAO;

import com.example.cursosonline.Util.ConnectionFactory;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Component
public class CursoModuloDAO {

    public void save(Long cursoId, Long moduloId) {
        String sql = "INSERT INTO curso_modulo (curso_id, modulo_id) VALUES (?, ?)";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, cursoId);
            stmt.setLong(2, moduloId);

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void delete(Long cursoId, Long moduloId) {
        String sql = "DELETE FROM curso_modulo WHERE curso_id = ? AND modulo_id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, cursoId);
            stmt.setLong(2, moduloId);

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public List<Long> findModulosByCursoId(Long cursoId) {
        String sql = "SELECT modulo_id FROM curso_modulo WHERE curso_id = ?";
        List<Long> modulos = new ArrayList<>();

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, cursoId);

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                modulos.add(rs.getLong("modulo_id"));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return modulos;
    }

    public List<Long> findCursosByModuloId(Long moduloId) {
        String sql = "SELECT curso_id FROM curso_modulo WHERE modulo_id = ?";
        List<Long> cursos = new ArrayList<>();

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, moduloId);

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
