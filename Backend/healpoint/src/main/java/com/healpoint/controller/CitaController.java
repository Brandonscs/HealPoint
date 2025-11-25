package com.healpoint.controller;

import com.healpoint.entity.Cita;
import com.healpoint.entity.Medico;
import com.healpoint.entity.Paciente;
import com.healpoint.entity.Estado;
import com.healpoint.repository.CitaRepository;
import com.healpoint.repository.MedicoRepository;
import com.healpoint.repository.PacienteRepository;
import com.healpoint.repository.EstadoRepository;

import com.healpoint.service.MonitoriaService;
import com.healpoint.service.DisponibilidadService;
import com.healpoint.validator.FechaValidator;
import com.healpoint.validator.HoraValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/cita")
public class CitaController {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @Autowired
    private MonitoriaService monitoriaService;

    @Autowired
    private DisponibilidadService disponibilidadService;

    /**
     * GET /cita/mostrarCitas → Listar todas las citas.
     */
    @GetMapping("/mostrarCitas")
    public ResponseEntity<List<Cita>> getCitas() {
        return ResponseEntity.ok(citaRepository.findAll());
    }

    /**
     * GET /cita/mostrarCitasPorPaciente?idPaciente=... → Consultar citas por paciente.
     */
    @GetMapping("/mostrarCitasPorPaciente")
    public ResponseEntity<?> getCitasPorPaciente(@RequestParam Integer idPaciente) {
        Optional<Paciente> paciente = pacienteRepository.findById(idPaciente);

        if (!paciente.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe el paciente con ID: " + idPaciente);
        }

        List<Cita> citas = citaRepository.findByPaciente(paciente.get());

        if (citas.isEmpty()) {
            return ResponseEntity.ok("El paciente no tiene citas registradas.");
        }

        return ResponseEntity.ok(citas);
    }

    /**
     * GET /cita/mostrarCitasPorMedico?idMedico=... → Consultar citas por médico.
     */
    @GetMapping("/mostrarCitasPorMedico")
    public ResponseEntity<?> getCitasPorMedico(@RequestParam Integer idMedico) {
        Optional<Medico> medico = medicoRepository.findById(idMedico);

        if (!medico.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe el médico con ID: " + idMedico);
        }

        List<Cita> citas = citaRepository.findByMedico(medico.get());

        if (citas.isEmpty()) {
            return ResponseEntity.ok("El médico no tiene citas registradas.");
        }

        return ResponseEntity.ok(citas);
    }

    /**
     * POST /cita/crearCita → Crear nueva cita.
     * Asume que en el RequestBody viene una Cita con las IDs de Paciente, Medico y Estado.
     */
    @PostMapping("/crearCita")
    public ResponseEntity<?> postCita(@RequestBody Cita citaData) {

        // 1. Validaciones de datos básicos
        if (citaData.getPaciente() == null || citaData.getPaciente().getIdPaciente() == null ||
                citaData.getMedico() == null || citaData.getMedico().getId_medico() == null ||
                citaData.getEstado() == null || citaData.getEstado().getIdEstado() == null ||
                citaData.getFecha() == null || citaData.getHora() == null) {
            return ResponseEntity.badRequest().body("Datos de la cita incompletos (Paciente, Médico, Estado, Fecha u Hora).");
        }

        // 2. Validación de existencia de entidades relacionadas
        Optional<Paciente> pacienteOpt = pacienteRepository.findById(citaData.getPaciente().getIdPaciente());
        Optional<Medico> medicoOpt = medicoRepository.findById(citaData.getMedico().getId_medico());
        Optional<Estado> estadoOpt = estadoRepository.findById(citaData.getEstado().getIdEstado());

        if (!pacienteOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Paciente con ID " + citaData.getPaciente().getIdPaciente() + " no encontrado.");
        }
        if (!medicoOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Médico con ID " + citaData.getMedico().getId_medico() + " no encontrado.");
        }
        if (!estadoOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Estado con ID " + citaData.getEstado().getIdEstado() + " no encontrado.");
        }

        // 3. Validación de disponibilidad del médico
        Optional<Cita> citaExistente = citaRepository.findByMedicoAndFechaAndHora(
                medicoOpt.get(), citaData.getFecha(), citaData.getHora()
        );

        if (citaExistente.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("El médico ya tiene una cita agendada en la fecha " + citaData.getFecha() + " y hora " + citaData.getHora() + ".");
        }

        // Validación de fecha futura
        if (!FechaValidator.esFechaValida(citaData.getFecha())) {
            return ResponseEntity.badRequest().body("La fecha no puede ser anterior a hoy.");
        }

        // Validación de hora en rango
        if (!HoraValidator.esHoraEnRango(citaData.getHora())) {
            return ResponseEntity.badRequest().body("La hora debe estar entre 6:00 y 20:00.");
        }

        // Validación de hora pasada si la fecha es hoy
        if (HoraValidator.esHoraDelPasado(citaData.getFecha(), citaData.getHora())) {
            return ResponseEntity.badRequest().body("La hora indicada ya pasó.");
        }

        if (!disponibilidadService.medicoDisponible(
                citaData.getMedico().getId_medico(),
                citaData.getFecha(),
                citaData.getHora()
        )) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("El médico no está disponible en ese horario.");
        }

