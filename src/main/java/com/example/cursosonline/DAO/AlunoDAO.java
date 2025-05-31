package com.example.cursosonline.DAO;

import com.example.cursosonline.Domain.Aluno;
import com.example.cursosonline.Util.ConnectionFactory;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Component
public class AlunoDAO {

    public void save(Aluno aluno) {
        String query = "INSERT INTO Aluno (nome, cpf, senha, data_cadastro) VALUES (?, ?, ?, ?)";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);) {

            stmt.setString(1, aluno.getNome());
            stmt.setString(2, aluno.getCpf());
            stmt.setString(3, aluno.getSenha());
            stmt.setDate(4, new java.sql.Date(aluno.getDataCadastro().getTime()));

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                aluno.setId(rs.getLong(1));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public Aluno findById(Long id) {
        String query = "SELECT * FROM Aluno WHERE id = ?";
        Aluno aluno = null;

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                aluno = createAluno(rs);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return aluno;
    }

    public List<Aluno> findAll() {
        String query = "SELECT * FROM Aluno";
        List<Aluno> alunos = new ArrayList<Aluno>();

        try(Connection conn = ConnectionFactory.getConnection();
        PreparedStatement stmt = conn.prepareStatement(query)) {
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                alunos.add(createAluno(rs));
            }
        }

        catch (Exception e) {
            e.printStackTrace();

        }
        return alunos;
    }

    public void update(Aluno aluno) {
        String query = "UPDATE Aluno SET nome = ?, cpf = ?, senha = ?, data_cadastro = ? WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, aluno.getNome());
            stmt.setString(2, aluno.getCpf());
            stmt.setString(3, aluno.getSenha());
            stmt.setDate(4, new Date(aluno.getDataCadastro().getTime()));
            stmt.setLong(5, aluno.getId());

            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void delete(Long id) {
        String query = "DELETE FROM Aluno WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private Aluno createAluno(ResultSet rs) throws SQLException {
        Aluno aluno = new Aluno();
        aluno.setId(rs.getLong("id"));
        aluno.setNome(rs.getString("nome"));
        aluno.setCpf(rs.getString("cpf"));
        aluno.setSenha(rs.getString("senha"));
        aluno.setDataCadastro(rs.getDate("data_cadastro"));
        return aluno;
    }

}