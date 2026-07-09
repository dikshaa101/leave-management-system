package com.diksha.leavemanagementsystem.repository;

import com.diksha.leavemanagementsystem.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    List<Employee> findByCompanyId(Long companyId);

    Page<Employee> findByCompanyId(Long companyId,
                                   Pageable pageable);

    Page<Employee> findByCompanyIdAndDepartmentContainingIgnoreCase(
            Long companyId,
            String department,
            Pageable pageable
    );

    Optional<Employee> findByIdAndCompanyId(
            Long employeeId,
            Long companyId
    );

    List<Employee> findByCompanyIdAndDepartmentIgnoreCase(
            Long companyId,
            String department
    );

    @Query("""
    SELECT e
    FROM Employee e
    JOIN FETCH e.user
    WHERE e.email = :email
    """)
    Optional<Employee> findByEmailWithUser(@Param("email") String email);

}