package com.healpoint.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "historial_medico")
public class HistorialMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_historial;

    // Relación OneToOne con Cita. Una Cita solo debe tener un Historial.
    @OneToOne(fetch = FetchType.EAGER) // Se carga EAGER ya que siempre necesitaremos la Cita asociada.
    @JoinColumn(name = "id_cita", nullable = false, unique = true) // UNIQUE asegura el OneToOne a nivel de DB
    private Cita cita;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(columnDefinition = "TEXT")
    private String diagnostico;

    @Column(columnDefinition = "TEXT")
    private String tratamiento;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDate fechaRegistro = LocalDate.now();

    // Constructor vacío
    public HistorialMedico() {
    }

    // Getters y Setters
    public Integer getId_historial() {
        return id_historial;
    }

    public void setId_historial(Integer id_historial) {
        this.id_historial = id_historial;
    }

    public Cita getCita() {
        return cita;
    }

    public void setCita(Cita cita) {
        this.cita = cita;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
    }

    public String getTratamiento() {
        return tratamiento;
    }

    public void setTratamiento(String tratamiento) {
        this.tratamiento = tratamiento;
    }

    public LocalDate getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDate fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
}