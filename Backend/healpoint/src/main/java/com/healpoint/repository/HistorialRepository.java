package com.healpoint.repository;

import com.healpoint.entity.Cita;
import com.healpoint.entity.HistorialMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HistorialRepository extends JpaRepository<HistorialMedico, Integer> {

    /**
     * Busca el historial médico asociado a una cita específica (OneToOne).
     */
    Optional<HistorialMedico> findByCita(Cita cita);
}