package com.diksha.leavemanagementsystem.repository;

import com.diksha.leavemanagementsystem.entity.Company;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.LeaveRequest;
import com.diksha.leavemanagementsystem.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LeaveRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployee(Employee employee);

    List<LeaveRequest> findByStatus(LeaveStatus status);

    List<LeaveRequest> findByEmployeeAndStatus(Employee employee,
                                               LeaveStatus status);


    boolean existsByEmployeeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Employee employee,
            LocalDate endDate,
            LocalDate startDate
    );

    List<LeaveRequest> findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            LeaveStatus status,
            LocalDate date1,
            LocalDate date2
    );

    List<LeaveRequest> findByStatusAndEmployeeDepartmentIgnoreCaseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            LeaveStatus status,
            String department,
            LocalDate startDate,
            LocalDate endDate
    );

    List<LeaveRequest> findByEmployeeCompanyId(Long companyId);

    List<LeaveRequest> findByStatusAndEmployeeCompanyId(
            LeaveStatus status,
            Long companyId
    );

    Optional<LeaveRequest> findByIdAndEmployeeCompanyId(
            Long id,
            Long companyId
    );
    List<LeaveRequest> findByStatusAndEmployeeCompany(
            LeaveStatus status,
            Company company
    );


    List<LeaveRequest> findByEmployeeCompanyAndStatus(
            Company company,
            LeaveStatus status
    );

    List<LeaveRequest> findByEmployeeCompany(Company company);

    Optional<LeaveRequest> findByIdAndEmployeeCompany(Long id, Company company);

    List<LeaveRequest> findByEmployeeCompanyIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long companyId,
            LocalDate endDate,
            LocalDate startDate
    );

}