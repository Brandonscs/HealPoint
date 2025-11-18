package com.healpoint.repository;

import com.healpoint.entity.Disponibilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DisponibilidadRepository extends JpaRepository<Disponibilidad, Integer> {

    @Query("SELECT d FROM Disponibilidad d WHERE d.medico.id_medico = :id_medico")
    List<Disponibilidad> findByMedico(@Param("id_medico") Integer id_medico);

}
