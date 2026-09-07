package com.project.raporlama.service;

import com.project.raporlama.entity.User;
import com.project.raporlama.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getUsersByRoleId(Integer roleId) {
        return userRepository.findByRole_Id(roleId);
    }
}