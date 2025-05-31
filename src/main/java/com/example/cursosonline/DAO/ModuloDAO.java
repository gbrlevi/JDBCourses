package com.example.cursosonline.DAO;

import com.example.cursosonline.Domain.Modulo;
import com.example.cursosonline.Util.ConnectionFactory;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Component
public class ModuloDAO {

    public void save(Modulo modulo) {
        String sql = "INSERT INTO Modulo (conteudo, carga_horaria, qtd_aulas) VALUES (?, ?, ?)";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, modulo.getConteudo());
            stmt.setInt(2, modulo.getCargaHoraria());
            stmt.setInt(3, modulo.getQtdAulas());

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                modulo.setId(rs.getLong(1));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public Modulo findById(Long id) {
        String sql = "SELECT * FROM Modulo WHERE id = ?";
        Modulo modulo = null;

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                modulo = createModulo(rs);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return modulo;
    }

    public List<Modulo> findAll() {
        String sql = "SELECT * FROM Modulo";
        List<Modulo> modulos = new ArrayList<>();

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                modulos.add(createModulo(rs));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return modulos;
    }

    public void update(Modulo modulo) {
        String sql = "UPDATE Modulo SET conteudo = ?, carga_horaria = ?, qtd_aulas = ? WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, modulo.getConteudo());
            stmt.setInt(2, modulo.getCargaHoraria());
            stmt.setInt(3, modulo.getQtdAulas());
            stmt.setLong(4, modulo.getId());

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void delete(Long id) {
        String sql = "DELETE FROM Modulo WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private Modulo createModulo(ResultSet rs) throws SQLException {
        Modulo modulo = new Modulo();
        modulo.setId(rs.getLong("id"));
        modulo.setConteudo(rs.getString("conteudo"));
        modulo.setCargaHoraria(rs.getInt("carga_horaria"));
        modulo.setQtdAulas(rs.getInt("qtd_aulas"));
        return modulo;
    }
}
