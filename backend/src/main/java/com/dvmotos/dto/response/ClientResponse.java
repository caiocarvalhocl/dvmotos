package com.dvmotos.dto.response;

import com.dvmotos.entity.Client;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ClientResponse {
    private Long id;
    private String name;
    private String documentNumber;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String notes;
    private Boolean active;
    private LocalDateTime createdAt;
    private Integer totalVehicles;

    public static ClientResponse fromEntity(Client client) {
        return ClientResponse.builder()
                .id(client.getId()).name(client.getName()).documentNumber(client.getDocumentNumber())
                .phone(client.getPhone()).email(client.getEmail()).address(client.getAddress())
                .city(client.getCity()).state(client.getState()).zipCode(client.getZipCode())
                .notes(client.getNotes()).active(client.getActive()).createdAt(client.getCreatedAt())
                .totalVehicles(client.getVehicles() != null ? client.getVehicles().size() : 0)
                .build();
    }
}
