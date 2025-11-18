package com.healpoint.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "paciente")
public class Paciente {

    @Id
    @Column(name = "id_paciente")
    private Integer idPaciente;

    @Column(nullable = false)
    private String eps;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id_paciente")
    private Usuario usuario;

    public Paciente() {
    }

    public Paciente(String eps, Usuario usuario) {
        this.eps = eps;
        this.usuario = usuario;
    }

    public Integer getIdPaciente() {
        return idPaciente;
    }

    public void setIdPaciente(Integer idPaciente) {
        this.idPaciente = idPaciente;
    }

    public String getEps() {
        return eps;
    }

    public void setEps(String eps) {
        this.eps = eps;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
        this.idPaciente = usuario.getIdUsuario();
    }
}
