package com.diksha.leavemanagementsystem.repository;

import com.diksha.leavemanagementsystem.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<Employee> findByUserUsername(String username);

    List<Employee> findByDepartmentIgnoreCase(String department);

    Page<Employee> findByDepartmentContainingIgnoreCase(
            String department,
            Pageable pageable
    );

}