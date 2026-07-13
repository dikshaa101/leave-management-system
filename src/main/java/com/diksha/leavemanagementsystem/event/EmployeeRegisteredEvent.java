package com.diksha.leavemanagementsystem.event;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

/**
 * Published whenever a new employee/manager account is created,
 * either via self-registration ({@code AuthService}) or via a
 * manager onboarding an employee ({@code EmployeeAccountService}).
 * <p>
 * This is an immutable, transport-only event object. It intentionally
 * carries plain data (no entities) so listeners never touch a
 * lazy-loaded JPA association outside of a transaction.
 */
@Getter
@Builder
@ToString
public class EmployeeRegisteredEvent {

    private final String employeeName;
    private final String employeeEmail;
    private final String username;
    private final String companyName;
    private final String department;
    private final String designation;
    private final String role;
}
