package com.healpoint.repository;

import com.healpoint.entity.Paciente;
import com.healpoint.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Integer> {

    Paciente findByUsuario(Usuario usuario);

}
