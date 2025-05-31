package com.example.cursosonline.DAO;

import com.example.cursosonline.Domain.Aula;
import com.example.cursosonline.Domain.Modulo;
import com.example.cursosonline.Util.ConnectionFactory;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Component
public class AulaDAO {

    public void save(Aula aula) {
        String sql = "INSERT INTO Aula (url, titulo, duracao, ordem, modulo_id) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, aula.getUrl());
            stmt.setString(2, aula.getTitulo());
            stmt.setString(3, aula.getDuracao());
            stmt.setInt(4, aula.getOrdem());
            stmt.setLong(5, aula.getModulo().getId());

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                aula.setId(rs.getLong(1));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public Aula findById(Long id) {
        String sql = "SELECT * FROM Aula WHERE id = ?";
        Aula aula = null;

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                aula = createAula(rs);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return aula;
    }

    public List<Aula> findByModuloId(Long moduloId) {
        String sql = "SELECT * FROM Aula WHERE modulo_id = ?";
        List<Aula> aulas = new ArrayList<>();

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, moduloId);

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Aula aula = createAula(rs);
                aulas.add(aula);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return aulas;
    }

    public List<Aula> findAll() {
        String sql = "SELECT * FROM Aula";
        List<Aula> aulas = new ArrayList<>();

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Aula aula = createAula(rs);
                aulas.add(aula);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return aulas;
    }

    public void update(Aula aula) {
        String sql = "UPDATE Aula SET url = ?, titulo = ?, duracao = ?, ordem = ?, modulo_id = ? WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, aula.getUrl());
            stmt.setString(2, aula.getTitulo());
            stmt.setString(3, aula.getDuracao());
            stmt.setInt(4, aula.getOrdem());
            stmt.setLong(5, aula.getModulo().getId());
            stmt.setLong(6, aula.getId());

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void delete(Long id) {
        String sql = "DELETE FROM Aula WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private Aula createAula(ResultSet rs) throws SQLException {
        Aula aula = new Aula();

        aula.setId(rs.getLong("id"));
        aula.setUrl(rs.getString("url"));
        aula.setTitulo(rs.getString("titulo"));
        aula.setDuracao(rs.getString("duracao"));
        aula.setOrdem(rs.getInt("ordem"));

        Modulo modulo = new Modulo();
        modulo.setId(rs.getLong("modulo_id"));
        aula.setModulo(modulo);

        return aula;
    }
}
