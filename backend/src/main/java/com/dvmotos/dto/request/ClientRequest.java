package com.dvmotos.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ClientRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 150, message = "Name must have at most 150 characters")
    private String name;
    @Size(max = 18) private String documentNumber;
    @Size(max = 20) private String phone;
    @Email(message = "Invalid email") @Size(max = 150) private String email;
    @Size(max = 255) private String address;
    @Size(max = 100) private String city;
    @Size(max = 2) private String state;
    @Size(max = 10) private String zipCode;
    private String notes;
}
