package com.healpoint.controller;

import com.healpoint.entity.Cita;
import com.healpoint.entity.HistorialMedico;
import com.healpoint.repository.HistorialRepository;
import com.healpoint.repository.CitaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/historial")
public class HistorialController {

    @Autowired
    private HistorialRepository historialRepository;

    @Autowired
    private CitaRepository citaRepository;

    /**
     * GET /historial/mostrarHistoriales → Listar todos los historiales médicos.
     */
    @GetMapping("/mostrarHistoriales")
    public ResponseEntity<List<HistorialMedico>> getHistoriales() {
        return ResponseEntity.ok(historialRepository.findAll());
    }

    /**
     * GET /historial/mostrarHistorialPorCita?idCita=... → Consultar historial por cita.
     */
    @GetMapping("/mostrarHistorialPorCita")
    public ResponseEntity<?> getHistorialPorCita(@RequestParam Integer idCita) {

        Optional<Cita> citaOpt = citaRepository.findById(idCita);
        if (!citaOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("La cita con ID " + idCita + " no existe.");
        }

        Optional<HistorialMedico> historialOpt = historialRepository.findByCita(citaOpt.get());

        if (!historialOpt.isPresent()) {
            return ResponseEntity.ok("No se ha registrado historial médico para la cita ID " + idCita + ".");
        }

        return ResponseEntity.ok(historialOpt.get());
    }

    /**
     * POST /historial/crearHistorial → Registrar nuevo historial médico.
     */
    @PostMapping("/crearHistorial")
    public ResponseEntity<?> postHistorial(@RequestBody HistorialMedico historialData) {

        // 1. Validar que se haya enviado el ID de la cita
        if (historialData.getCita() == null || historialData.getCita().getId_cita() == null) {
            return ResponseEntity.badRequest().body("El ID de la cita es obligatorio para registrar el historial.");
        }

        Integer idCita = historialData.getCita().getId_cita();
        Optional<Cita> citaOpt = citaRepository.findById(idCita);

        // 2. Validar que la cita exista
        if (!citaOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se puede registrar historial, la cita ID " + idCita + " no existe.");
        }

        // 3. Validar que la cita NO tenga un historial ya registrado (OneToOne)
        if (historialRepository.findByCita(citaOpt.get()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Ya existe un historial médico registrado para la cita ID " + idCita + ".");
        }

        // 4. Crear el historial
        HistorialMedico nuevoHistorial = new HistorialMedico();
        nuevoHistorial.setCita(citaOpt.get()); // Asignamos el objeto Cita completo
        nuevoHistorial.setObservaciones(historialData.getObservaciones());
        nuevoHistorial.setDiagnostico(historialData.getDiagnostico());
        nuevoHistorial.setTratamiento(historialData.getTratamiento());
        // fechaRegistro se establece automáticamente en la entidad

        HistorialMedico historialGuardado = historialRepository.save(nuevoHistorial);

        // Opcionalmente, aquí se podría cambiar el estado de la Cita a "Realizada"

        return ResponseEntity.status(HttpStatus.CREATED).body(historialGuardado);
    }

    /**
     * PUT /historial/actualizarHistorial?idHistorial=... → Actualizar observaciones o diagnóstico.
     */
    @PutMapping("/actualizarHistorial")
    public ResponseEntity<?> putHistorial(@RequestParam Integer idHistorial, @RequestBody HistorialMedico datosActualizados) {

        // 1. Validar existencia del historial
        Optional<HistorialMedico> historialOpt = historialRepository.findById(idHistorial);

        if (!historialOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Historial con ID " + idHistorial + " no encontrado.");
        }

        HistorialMedico historialExistente = historialOpt.get();

        // 2. Actualizar campos (permitiendo que sean nulos si no se envían)
        if (datosActualizados.getObservaciones() != null) {
            historialExistente.setObservaciones(datosActualizados.getObservaciones());
        }
        if (datosActualizados.getDiagnostico() != null) {
            historialExistente.setDiagnostico(datosActualizados.getDiagnostico());
        }
        if (datosActualizados.getTratamiento() != null) {
            historialExistente.setTratamiento(datosActualizados.getTratamiento());
        }
        // No se permite cambiar la cita ni la fecha de registro original directamente.

        // 3. Guardar y retornar
        HistorialMedico historialActualizado = historialRepository.save(historialExistente);
        return ResponseEntity.ok(historialActualizado);
    }

    /**
     * DELETE /historial/eliminarHistorial?idHistorial=... → Eliminar historial.
     */
    @DeleteMapping("/eliminarHistorial")
    public ResponseEntity<?> deleteHistorial(@RequestParam Integer idHistorial) {

        // 1. Validar existencia
        if (!historialRepository.existsById(idHistorial)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Historial con ID " + idHistorial + " no encontrado para eliminar.");
        }

        try {
            // 2. Eliminar el historial
            historialRepository.deleteById(idHistorial);
            return ResponseEntity.ok("Historial médico con ID " + idHistorial + " eliminado correctamente.");
        } catch (Exception e) {
            // Manejo de error si hay alguna restricción de base de datos
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se pudo eliminar el historial ID " + idHistorial + " debido a un error interno.");
        }
    }
}