package com.project.raporlama.controller;

import com.project.raporlama.entity.User;
import com.project.raporlama.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173") // React portu
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/role/{roleId}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Integer roleId) {
        // Eğer UserDTO kullanıyorsan List<UserDTO> olarak da dönebilirsin
        return ResponseEntity.ok(userService.getUsersByRoleId(roleId));
    }
}