        // 4. Crear y guardar la cita
        Cita nuevaCita = new Cita();
        nuevaCita.setPaciente(pacienteOpt.get());
        nuevaCita.setMedico(medicoOpt.get());
        nuevaCita.setFecha(citaData.getFecha());
        nuevaCita.setHora(citaData.getHora());
        nuevaCita.setEstado(estadoOpt.get()); // Asigna el objeto Estado completo

        Cita citaGuardada = citaRepository.save(nuevaCita);

        // Monitoreo
        monitoriaService.registrarAccion(
                "cita",
                "CREATE",
                citaData.getPaciente().getIdPaciente(), // o el id del usuario que realiza la acción
                "Se creó la cita ID " + citaGuardada.getId_cita()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(citaGuardada);
    }

    /**
     * PUT /cita/actualizarCita?idCita=... → Reprogramar o actualizar cita.
     * Permite cambiar fecha, hora y/o estado de una cita.
     */
    @PutMapping("/actualizarCita")
    public ResponseEntity<?> putCita(@RequestParam Integer idCita, @RequestBody Cita datosActualizados) {

        // 1. Validar existencia de la cita
        Optional<Cita> citaOpt = citaRepository.findById(idCita);

        if (!citaOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Cita con ID " + idCita + " no encontrada para actualizar.");
        }

        Cita citaExistente = citaOpt.get();
        LocalDate nuevaFecha = datosActualizados.getFecha() != null ? datosActualizados.getFecha() : citaExistente.getFecha();
        LocalTime nuevaHora = datosActualizados.getHora() != null ? datosActualizados.getHora() : citaExistente.getHora();
        Integer idNuevoEstado = datosActualizados.getEstado() != null ? datosActualizados.getEstado().getIdEstado() : null;

        // 2. Validar disponibilidad si se intenta reprogramar (cambio de fecha/hora)
        if (!nuevaFecha.equals(citaExistente.getFecha()) || !nuevaHora.equals(citaExistente.getHora())) {
            Optional<Cita> citaConflictiva = citaRepository.findByMedicoAndFechaAndHora(
                    citaExistente.getMedico(), nuevaFecha, nuevaHora
            );

            // Conflicto solo si existe otra cita con el mismo médico, fecha y hora, y NO es la misma cita que se está actualizando
            if (citaConflictiva.isPresent() && !citaConflictiva.get().getId_cita().equals(idCita)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("El médico no está disponible en la nueva fecha y hora (" + nuevaFecha + " " + nuevaHora + ").");
            }

            // Si no hay conflicto, actualiza los datos de reprogramación
            citaExistente.setFecha(nuevaFecha);
            citaExistente.setHora(nuevaHora);
        }

        // 3. Actualizar estado si se proporciona
        if (idNuevoEstado != null && !idNuevoEstado.equals(citaExistente.getEstado().getIdEstado())) {
            Optional<Estado> estadoOpt = estadoRepository.findById(idNuevoEstado);
            if (!estadoOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Estado con ID " + idNuevoEstado + " no encontrado.");
            }
            citaExistente.setEstado(estadoOpt.get());
        }


        // 4. Guardar y retornar
        Cita citaActualizada = citaRepository.save(citaExistente);

        // Monitoreo
        monitoriaService.registrarAccion(
                "cita",
                "UPDATE",
                citaExistente.getPaciente().getIdPaciente(), // o id del usuario que realiza la acción
                "Se actualizó la cita ID " + citaActualizada.getId_cita()
        );

        return ResponseEntity.ok(citaActualizada);
    }

    /**
     * DELETE /cita/eliminarCita?idCita=... → Cancelar cita (cambiar estado a Cancelada).
     */
    @DeleteMapping("/eliminarCita")
    public ResponseEntity<?> deleteCita(@RequestParam Integer idCita) {

        // 1. Validar existencia de la cita
        Optional<Cita> citaOpt = citaRepository.findById(idCita);

        if (!citaOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Cita con ID " + idCita + " no encontrada.");
        }

        Cita cita = citaOpt.get();

        // 2. Buscar el estado "Cancelada" (asume que existe un estado con ese nombre)
        Optional<Estado> estadoCanceladaOpt = estadoRepository.findByNombreEstado("Cancelada");

        if (!estadoCanceladaOpt.isPresent()) {
            // Si no existe, lanza un error o simplemente elimina la cita (depende de la política)
            // Se opta por eliminar si no hay estado 'Cancelada' o retornar error
            try {
                citaRepository.deleteById(idCita);
                return ResponseEntity.ok("Cita eliminada permanentemente (Estado 'Cancelada' no encontrado).");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error al intentar eliminar la cita: " + e.getMessage());
            }
        }

        // 3. Cambiar el estado a "Cancelada"
        cita.setEstado(estadoCanceladaOpt.get());
        citaRepository.save(cita);

        // Monitoreo
        monitoriaService.registrarAccion(
                "cita",
                "DELETE",
                cita.getPaciente().getIdPaciente(), // o id del usuario que realiza la acción
                "Se canceló/eliminó la cita ID " + cita.getId_cita()
        );

        return ResponseEntity.ok("Cita con ID " + idCita + " cancelada exitosamente.");
    }
}