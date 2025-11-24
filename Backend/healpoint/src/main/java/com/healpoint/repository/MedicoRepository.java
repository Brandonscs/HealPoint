package com.healpoint.repository;

import com.healpoint.entity.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Integer> {

    Optional<Medico> findByUsuario_IdUsuario(Integer idUsuario);

}
