package com.healpoint.repository;

import com.healpoint.entity.Cita;
import com.healpoint.entity.Paciente;
import com.healpoint.entity.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Integer> {

    /**
     * Busca todas las citas de un paciente específico.
     */
    List<Cita> findByPaciente(Paciente paciente);

    /**
     * Busca todas las citas de un médico específico.
     */
    List<Cita> findByMedico(Medico medico);

    /**
     * Busca citas de un médico en una fecha y hora específicas. Se usará para validar
     * la disponibilidad del médico antes de crear o reprogramar una cita.
     */
    Optional<Cita> findByMedicoAndFechaAndHora(Medico medico, LocalDate fecha, LocalTime hora);

    /**
     * Busca citas de un paciente en una fecha y hora específicas. Se puede usar para
     * evitar que un paciente tenga dos citas a la misma hora, aunque no es estricto.
     */
    Optional<Cita> findByPacienteAndFechaAndHora(Paciente paciente, LocalDate fecha, LocalTime hora);
}