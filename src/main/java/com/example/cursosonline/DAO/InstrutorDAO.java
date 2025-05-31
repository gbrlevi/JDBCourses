package com.example.cursosonline.DAO;

import com.example.cursosonline.Domain.Instrutor;
import com.example.cursosonline.Util.ConnectionFactory;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Component
public class InstrutorDAO {

    public void save(Instrutor instrutor) {
        String sql = "INSERT INTO Instrutor (nome, cpf, senha, data_cadastro) VALUES (?, ?, ?, ?)";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, instrutor.getNome());
            stmt.setString(2, instrutor.getCpf());
            stmt.setString(3, instrutor.getSenha());
            stmt.setDate(4, new java.sql.Date(instrutor.getDataCadastro().getTime()));

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                instrutor.setId(rs.getLong(1));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public Instrutor findById(Long id) {
        String sql = "SELECT * FROM Instrutor WHERE id = ?";
        Instrutor instrutor = null;

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                instrutor = createInstrutor(rs);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return instrutor;
    }

    public List<Instrutor> findAll() {
        String sql = "SELECT * FROM Instrutor";
        List<Instrutor> instrutores = new ArrayList<>();

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                instrutores.add(createInstrutor(rs));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return instrutores;
    }

    public void update(Instrutor instrutor) {
        String sql = "UPDATE Instrutor SET nome = ?, cpf = ?, senha = ?, data_cadastro = ? WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, instrutor.getNome());
            stmt.setString(2, instrutor.getCpf());
            stmt.setString(3, instrutor.getSenha());
            stmt.setDate(4, new java.sql.Date(instrutor.getDataCadastro().getTime()));
            stmt.setLong(5, instrutor.getId());

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void delete(Long id) {
        String sql = "DELETE FROM Instrutor WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private Instrutor createInstrutor(ResultSet rs) throws SQLException {
        Instrutor instrutor = new Instrutor();
        instrutor.setId(rs.getLong("id"));
        instrutor.setNome(rs.getString("nome"));
        instrutor.setCpf(rs.getString("cpf"));
        instrutor.setSenha(rs.getString("senha"));
        instrutor.setDataCadastro(rs.getDate("data_cadastro"));
        return instrutor;
    }
}
