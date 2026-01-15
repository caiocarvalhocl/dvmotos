package com.dvmotos.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ClienteRequest {
    
    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
    private String nome;
    
    @Size(max = 18, message = "CPF/CNPJ deve ter no máximo 18 caracteres")
    private String cpfCnpj;
    
    @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
    private String telefone;
    
    @Email(message = "E-mail inválido")
    @Size(max = 150, message = "E-mail deve ter no máximo 150 caracteres")
    private String email;
    
    @Size(max = 255, message = "Endereço deve ter no máximo 255 caracteres")
    private String endereco;
    
    @Size(max = 100, message = "Cidade deve ter no máximo 100 caracteres")
    private String cidade;
    
    @Size(max = 2, message = "Estado deve ter 2 caracteres")
    private String estado;
    
    @Size(max = 10, message = "CEP deve ter no máximo 10 caracteres")
    private String cep;
    
    private String observacoes;
}
