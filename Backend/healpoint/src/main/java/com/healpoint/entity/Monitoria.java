package com.healpoint.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "monitoria")
public class Monitoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_monitoria")
    private Integer idMonitoria;

    @Column(name = "tabla_afectada", nullable = false, length = 100)
    private String tablaAfectada;

    @Column(nullable = false, length = 50)
    private String accion;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fecha;

    @ManyToOne
    @JoinColumn(name = "usuario_responsable")
    private Usuario usuarioResponsable;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    public Monitoria() {
        this.fecha = LocalDateTime.now();
    }

    public Monitoria(String tablaAfectada, String accion, Usuario usuarioResponsable, String descripcion) {
        this.tablaAfectada = tablaAfectada;
        this.accion = accion;
        this.usuarioResponsable = usuarioResponsable;
        this.descripcion = descripcion;
        this.fecha = LocalDateTime.now();
    }

    // ===== Getters & Setters =====

    public Integer getIdMonitoria() {
        return idMonitoria;
    }

    public void setIdMonitoria(Integer idMonitoria) {
        this.idMonitoria = idMonitoria;
    }

    public String getTablaAfectada() {
        return tablaAfectada;
    }

    public void setTablaAfectada(String tablaAfectada) {
        this.tablaAfectada = tablaAfectada;
    }

    public String getAccion() {
        return accion;
    }

    public void setAccion(String accion) {
        this.accion = accion;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public Usuario getUsuarioResponsable() {
        return usuarioResponsable;
    }

    public void setUsuarioResponsable(Usuario usuarioResponsable) {
        this.usuarioResponsable = usuarioResponsable;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
