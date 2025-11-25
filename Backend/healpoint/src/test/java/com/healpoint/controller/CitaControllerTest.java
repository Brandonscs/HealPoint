package com.healpoint.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healpoint.entity.*;
import com.healpoint.repository.*;
import com.healpoint.service.DisponibilidadService;
import com.healpoint.service.MonitoriaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CitaController.class)
public class CitaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper mapper;

    @MockBean
    private PacienteRepository pacienteRepository;

    @MockBean
    private MedicoRepository medicoRepository;

    @MockBean
    private EstadoRepository estadoRepository;

    @MockBean
    private CitaRepository citaRepository;

    @MockBean
    private DisponibilidadService disponibilidadService;

    @MockBean
    private MonitoriaService monitoriaService;

    // -------------------------------------------------------------
    // 1) Médico NO disponible según DisponibilidadService
    // -------------------------------------------------------------
    @Test
    void testCrearCita_MedicoNoDisponible() throws Exception {

        Cita cita = new Cita();
        cita.setFecha(LocalDate.now().plusDays(1));
        cita.setHora(LocalTime.of(10, 0));

        Medico m = new Medico();
        m.setId_medico(1);
        Paciente p = new Paciente();
        p.setIdPaciente(1);
        Estado e = new Estado();
        e.setIdEstado(1);

        cita.setMedico(m);
        cita.setPaciente(p);
        cita.setEstado(e);

        when(pacienteRepository.findById(1)).thenReturn(Optional.of(p));
        when(medicoRepository.findById(1)).thenReturn(Optional.of(m));
        when(estadoRepository.findById(1)).thenReturn(Optional.of(e));

        when(citaRepository.findByMedicoAndFechaAndHora(any(), any(), any()))
                .thenReturn(Optional.empty());

        when(disponibilidadService.medicoDisponible(1,
                cita.getFecha(), cita.getHora()))
                .thenReturn(false);

        mockMvc.perform(post("/cita/crearCita")
                        .contentType("application/json")
                        .content(mapper.writeValueAsString(cita)))
                .andExpect(status().isConflict())
                .andExpect(content().string("El médico no está disponible en ese horario."));
    }

    // -------------------------------------------------------------
    // 2) Médico disponible — debe crear la cita
    // -------------------------------------------------------------
    @Test
    void testCrearCita_MedicoDisponible() throws Exception {

        Cita cita = new Cita();
        cita.setFecha(LocalDate.now().plusDays(1));
        cita.setHora(LocalTime.of(9, 0));

        Medico m = new Medico();
        m.setId_medico(1);
        Paciente p = new Paciente();
        p.setIdPaciente(1);
        Estado e = new Estado();
        e.setIdEstado(1);

        cita.setMedico(m);
        cita.setPaciente(p);
        cita.setEstado(e);

        when(pacienteRepository.findById(1)).thenReturn(Optional.of(p));
        when(medicoRepository.findById(1)).thenReturn(Optional.of(m));
        when(estadoRepository.findById(1)).thenReturn(Optional.of(e));

        when(citaRepository.findByMedicoAndFechaAndHora(any(), any(), any()))
                .thenReturn(Optional.empty());

        when(disponibilidadService.medicoDisponible(
                1, cita.getFecha(), cita.getHora()
        )).thenReturn(true);

        when(citaRepository.save(any())).thenReturn(cita);

        mockMvc.perform(post("/cita/crearCita")
                        .contentType("application/json")
                        .content(mapper.writeValueAsString(cita)))
                .andExpect(status().isCreated());
    }

    // -------------------------------------------------------------
    // 3) Médico ya tiene cita → conflicto
    // -------------------------------------------------------------
    @Test
    void testCrearCita_ConflictoPorCitaExistente() throws Exception {

        Cita cita = new Cita();
        cita.setFecha(LocalDate.now().plusDays(2));
        cita.setHora(LocalTime.of(11, 0));

        Medico m = new Medico();
        m.setId_medico(1);
        Paciente p = new Paciente();
        p.setIdPaciente(1);
        Estado e = new Estado();
        e.setIdEstado(1);

        cita.setMedico(m);
        cita.setPaciente(p);
        cita.setEstado(e);

        when(pacienteRepository.findById(1)).thenReturn(Optional.of(p));
        when(medicoRepository.findById(1)).thenReturn(Optional.of(m));
        when(estadoRepository.findById(1)).thenReturn(Optional.of(e));

        // simulamos una cita YA existente
        when(citaRepository.findByMedicoAndFechaAndHora(m,
                cita.getFecha(), cita.getHora()))
                .thenReturn(Optional.of(new Cita()));

        mockMvc.perform(post("/cita/crearCita")
                        .contentType("application/json")
                        .content(mapper.writeValueAsString(cita)))
                .andExpect(status().isConflict())
                .andExpect(content().string(
                        "El médico ya tiene una cita agendada en la fecha "
                                + cita.getFecha() + " y hora " + cita.getHora() + "."
                ));
    }
}
