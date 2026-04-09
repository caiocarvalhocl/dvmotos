package com.dvmotos.dto.response;

import com.dvmotos.entity.Role;
import com.dvmotos.entity.User;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private Boolean active;
    private LocalDateTime createdAt;

    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .id(user.getId()).name(user.getName()).email(user.getEmail())
                .role(user.getRole()).active(user.getActive()).createdAt(user.getCreatedAt())
                .build();
    }
}
